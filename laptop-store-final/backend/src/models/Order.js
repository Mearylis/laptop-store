const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    laptopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laptop',
        required: true
    },
    model: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    priceAtPurchase: {
        type: Number,
        required: true,
        min: 0
    },
    specifications: {
        processor: String,
        ram: String,
        storage: String
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    items: [orderItemSchema],
    shippingAddress: {
        street: String,
        city: String,
        country: String,
        zipCode: String,
        phone: String
    },
    payment: {
        method: {
            type: String,
            enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        amount: Number,
        paidAt: Date
    },
    delivery: {
        method: {
            type: String,
            enum: ['standard', 'express', 'next_day'],
            default: 'standard'
        },
        cost: {
            type: Number,
            default: 0
        },
        estimatedDate: Date,
        trackingNumber: String,
        deliveredAt: Date
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 0,
        min: 0
    },
    shippingCost: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    notes: String,
    cancellationReason: String,
    refundAmount: Number
}, {
    timestamps: true
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
// orderSchema.index({ orderNumber: 1 }, { unique: true }); // Removed duplicate
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ 'items.laptopId': 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'delivery.method': 1 });



// Calculate totals before save
orderSchema.pre('save', function (next) {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce((sum, item) => {
        return sum + (item.priceAtPurchase * item.quantity);
    }, 0);

    // Calculate total
    this.total = this.subtotal + this.tax + this.shippingCost;

    // Set payment amount
    if (!this.payment.amount) {
        this.payment.amount = this.total;
    }

    next();
});

module.exports = mongoose.model('Order', orderSchema);