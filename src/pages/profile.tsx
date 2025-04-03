import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface UserProfile {
  username: string;
  averageRating: number;
  numberOfRatings: number;
  reviews: Array<{
    itemId: string;
    itemName: string;
    rating: number;
    text: string;
    createdAt: string;
  }>;
}

export default function Profile() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleDeleteReview = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}/reviews`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Refresh profile data
      const profileResponse = await fetch('/api/users/me');
      if (!profileResponse.ok) {
        throw new Error('Failed to refresh profile data');
      }
      const profileData = await profileResponse.json();
      setProfile(profileData);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Please sign in to view your profile</h1>
          <button
            onClick={() => router.push('/auth/signin')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image
                  src={`https://picsum.photos/seed/${session.user.username}/200/200`}
                  alt={session.user.username}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{session.user.username}</h1>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-400 text-xl">★</span>
                  <span className="ml-2 text-gray-600">
                    {profile.averageRating.toFixed(1)} ({profile.numberOfRatings})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Reviews</h2>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            {profile.reviews.length === 0 ? (
              <p className="text-gray-500">You haven't written any reviews yet</p>
            ) : (
              <div className="space-y-4">
                {[...profile.reviews]
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
                      href={`/items/${review.itemId}`}
                      className="text-blue-600 hover:text-blue-800 font-medium mb-2 block"
                    >
                      {review.itemName}
                    </Link>
                    {review.text && (
                      <p className="text-gray-600">{review.text}</p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDeleteReview(review.itemId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
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