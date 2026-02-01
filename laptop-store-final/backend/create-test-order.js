const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
const Laptop = require('./src/models/Laptop');

dotenv.config();

const createTestOrder = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find customer and laptop
        const customer = await User.findOne({ email: 'customer@example.com' });
        const laptop = await Laptop.findOne({}); // Get any laptop

        if (!customer || !laptop) {
            console.error('❌ Error: Could not find customer or laptop. Did you run fix-db.js?');
            process.exit(1);
        }

        // Create a delivered order (so it shows up in sales stats)
        const order = await Order.create({
            user: customer._id,
            items: [{
                laptopId: laptop._id,
                quantity: 1,
                priceAtPurchase: laptop.price
            }],
            total: laptop.price,
            shippingAddress: {
                street: '123 Test St',
                city: 'Test City',
                country: 'Testland',
                zipCode: '12345'
            },
            paymentMethod: 'credit_card',
            paymentStatus: 'paid',
            status: 'delivered' // Important for sales stats
        });

        console.log('✨ Test Order Created!');
        console.log('Order ID:', order._id);
        console.log('Amount:', order.total);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test order:', error);
        process.exit(1);
    }
};

createTestOrder();
