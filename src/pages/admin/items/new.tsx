import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function NewItem() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    batteryLife: '',
    age: '',
    size: '',
    material: '',
    imageUrl: '',
    seller: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !session?.user?.isAdmin) {
      router.push('/');
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.isAdmin) {
      setError('Unauthorized');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          batteryLife: formData.batteryLife ? Number(formData.batteryLife) : undefined,
          age: formData.age ? Number(formData.age) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create item');
      }

      await router.push('/admin');
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && !session?.user?.isAdmin)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Please sign in to continue</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Seller</label>
          <input
            type="text"
            name="seller"
            value={formData.seller}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select a category</option>
            <option value="Vinyls">Vinyls</option>
            <option value="Antique Furniture">Antique Furniture</option>
            <option value="GPS Sport Watches">GPS Sport Watches</option>
            <option value="Running Shoes">Running Shoes</option>
          </select>
        </div>

        {(formData.category === 'GPS Sport Watches') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Battery Life (hours)</label>
            <input
              type="number"
              name="batteryLife"
              value={formData.batteryLife}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {(formData.category === 'Antique Furniture' || formData.category === 'Vinyls') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Age (years)</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {(formData.category === 'Running Shoes') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              placeholder="e.g., 35-44"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {(formData.category === 'Antique Furniture' || formData.category === 'Running Shoes') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Material</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
}