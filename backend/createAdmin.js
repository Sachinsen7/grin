require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const admin = require('./models/admin.model');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.URL, {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB');

        // Admin credentials
        const username = 'newadmin';
        const password = 'newadmin123';
        const name = 'New Administrator';

        // Check if admin already exists
        const existingAdmin = await admin.findOne({ username });
        if (existingAdmin) {
            console.log(`Admin with username "${username}" already exists`);
            console.log('Updating password...');

            // Update the password
            const hashPassword = await bcrypt.hash(password, 12);
            existingAdmin.password = hashPassword;
            existingAdmin.name = name;
            await existingAdmin.save();

            console.log('✓ Admin password updated successfully!');
            console.log('Username:', username);
            console.log('Password:', password);
            process.exit(0);
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 12);

        // Create new admin
        const newAdmin = new admin({
            name,
            username,
            password: hashPassword
        });

        await newAdmin.save();
        console.log('✓ Admin created successfully!');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('\nPlease change the password after first login.');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
