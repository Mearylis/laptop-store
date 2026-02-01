const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Laptop = require('./src/models/Laptop');
const Category = require('./src/models/Category');
const User = require('./src/models/User');
const Order = require('./src/models/Order');

dotenv.config();

const sampleCategories = [
    { name: 'Ultrabooks', slug: 'ultrabooks', description: 'Thin and light laptops', isActive: true },
    { name: 'Gaming', slug: 'gaming', description: 'High performance gaming laptops', isActive: true },
    { name: 'Business', slug: 'business', description: 'Professional workstations', isActive: true },
    { name: 'Student', slug: 'student', description: 'Affordable laptops for students', isActive: true }
];

const getLaptops = (catIds) => [
    // Ultrabooks
    {
        brand: 'Apple', model: 'MacBook Air M2', category: catIds[0], price: 1199, stock: 50,
        specifications: { processor: 'M2', ram: '8GB', storage: '256GB SSD', display: '13.6 Retina', os: 'macOS' },
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800'],
        sku: 'APP-MBA-M2', description: 'Supercharged by M2 chip.', isActive: true
    },
    {
        brand: 'Apple', model: 'MacBook Pro 14', category: catIds[0], price: 1999, stock: 40,
        specifications: { processor: 'M2 Pro', ram: '16GB', storage: '512GB SSD', display: '14 Liquid Retina XDR', os: 'macOS' },
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800'],
        sku: 'APP-MBP-14', description: 'Power for pros.', isActive: true
    },
    {
        brand: 'Dell', model: 'XPS 13 Plus', category: catIds[0], price: 1399, stock: 35,
        specifications: { processor: 'i7-1260P', ram: '16GB', storage: '512GB SSD', display: '13.4 OLED', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1593642632823-8f78536788c6?auto=format&fit=crop&w=800'],
        sku: 'DEL-XPS-13P', description: 'Minimalist design.', isActive: true
    },
    {
        brand: 'Asus', model: 'ZenBook S 13', category: catIds[0], price: 1099, stock: 25,
        specifications: { processor: 'Ryzen 7 6800U', ram: '16GB', storage: '1TB SSD', display: '13.3 OLED', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1588872657578-838c64708169?auto=format&fit=crop&w=800'],
        sku: 'ASU-ZEN-S13', description: 'World\'s lightest OLED laptop.', isActive: true
    },
    {
        brand: 'HP', model: 'Spectre x360', category: catIds[0], price: 1299, stock: 30,
        specifications: { processor: 'i7-1255U', ram: '16GB', storage: '512GB SSD', display: '13.5 Touch', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?auto=format&fit=crop&w=800'],
        sku: 'HP-SPEC-360', description: 'Examples of elegance.', isActive: true
    },

    // Gaming
    {
        brand: 'Asus', model: 'ROG Zephyrus G14', category: catIds[1], price: 1499, stock: 20,
        specifications: { processor: 'Ryzen 9 6900HS', ram: '16GB', storage: '1TB SSD', display: '14 120Hz', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800'],
        sku: 'ASU-ROG-G14', description: 'Compact power.', isActive: true
    },
    {
        brand: 'MSI', model: 'Raider GE76', category: catIds[1], price: 2499, stock: 15,
        specifications: { processor: 'i9-12900HK', ram: '32GB', storage: '2TB SSD', display: '17.3 360Hz', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800'],
        sku: 'MSI-RAI-GE76', description: 'Ultimate gaming desktop replacement.', isActive: true
    },
    {
        brand: 'Razer', model: 'Blade 15', category: catIds[1], price: 2999, stock: 10,
        specifications: { processor: 'i7-12800H', ram: '32GB', storage: '1TB SSD', display: '15.6 240Hz', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?auto=format&fit=crop&w=800'],
        sku: 'RAZ-BLD-15', description: 'Fast. Thin.', isActive: true
    },
    {
        brand: 'Lenovo', model: 'Legion 5 Pro', category: catIds[1], price: 1399, stock: 45,
        specifications: { processor: 'Ryzen 7 5800H', ram: '16GB', storage: '512GB SSD', display: '16 QHD 165Hz', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1616588589676-60b30c3c1681?auto=format&fit=crop&w=800'],
        sku: 'LEN-LEG-5P', description: 'Stylish and savage.', isActive: true
    },
    {
        brand: 'Acer', model: 'Predator Helios 300', category: catIds[1], price: 1199, stock: 25,
        specifications: { processor: 'i7-11800H', ram: '16GB', storage: '512GB SSD', display: '15.6 144Hz', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1555618568-1554972580a1?auto=format&fit=crop&w=800'],
        sku: 'ACR-PRE-300', description: 'Ignite fusion.', isActive: true
    },

    // Business
    {
        brand: 'Lenovo', model: 'ThinkPad X1 Carbon', category: catIds[2], price: 1699, stock: 60,
        specifications: { processor: 'i7-1260P', ram: '16GB', storage: '512GB SSD', display: '14 IPS', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&w=800'],
        sku: 'LEN-THK-X1', description: 'Legendary reliability.', isActive: true
    },
    {
        brand: 'Dell', model: 'Latitude 7420', category: catIds[2], price: 1549, stock: 40,
        specifications: { processor: 'i5-1145G7', ram: '16GB', storage: '256GB SSD', display: '14 FHD', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1588872657578-838c64708169?auto=format&fit=crop&w=800'],
        sku: 'DEL-LAT-742', description: 'Premium business workhorse.', isActive: true
    },
    {
        brand: 'HP', model: 'EliteBook 840 G9', category: catIds[2], price: 1449, stock: 35,
        specifications: { processor: 'i5-1240P', ram: '16GB', storage: '512GB SSD', display: '14 WUXGA', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800'],
        sku: 'HP-ELT-840', description: 'Remove barriers to hybrid work.', isActive: true
    },
    {
        brand: 'Apple', model: 'MacBook Pro 16', category: catIds[2], price: 2499, stock: 20,
        specifications: { processor: 'M2 Max', ram: '32GB', storage: '1TB SSD', display: '16 Liquid Retina XDR', os: 'macOS' },
        images: ['https://images.unsplash.com/photo-1531297461136-82lwDe83a917?auto=format&fit=crop&w=800'],
        sku: 'APP-MBP-16', description: 'Mover. Maker. Boundary breaker.', isActive: true
    },
    {
        brand: 'Microsoft', model: 'Surface Laptop 5', category: catIds[2], price: 1299, stock: 30,
        specifications: { processor: 'i7-1255U', ram: '16GB', storage: '512GB SSD', display: '13.5 PixelSense', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800'],
        sku: 'MS-SRF-L5', description: 'Style and speed.', isActive: true
    },

    // Student
    {
        brand: 'Acer', model: 'Aspire 5', category: catIds[3], price: 549, stock: 100,
        specifications: { processor: 'i5-1235U', ram: '8GB', storage: '256GB SSD', display: '15.6 FHD', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800'],
        sku: 'ACR-ASP-5', description: 'Powerful everyday computing.', isActive: true
    },
    {
        brand: 'Lenovo', model: 'IdeaPad 3', category: catIds[3], price: 449, stock: 80,
        specifications: { processor: 'Ryzen 5 5625U', ram: '8GB', storage: '256GB SSD', display: '15.6 FHD', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1618424181497-157f2c908584?auto=format&fit=crop&w=800'],
        sku: 'LEN-IDP-3', description: 'Tailored for performance.', isActive: true
    },
    {
        brand: 'HP', model: 'Pavilion 15', category: catIds[3], price: 649, stock: 60,
        specifications: { processor: 'i5-1235U', ram: '12GB', storage: '512GB SSD', display: '15.6 FHD', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1589561084283-930aa7b1ce50?auto=format&fit=crop&w=800'],
        sku: 'HP-PAV-15', description: 'Works anywhere. Plays everywhere.', isActive: true
    },
    {
        brand: 'Dell', model: 'Inspiron 15', category: catIds[3], price: 599, stock: 70,
        specifications: { processor: 'i5-1135G7', ram: '8GB', storage: '256GB SSD', display: '15.6 FHD', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1575024357670-2b5164f470c3?auto=format&fit=crop&w=800'],
        sku: 'DEL-INS-15', description: 'Daily to-do\'s, done.', isActive: true
    },
    {
        brand: 'Asus', model: 'VivoBook 15', category: catIds[3], price: 499, stock: 90,
        specifications: { processor: 'i3-1215U', ram: '8GB', storage: '128GB SSD', display: '15.6 FHD', os: 'Windows 11' },
        images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800'],
        sku: 'ASU-VIV-15', description: 'Make every day your day.', isActive: true
    }
];

const fixDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear ALL existing data
        await Promise.all([
            Order.deleteMany({}),
            Laptop.deleteMany({}),
            Category.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('🗑️ CLEARED ALL DATA (Orders, Laptops, Users, Categories)');

        // Create Categories
        const createdCategories = await Category.insertMany(sampleCategories);
        const categoryIds = createdCategories.map(cat => cat._id);
        const ultraCat = createdCategories.find(c => c.slug === 'ultrabooks')._id;
        const gamingCat = createdCategories.find(c => c.slug === 'gaming')._id;
        const businessCat = createdCategories.find(c => c.slug === 'business')._id;
        const studentCat = createdCategories.find(c => c.slug === 'student')._id;

        // Create Laptops
        const laptopsData = getLaptops([ultraCat, gamingCat, businessCat, studentCat]);
        const laptops = await Laptop.insertMany(laptopsData);
        console.log(`💻 Created ${laptops.length} laptops.`);

        // Create Admin User
        const passwordHash = await bcrypt.hash('admin123', 10); // same pwd for both simplicity
        const admin = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: passwordHash,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            profile: { phone: '1234567890' }
        });

        // Create Customer User
        const customerHash = await bcrypt.hash('customer123', 10);
        const customer = await User.create({
            username: 'customer',
            email: 'customer@example.com',
            passwordHash: customerHash,
            firstName: 'John',
            lastName: 'Doe',
            role: 'customer',
            profile: { phone: '0987654321' }
        });

        // Create Orders for Dashboard Visualization
        const laptop1 = laptops[0];
        const laptop2 = laptops[5];

        const order1 = new Order({
            orderNumber: 'ORD-' + Math.floor(Math.random() * 100000),
            userId: customer._id,
            items: [{
                laptopId: laptop1._id,
                brand: laptop1.brand, // REQUIRED FIELD
                model: laptop1.model, // REQUIRED FIELD
                quantity: 1,
                priceAtPurchase: laptop1.price
            }],
            shippingAddress: {
                street: '123 Test St', city: 'Test City', country: 'Testland', zipCode: '12345'
            },
            payment: {
                method: 'credit_card', // REQUIRED FIELD
                status: 'completed',
                amount: laptop1.price
            },
            subtotal: laptop1.price, // REQUIRED FIELD
            total: laptop1.price,
            status: 'delivered' // Visible in stats
        });
        await order1.save();

        const order2 = new Order({
            orderNumber: 'ORD-' + Math.floor(Math.random() * 100000),
            userId: customer._id,
            items: [{
                laptopId: laptop2._id,
                brand: laptop2.brand,
                model: laptop2.model,
                quantity: 2,
                priceAtPurchase: laptop2.price
            }],
            shippingAddress: {
                street: '456 Sample Ave', city: 'Sampletown', country: 'Sampleland', zipCode: '67890'
            },
            payment: {
                method: 'paypal',
                status: 'pending',
                amount: laptop2.price * 2
            },
            subtotal: laptop2.price * 2,
            total: laptop2.price * 2,
            status: 'pending' // Visible in Pending stats
        });
        await order2.save();

        console.log('📦 Created 2 test orders for dashboard visualization.');

        console.log('✨ Database reset and seeded successfully!');
        console.log('👉 Admin: admin@example.com / admin123');
        console.log('👉 Customer: customer@example.com / customer123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing database:', error);
        process.exit(1);
    }
};

fixDatabase();
