const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, firstName, lastName, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            passwordHash: password,
            profile: {
                firstName,
                lastName,
                phone
            }
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: userResponse
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        console.log('DEBUG: getProfile called for User ID:', req.user.userId);
        const user = await User.findById(req.user.userId)
            .select('-passwordHash');

        console.log('DEBUG: User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, phone } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update profile fields
        if (firstName) user.profile.firstName = firstName;
        if (lastName) user.profile.lastName = lastName;
        if (phone) user.profile.phone = phone;

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        next(error);
    }
};

exports.addAddress = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = await User.findById(req.user.userId);
        user.addresses.push(req.body);
        await user.save();

        res.json({
            success: true,
            message: 'Address added successfully',
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAddress = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();

        res.json({
            success: true,
            message: 'Address deleted successfully',
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password'
            });
        }

        user.passwordHash = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const user = await User.findById(req.user.userId);
        // Assuming file upload middleware saves file and provides path
        // For local uploads setup:
        const avatarPath = `/uploads/${req.file.filename}`;

        user.profile.avatar = avatarPath;
        await user.save();

        res.json({
            success: true,
            message: 'Avatar updated successfully',
            avatar: avatarPath
        });
    } catch (error) {
        next(error);
    }
};