const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable merging params to access laptopId from parent router if nested
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/reviews/{laptopId}:
 *   get:
 *     summary: Get reviews for a laptop
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: laptopId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/:laptopId', reviewController.getLaptopReviews);

/**
 * @swagger
 * /api/reviews/{laptopId}:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: laptopId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Already reviewed
 */
router.post('/:laptopId', authenticate, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
