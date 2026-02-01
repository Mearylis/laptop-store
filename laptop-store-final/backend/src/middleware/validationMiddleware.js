const { body, param, query, validationResult } = require('express-validator');

exports.validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            success: false,
            errors: errors.array()
        });
    };
};

// Common validation chains
exports.registerValidation = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName')
        .optional()
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName')
        .optional()
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters')
];

exports.loginValidation = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

exports.laptopValidation = [
    body('brand')
        .notEmpty().withMessage('Brand is required')
        .isIn(['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Razer', 'Microsoft', 'Samsung'])
        .withMessage('Invalid brand'),
    body('model')
        .notEmpty().withMessage('Model is required'),
    body('category')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('specifications.processor')
        .notEmpty().withMessage('Processor is required'),
    body('specifications.ram')
        .notEmpty().withMessage('RAM is required'),
    body('specifications.storage')
        .notEmpty().withMessage('Storage is required'),
    body('specifications.display')
        .notEmpty().withMessage('Display is required'),
    body('images')
        .isArray({ min: 1 }).withMessage('At least one image is required'),
    body('discount')
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage('Discount must be between 0 and 100')
];

exports.orderValidation = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.laptopId')
        .notEmpty().withMessage('Laptop ID is required')
        .isMongoId().withMessage('Invalid laptop ID'),
    body('items.*.quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10'),
    body('shippingAddress.street')
        .notEmpty().withMessage('Street address is required'),
    body('shippingAddress.city')
        .notEmpty().withMessage('City is required'),
    body('shippingAddress.country')
        .notEmpty().withMessage('Country is required'),
    body('shippingAddress.zipCode')
        .notEmpty().withMessage('ZIP code is required'),
    body('paymentMethod')
        .notEmpty().withMessage('Payment method is required')
        .isIn(['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'])
        .withMessage('Invalid payment method')
];

exports.addressValidation = [
    body('street').notEmpty().withMessage('Street is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('zipCode').notEmpty().withMessage('Zip code is required')
];

exports.passwordChangeValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password cannot be the same as current password');
            }
            return true;
        })
];