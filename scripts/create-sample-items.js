const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const sampleItems = [
  {
    name: 'The Dark Side of the Moon - Pink Floyd',
    description: 'Original 1973 vinyl pressing in excellent condition',
    price: 299.99,
    category: 'Vinyls',
    seller: 'admin',
    averageRating: 0,
    ratings: [],
    reviews: [],
    batteryLife: null,
    age: 50,
    size: null,
    material: 'Vinyl'
  },
  {
    name: 'Victorian Era Mahogany Desk',
    description: 'Beautifully preserved Victorian-era writing desk with intricate carvings',
    price: 1299.99,
    category: 'Antique Furniture',
    seller: 'admin',
    averageRating: 0,
    ratings: [],
    reviews: [],
    batteryLife: null,
    age: 150,
    size: '120x60x75 cm',
    material: 'Mahogany'
  },
  {
    name: 'Garmin Fenix 7X Solar',
    description: 'Advanced multisport GPS watch with solar charging',
    price: 799.99,
    category: 'GPS Sport Watches',
    seller: 'admin',
    averageRating: 0,
    ratings: [],
    reviews: [],
    batteryLife: '28 days',
    age: 1,
    size: '51mm',
    material: 'Titanium'
  },
  {
    name: 'Nike ZoomX Vaporfly Next% 2',
    description: 'Elite racing shoe with carbon fiber plate',
    price: 249.99,
    category: 'Running Shoes',
    seller: 'admin',
    averageRating: 0,
    ratings: [],
    reviews: [],
    batteryLife: null,
    age: 0,
    size: 'US 7-13',
    material: 'ZoomX Foam'
  }
];

async function createSampleItems() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('ecommerce');
    const items = db.collection('items');

    // Check if items already exist
    const existingItems = await items.countDocuments();
    if (existingItems > 0) {
      console.log('Items already exist in the database');
      return;
    }

    // Insert sample items
    const result = await items.insertMany(sampleItems);
    console.log('Sample items created successfully:', result.insertedIds);
  } catch (error) {
    console.error('Error creating sample items:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

createSampleItems(); 