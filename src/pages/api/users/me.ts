import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { db } = await connectToDatabase();

  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all items the user has rated or reviewed
    const items = await db.collection('items').find({
      $or: [
        { 'ratings.userId': session.user.id },
        { 'reviews.userId': session.user.id }
      ]
    }).toArray();

    // Calculate average rating and get reviews
    const reviews = items.flatMap(item => {
      const rating = item.ratings?.find((r: any) => r.userId === session.user.id);
      const review = item.reviews?.find((r: any) => r.userId === session.user.id);
      
      if (!rating) return [];
      
      return [{
        itemId: item._id.toString(),
        itemName: item.name,
        rating: rating.rating,
        text: review?.text || '',
        createdAt: review?.createdAt || rating.createdAt
      }];
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return res.status(200).json({
      username: user.username,
      averageRating,
      numberOfRatings: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 