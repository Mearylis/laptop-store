const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Laptop = require('./src/models/Laptop');
const Category = require('./src/models/Category');
const User = require('./src/models/User');

dotenv.config();

const sampleCategories = [
    { name: 'Ultrabooks', slug: 'ultrabooks', description: 'Thin and light laptops', isActive: true },
    { name: 'Gaming', slug: 'gaming', description: 'High performance gaming laptops', isActive: true },
    { name: 'Business', slug: 'business', description: 'Professional workstations', isActive: true },
    { name: 'Student', slug: 'student', description: 'Affordable laptops for students', isActive: true }
];

const sampleLaptops = (categoryIds) => [
    {
        brand: 'Apple',
        model: 'MacBook Air M2',
        category: categoryIds[0],
        price: 1199,
        stock: 50,
        specifications: { processor: 'M2', ram: '8GB', storage: '256GB SSD', display: '13.6 Retina' },
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1000&auto=format&fit=crop'],
        sku: 'APP-MBA-M2',
        description: 'Supercharged by M2 chip.',
        isActive: true
    },
    {
        brand: 'Dell',
        model: 'XPS 15',
        category: categoryIds[2],
        price: 1899,
        stock: 30,
        specifications: { processor: 'i9-12900H', ram: '32GB', storage: '1TB SSD', display: '15.6 4K OLED' },
        images: ['https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=1000&auto=format&fit=crop'],
        sku: 'DEL-XPS-15',
        description: 'Designed to be the best.',
        isActive: true
    },
    {
        brand: 'Asus',
        model: 'ROG Zephyrus G14',
        category: categoryIds[1],
        price: 1499,
        stock: 20,
        specifications: { processor: 'Ryzen 9', ram: '16GB', storage: '1TB SSD', display: '14 120Hz' },
        images: ['https://images.unsplash.com/photo-1626218174297-4118f88a816d?q=80&w=1000&auto=format&fit=crop'],
        sku: 'ASU-ROG-G14',
        description: 'World\'s most powerful 14-inch gaming laptop.',
        isActive: true
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            Laptop.deleteMany({}),
            Category.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('🗑️ Cleared existing data');

        // Create Categories
        const createdCategories = await Category.insertMany(sampleCategories);
        const categoryIds = createdCategories.map(cat => cat._id);
        console.log(`📂 Created ${createdCategories.length} categories`);

        // Create Laptops
        const laptops = sampleLaptops(categoryIds);
        await Laptop.insertMany(laptops);
        console.log(`💻 Created ${laptops.length} laptops`);

        // Create Admin User
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: 'admin123', // Will be hashed by pre-save hook
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            profile: { phone: '1234567890' }
        });
        console.log('👤 Created admin user (email: admin@example.com, pass: admin123)');

        const laptopCount = await Laptop.countDocuments();
        console.log(`📊 Total Laptops in DB: ${laptopCount}`);

        console.log('✨ Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error Seeding Database:', error);
        process.exit(1);
    }
};

seedDatabase();
