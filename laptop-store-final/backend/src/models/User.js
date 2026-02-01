const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home'
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    profile: {
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        avatar: {
            type: String,
            default: 'https://via.placeholder.com/150'
        }
    },
    addresses: [addressSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes
// userSchema.index({ email: 1 }, { unique: true }); // Removed duplicate

userSchema.index({ 'profile.phone': 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

module.exports = mongoose.model('User', userSchema);