require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'amank.dev21@gmail.com';
    let admin = await Admin.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Admin already exists.');
      console.log('Email:', admin.email);
      console.log('If you do not know the password, we can reset it.');
      
      // Let's reset the password to "admin123"
      admin.password = 'admin123';
      await admin.save();
      console.log('Password has been reset to: admin123');
    } else {
      admin = new Admin({
        name: 'Admin',
        email: adminEmail,
        password: 'admin123'
      });
      await admin.save();
      console.log('Admin created.');
      console.log('Email:', adminEmail);
      console.log('Password: admin123');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
