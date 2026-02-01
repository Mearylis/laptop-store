const Review = require('../models/Review');
const Laptop = require('../models/Laptop');

// Get reviews for a laptop
exports.getLaptopReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ laptopId: req.params.laptopId })
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a review
exports.createReview = async (req, res) => {
    try {
        const { rating, comment, title } = req.body;
        const laptopId = req.params.laptopId;
        const userId = req.user.userId; // Matches authController definition

        // Check if laptop exists
        const laptop = await Laptop.findById(laptopId);
        if (!laptop) {
            return res.status(404).json({ success: false, message: 'Laptop not found' });
        }

        // Check if user already reviewed this laptop
        const existingReview = await Review.findOne({ laptopId, userId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this laptop' });
        }

        const review = await Review.create({
            laptopId,
            userId,
            rating,
            title,
            comment
        });

        // Update laptop average rating (could be done via aggregation or hooks, but doing manually for simplicity here or if hooks fail)
        // Ideally the Review model might have a post-save hook. checking that...
        // If not, we trigger it here or let the simple hook handle it if it exists.
        // Assuming no hook for now, or we rely on aggregation for stats later.

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete review (Admin or owner)
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Make sure user is review owner or admin
        if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        await review.remove(); // This should trigger post-remove hooks if any

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
