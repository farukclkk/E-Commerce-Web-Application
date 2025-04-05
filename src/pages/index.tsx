import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  image: string;
  imageUrl: string;
  averageRating: number;
  batteryLife?: number;
  age?: number;
  size?: string;
  material?: string;
  ratings: {
    userId: string;
    rating: number;
  }[];
}

export default function Home() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const fetchItems = async () => {
    try {
      const query = selectedCategory === 'all' ? '' : `?category=${selectedCategory}`;
      const response = await fetch(`/api/items${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'all',
    'Vinyls',
    'Antique Furniture',
    'GPS Sport Watches',
    'Running Shoes',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:mb-0">Discover Items</h1>
          {session?.user.isAdmin && (
            <Link
              href="/admin/items/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Add New Item
            </Link>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                {category === 'all' ? 'All Items' : category}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/items/${item._id}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={400}
                  height={300}
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                  {item.name}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="text-sm font-medium text-gray-700">
                      {(item.averageRating || 0).toFixed(1)} ({item.ratings.length})
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Seller:</span>
                    {item.seller}
                  </p>
                  {item.batteryLife && (
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Battery Life:</span>
                      {item.batteryLife} hours
                    </p>
                  )}
                  {item.age && (
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Age:</span>
                      {item.age} years
                    </p>
                  )}
                  {item.size && (
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Size:</span>
                      {item.size}
                    </p>
                  )}
                  {item.material && (
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Material:</span>
                      {item.material}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}