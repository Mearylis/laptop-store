const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const verifyFixes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('laptops');
        const sku1 = 'TEST-FIX-CAT-' + Date.now();
        const sku2 = 'TEST-FIX-PRICE-' + Date.now();

        console.log('🔬 Injecting bad data...');
        await collection.insertMany([
            {
                brand: 'TestBrand',
                model: 'Broken Category',
                sku: sku1,
                category: 'Gaming', // Error: String instead of ObjectId
                price: 1000,
                stock: 5,
                images: [],
                isActive: true
            },
            {
                brand: 'TestBrand',
                model: 'Broken Price',
                sku: sku2,
                category: new mongoose.Types.ObjectId(), // Valid ObjectId (fake)
                price: "1,500.00", // Error: String instead of Number
                stock: "10 pieces", // Error: String instead of Number
                images: [],
                isActive: true
            }
        ]);

        console.log('⏳ Triggering Auto-Fixer...');
        const { fixLaptopCategories } = require('./src/utils/autoFix');
        await fixLaptopCategories();

        console.log('🔍 Verifying results...');
        const doc1 = await collection.findOne({ sku: sku1 });
        const doc2 = await collection.findOne({ sku: sku2 });

        let success = true;

        if (typeof doc1.category === 'object') {
            console.log('✅ doc1: Category fixed to ObjectId');
        } else {
            console.error('❌ doc1: Category failed fix');
            success = false;
        }

        if (typeof doc2.price === 'number' && doc2.price === 1500) {
            console.log(`✅ doc2: Price fixed to number (${doc2.price})`);
        } else {
            console.error(`❌ doc2: Price failed fix (${typeof doc2.price}: ${doc2.price})`);
            success = false;
        }

        if (typeof doc2.stock === 'number' && doc2.stock === 10) {
            console.log(`✅ doc2: Stock fixed to number (${doc2.stock})`);
        } else {
            console.error(`❌ doc2: Stock failed fix (${typeof doc2.stock}: ${doc2.stock})`);
            success = false;
        }

        // Cleanup
        await collection.deleteMany({ sku: { $in: [sku1, sku2] } });

        if (!success) process.exit(1);
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verifyFixes();
