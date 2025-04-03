import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    console.log('API Route - Session:', session);

    if (req.method === 'GET') {
      const { db } = await connectToDatabase();
      const { category } = req.query;
      const query = category ? { category } : {};
      const items = await db.collection('items').find(query).toArray();
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      if (!session) {
        console.error('No session found');
        return res.status(401).json({ message: 'Not authenticated' });
      }

      if (!session.user?.isAdmin) {
        console.error('User is not admin:', session.user);
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { db } = await connectToDatabase();
      const item = {
        ...req.body,
        seller: session.user.username,
        createdAt: new Date(),
        updatedAt: new Date(),
        ratings: [],
        reviews: [],
        averageRating: 0,
      };
      console.log('Creating new item:', item);
      const result = await db.collection('items').insertOne(item);
      return res.status(201).json({ id: result.insertedId, ...item });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 