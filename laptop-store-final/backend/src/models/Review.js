const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    laptopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laptop',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    pros: [{
        type: String,
        trim: true
    }],
    cons: [{
        type: String,
        trim: true
    }],
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    images: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
reviewSchema.index({ laptopId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ laptopId: 1, rating: 1 });
reviewSchema.index({ helpfulVotes: -1 });
reviewSchema.index({ verifiedPurchase: 1 });

// Update laptop rating when review is saved
reviewSchema.post('save', async function() {
    const Laptop = mongoose.model('Laptop');
    const Review = mongoose.model('Review');

    const reviews = await Review.find({
        laptopId: this.laptopId,
        isActive: true
    });

    if (reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        await Laptop.findByIdAndUpdate(this.laptopId, {
            'ratings.average': averageRating.toFixed(1),
            'ratings.count': reviews.length
        });
    }
});

module.exports = mongoose.model('Review', reviewSchema);