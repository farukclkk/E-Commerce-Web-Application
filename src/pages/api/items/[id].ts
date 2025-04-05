import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { db } = await connectToDatabase();
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid item ID' });
  }

  try {
    const itemId = new ObjectId(id);

    switch (req.method) {
      case 'GET':
        const foundItem = await db.collection('items').findOne({ _id: itemId });

        if (!foundItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        // Get usernames for all ratings
        const userIds = new Set<string | number>(foundItem.ratings?.map((r: any) => r.userId) || []);
        const users = await db.collection('users')
          .find({ _id: { $in: Array.from<string | number>(userIds).map(id => new ObjectId(id.toString())) } })
          .project({ _id: 1, username: 1 })
          .toArray();

        const userMap = new Map(users.map(u => [u._id.toString(), u.username]));

        // Get all reviews and ratings with usernames
        const reviews = foundItem.ratings.map((rating: any) => {
          const review = foundItem.reviews.find((r: any) => r.userId === rating.userId);
          return {
            userId: rating.userId,
            username: userMap.get(rating.userId.toString()),
            rating: rating.rating,
            text: review?.text || '',
            createdAt: review?.createdAt || rating.createdAt
          };
        });

        return res.status(200).json({
          ...foundItem,
          reviews
        });

      case 'POST':
        // Authentication check for POST operations
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 10) {
          return res.status(400).json({ message: 'Invalid rating' });
        }

        const existingItem = await db.collection('items').findOne({ _id: itemId });

        if (!existingItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        // Check if user has already rated this item
        const existingRating = existingItem.ratings?.find(
          (r: { userId: string }) => r.userId === session.user.id
        );

        if (existingRating) {
          // Update existing rating
          await db.collection('items').updateOne(
            { 
              _id: itemId,
              'ratings.userId': session.user.id
            },
            { 
              $set: { 
                'ratings.$[elem].rating': rating,
                'ratings.$[elem].createdAt': new Date(),
                updatedAt: new Date()
              }
            },
            {
              arrayFilters: [{ 'elem.userId': session.user.id }]
            }
          );

          // Handle review separately if provided
          if (review !== undefined) {
            const existingReview = existingItem.reviews?.find(
              (r: { userId: string }) => r.userId === session.user.id
            );

            if (existingReview) {
              await db.collection('items').updateOne(
                { 
                  _id: itemId,
                  'reviews.userId': session.user.id
                },
                { 
                  $set: { 
                    'reviews.$[rev].text': review,
                    'reviews.$[rev].createdAt': new Date()
                  }
                },
                {
                  arrayFilters: [{ 'rev.userId': session.user.id }]
                }
              );
            } else if (review) {
              await db.collection('items').updateOne(
                { _id: itemId },
                {
                  $push: {
                    'reviews': {
                      userId: session.user.id,
                      text: review,
                      createdAt: new Date(),
                    }
                  } as any
                }
              );
            }
          }
        } else {
          // Add new rating and review
          const update: any = {
            $push: { 
              ratings: {
                userId: session.user.id,
                rating,
                createdAt: new Date(),
              }
            },
            $set: { updatedAt: new Date() }
          };

          if (review) {
            update.$push.reviews = {
              userId: session.user.id,
              text: review,
              createdAt: new Date(),
            };
          }

          await db.collection('items').updateOne({ _id: itemId }, update);
        }

        // Recalculate average rating
        const updatedItem = await db.collection('items').findOne({ _id: itemId });

        if (!updatedItem) {
          return res.status(404).json({ message: 'Item not found' });
        }

        const averageRating =
          updatedItem.ratings.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) /
          updatedItem.ratings.length;

        await db.collection('items').updateOne(
          { _id: itemId },
          { $set: { averageRating } }
        );

        return res.status(200).json({ message: 'Rating added successfully' });

      case 'DELETE':
        // Authentication check for DELETE operations
        const deleteSession = await getServerSession(req, res, authOptions);
        if (!deleteSession?.user.isAdmin) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        const deleteResult = await db.collection('items').deleteOne({ _id: itemId });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'Item not found' });
        }

        return res.status(200).json({ message: 'Item deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error handling item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}