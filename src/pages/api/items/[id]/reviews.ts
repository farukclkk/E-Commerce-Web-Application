import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '../../../../lib/mongodb';
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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    const itemId = new ObjectId(id);

    // Remove both rating and review
    const result = await db.collection('items').updateOne(
      { _id: itemId },
      { 
        $pull: { 
          'ratings': { userId: session.user.id },
          'reviews': { userId: session.user.id }
        } as any
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Recalculate average rating
    const item = await db.collection('items').findOne({ _id: itemId });
    if (item && item.ratings.length > 0) {
      const averageRating = item.ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / item.ratings.length;
      await db.collection('items').updateOne(
        { _id: itemId },
        { $set: { averageRating } }
      );
    } else {
      await db.collection('items').updateOne(
        { _id: itemId },
        { $set: { averageRating: 0 } }
      );
    }

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 