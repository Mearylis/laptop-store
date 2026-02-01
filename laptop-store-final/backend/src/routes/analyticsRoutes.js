const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All routes are protected and restricted to admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard stats (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/dashboard', analyticsController.getDashboardStats);

/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get sales analytics (Admin)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Sales analytics data
 */
router.get('/sales', analyticsController.getSalesAnalytics);

module.exports = router;
