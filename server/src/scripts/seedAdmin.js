
require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_cms');
    console.log('MongoDB Connected');

    const adminExists = await Admin.findOne({ email: 'admin@example.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new Admin({
      email: 'admin@example.com',
      password: 'password123',
      name: 'System Admin'
    });

    await admin.save();
    console.log('Admin user created successfully (admin@example.com / password123)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
