const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/300x200?text=Category'
    },
    specificationsFilter: {
        processor: [String],
        ram: [String],
        storage: [String],
        graphics: [String],
        brand: [String]
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
// categorySchema.index({ slug: 1 }, { unique: true }); // Removed duplicate
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Virtual for children categories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory'
});

// Pre-save to generate slug if not provided
categorySchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);