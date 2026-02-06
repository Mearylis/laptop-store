const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const diagnose = async () => {
    try {
        console.log('🔌 Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);

        const dbName = mongoose.connection.db.databaseName;
        console.log(`📂 Database Name: "${dbName}"`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📚 Collections:', collections.map(c => c.name).join(', '));

        const laptopCount = await mongoose.connection.db.collection('laptops').countDocuments();
        console.log(`💻 Laptops Count: ${laptopCount}`);

        const categoryCount = await mongoose.connection.db.collection('categories').countDocuments();
        console.log(`🏷️ Categories Count: ${categoryCount}`);

        if (laptopCount > 0) {
            const lastLaptop = await mongoose.connection.db.collection('laptops').find().sort({ _id: -1 }).limit(1).toArray();
            console.log('📝 Last added laptop:', JSON.stringify(lastLaptop[0], null, 2));
        }

        process.exit(0);
    } catch (e) {
        console.error('❌ Connection Failed:', e);
        process.exit(1);
    }
};

diagnose();
