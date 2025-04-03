const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('ecommerce');
    const users = db.collection('users');

    // Find admin user
    const adminUser = await users.findOne({ username: 'admin' });
    
    if (adminUser) {
      console.log('Admin user found:', {
        username: adminUser.username,
        isAdmin: adminUser.isAdmin,
        createdAt: adminUser.createdAt
      });
    } else {
      console.log('Admin user not found!');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

checkAdminUser(); 