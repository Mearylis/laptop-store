const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
    processor: {
        type: String,
        required: true,
        trim: true
    },
    ram: {
        type: String,
        required: true,
        trim: true
    },
    storage: {
        type: String,
        required: true,
        trim: true
    },
    display: {
        type: String,
        required: true,
        trim: true
    },
    graphics: {
        type: String,
        trim: true
    },
    battery: {
        type: String,
        trim: true
    },
    weight: {
        type: String,
        trim: true
    },
    os: {
        type: String,
        trim: true
    }
});

const laptopSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true,
        trim: true,
        enum: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Razer', 'Microsoft', 'Samsung']
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    specifications: specificationSchema,
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    images: [{
        type: String,
        required: true
    }],
    features: [{
        type: String,
        trim: true
    }],
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sku: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    warranty: {
        type: Number,
        default: 12 // months
    }
}, {
    timestamps: true
});

// Indexes for optimization
laptopSchema.index({ brand: 1, model: 1 });
laptopSchema.index({ category: 1, price: 1 });
laptopSchema.index({ 'specifications.processor': 1 });
laptopSchema.index({ 'specifications.ram': 1 });
laptopSchema.index({ 'specifications.storage': 1 });
laptopSchema.index({ price: 1 });
laptopSchema.index({ 'ratings.average': -1 });
laptopSchema.index({ createdAt: -1 });
laptopSchema.index({ discount: -1 });
// laptopSchema.index({ sku: 1 }, { unique: true }); // Removed duplicate

// Virtual for final price after discount
laptopSchema.virtual('finalPrice').get(function () {
    return this.price * (1 - this.discount / 100);
});

// Method to update stock
laptopSchema.methods.updateStock = function (quantity) {
    if (this.stock + quantity < 0) {
        throw new Error('Insufficient stock');
    }
    this.stock += quantity;
    return this.save();
};

module.exports = mongoose.model('Laptop', laptopSchema);