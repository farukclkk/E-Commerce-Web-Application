import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  image: string;
  averageRating: number;
  ratings: Array<{
    userId: string;
    username: string;
    rating: number;
    createdAt: string;
  }>;
  reviews: Array<{
    userId: string;
    username: string;
    text: string;
    createdAt: string;
    rating: number;
  }>;
  batteryLife?: number;
  age?: number;
  size?: string;
  material?: string;
}

export default function ItemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { id } = router.query;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | ''>('');
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch item');
      }
      const data = await response.json();
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rating, review }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit rating');
      }

      await fetchItem();
      setRating(5);
      setReview('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${id}/reviews`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Refresh item data
      await fetchItem();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Item not found</h1>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <div className="relative h-64 w-full md:h-full md:w-96">
                <Image
                  src={`https://picsum.photos/seed/${item._id}/400/400`}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.name}
              </h1>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  ${item.price.toFixed(2)}
                </span>
                <div className="flex items-center ml-8">
                  <span className="text-yellow-400 text-2xl">★</span>
                  <span className="ml-2 text-gray-600">
                    {(item.averageRating || 0).toFixed(1)} ({item.ratings.length})
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-6">
                <p>Seller: {item.seller}</p>
                {item.batteryLife && (
                  <p>Battery Life: {item.batteryLife} hours</p>
                )}
                {item.age && <p>Age: {item.age} years</p>}
                {item.size && <p>Size: {item.size}</p>}
                {item.material && <p>Material: {item.material}</p>}
              </div>

              {session && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="rating"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rating
                    </label>
                    <select
                      id="rating"
                      value={rating}
                      onChange={(e) => setRating(e.target.value ? Number(e.target.value) : '')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select a rating</option>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} {value === 1 ? 'star' : 'stars'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="review"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Review (optional)
                    </label>
                    <textarea
                      id="review"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Reviews ({item.reviews.length})
              </h2>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            {item.reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {[...item.reviews]
                  .sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                  })
                  .map((review, index) => (
                  <div key={index} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-2 text-gray-600">{review.rating}</span>
                    </div>
                    <Link
                      href={`/users/${review.username}`}
                      className="text-blue-600 hover:text-blue-800 font-medium mb-2 block"
                    >
                      {review.username}
                    </Link>
                    {review.text && (
                      <p className="text-gray-600">{review.text}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      {session?.user?.id === review.userId && (
                        <button
                          onClick={handleDeleteReview}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 