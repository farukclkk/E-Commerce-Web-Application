import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

interface Rating {
  userId: string;
  rating: number;
  createdAt: string;
}

interface Review {
  userId: string;
  text: string;
  createdAt: string;
}

interface Item {
  _id: string;
  name: string;
  ratings: Rating[];
  reviews: Review[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }

  try {
    const { db } = await connectToDatabase();

    switch (req.method) {
      case 'GET':
        if (!session) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        // Find user by username
        const user = await db.collection('users').findOne({ username });
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Only allow viewing admin profiles if the viewer is also an admin
        if (user.isAdmin && !session.user.isAdmin) {
          return res.status(403).json({ message: 'Not authorized to view admin profiles' });
        }

        // Get all items that have ratings/reviews from this user
        const items = (await db.collection('items').find({
          $or: [
            { 'ratings.userId': user._id.toString() },
            { 'reviews.userId': user._id.toString() }
          ]
        }).toArray()) as unknown as Item[];

        // Calculate average rating
        const ratings = items.flatMap(item => 
          item.ratings.filter((r: Rating) => r.userId === user._id.toString())
        );
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r: Rating) => sum + r.rating, 0) / ratings.length
          : 0;

        // Get all reviews and ratings
        const reviews = items.flatMap(item => {
          const userRating = item.ratings.find((r: Rating) => r.userId === user._id.toString());
          const userReview = item.reviews.find((r: Review) => r.userId === user._id.toString());
          
          // Include all ratings, even if there's no review
          return [{
            itemId: item._id,
            itemName: item.name,
            rating: userRating?.rating || 0,
            text: userReview?.text || '',
            createdAt: userReview?.createdAt || userRating?.createdAt || new Date().toISOString()
          }];
        });

        return res.status(200).json({
          username: user.username,
          averageRating,
          numberOfRatings: ratings.length,
          reviews
        });

      case 'DELETE':
        if (!session?.user?.isAdmin) {
          return res.status(403).json({ message: 'Not authorized' });
        }

        // Find user by username
        const userToDelete = await db.collection('users').findOne({ username });
        if (!userToDelete) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting the last admin user
        if (userToDelete.isAdmin) {
          const adminCount = await db.collection('users').countDocuments({ isAdmin: true });
          if (adminCount <= 1) {
            return res.status(400).json({ message: 'Cannot delete the last admin user' });
          }
        }

        // Find all items with user's ratings or reviews
        const userItems = (await db.collection('items').find({
          $or: [
            { 'ratings.userId': userToDelete._id.toString() },
            { 'reviews.userId': userToDelete._id.toString() }
          ]
        }).toArray()) as unknown as Item[];

        // Update each item to remove user's ratings and reviews
        for (const item of userItems) {
          const updatedRatings = item.ratings.filter(r => r.userId.toString() !== userToDelete._id.toString());
          const updatedReviews = item.reviews.filter(r => r.userId.toString() !== userToDelete._id.toString());
          
          // Calculate new average rating
          const newAverageRating = updatedRatings.length > 0
            ? updatedRatings.reduce((sum, r) => sum + r.rating, 0) / updatedRatings.length
            : 0;
          
          await db.collection('items').updateOne(
            { _id: new ObjectId(item._id) },
            {
              $set: {
                ratings: updatedRatings,
                reviews: updatedReviews,
                averageRating: newAverageRating
              }
            }
          );
        }

        // Delete the user
        const result = await db.collection('users').deleteOne({ _id: userToDelete._id });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling user operation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 