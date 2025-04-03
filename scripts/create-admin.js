const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('ecommerce');
    const users = db.collection('users');

    // Check if admin user already exists
    const existingAdmin = await users.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };

    const result = await users.insertOne(adminUser);
    console.log('Admin user created successfully:', result.insertedId);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser(); 