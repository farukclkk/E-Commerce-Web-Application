import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.isAdmin) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase();
      const users = await db.collection('users')
        .find({}, { projection: { password: 0 } })
        .toArray();
      return res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { username, password, isAdmin } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const { db } = await connectToDatabase();

      // Check if username already exists
      const existingUser = await db.collection('users').findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.collection('users').insertOne({
        username,
        password: hashedPassword,
        isAdmin: isAdmin || false,
        createdAt: new Date(),
      });

      return res.status(201).json({
        _id: result.insertedId,
        username,
        isAdmin: isAdmin || false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 