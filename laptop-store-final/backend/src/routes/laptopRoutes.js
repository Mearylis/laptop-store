const express = require('express');
const router = express.Router();
const laptopController = require('../controllers/laptopController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validate, laptopValidation } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * /api/laptops:
 *   get:
 *     summary: Get all laptops
 *     tags: [Laptops]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of laptops
 */
router.get('/', laptopController.getAllLaptops);

/**
 * @swagger
 * /api/laptops/{id}:
 *   get:
 *     summary: Get laptop by ID
 *     tags: [Laptops]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Laptop details
 *       404:
 *         description: Laptop not found
 */
router.get('/:id', laptopController.getLaptopById);

// Admin only routes
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/laptops:
 *   post:
 *     summary: Create a new laptop (Admin only)
 *     tags: [Laptops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Laptop'
 *     responses:
 *       201:
 *         description: Laptop created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
router.post('/', validate(laptopValidation), laptopController.createLaptop);

/**
 * @swagger
 * /api/laptops/{id}:
 *   put:
 *     summary: Update laptop (Admin only)
 *     tags: [Laptops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Laptop'
 *     responses:
 *       200:
 *         description: Laptop updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Laptop not found
 */
router.put('/:id', laptopController.updateLaptop);

/**
 * @swagger
 * /api/laptops/{id}:
 *   delete:
 *     summary: Delete laptop (Admin only)
 *     tags: [Laptops]
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
 *         description: Laptop deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Laptop not found
 */
router.delete('/:id', laptopController.deleteLaptop);

/**
 * @swagger
 * /api/laptops/{id}/stock:
 *   patch:
 *     summary: Update laptop stock (Admin only)
 *     tags: [Laptops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock updated successfully
 */
router.patch('/:id/stock', laptopController.updateStock);

/**
 * @swagger
 * /api/laptops/stats/analytics:
 *   get:
 *     summary: Get laptop statistics (Admin only)
 *     tags: [Laptops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 */
router.get('/stats/analytics', laptopController.getLaptopStats);

module.exports = router;