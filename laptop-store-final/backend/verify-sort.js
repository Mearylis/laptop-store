const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const verifySortFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const collection = mongoose.connection.db.collection('laptops');
        const sku = 'TEST-SORT-FIX-' + Date.now();

        console.log('🔬 Injecting item without date...');
        await collection.insertOne({
            brand: 'TestBrand',
            model: 'Invisible Laptop',
            sku: sku,
            category: new mongoose.Types.ObjectId(),
            price: 999,
            stock: 99,
            images: [],
            isActive: true
            // NO createdAt/updatedAt
        });

        console.log('⏳ Triggering Auto-Fixer...');
        const { fixLaptopCategories } = require('./src/utils/autoFix');
        await fixLaptopCategories();

        console.log('🔍 Verifying results...');
        const doc = await collection.findOne({ sku: sku });

        if (doc.createdAt && doc.createdAt instanceof Date) {
            console.log(`✅ Success: Item received createdAt: ${doc.createdAt.toISOString()}`);
        } else {
            console.error('❌ Failure: CreatingAt missing or invalid');
            process.exit(1);
        }

        await collection.deleteOne({ sku: sku });
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verifySortFix();
