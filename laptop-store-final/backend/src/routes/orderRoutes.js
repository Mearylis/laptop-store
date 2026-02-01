const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Public/User routes (authenticate middleware should likely be applied to the router or these specific routes, 
// strictly speaking createOrder/getUserOrders need auth. Assuming the router is mounted with auth or we apply it here.
// Looking at server.js, app.use('/api/orders', ...) doesn't have middleware.
// So I should apply 'authenticate' to all these routes.

router.use(authenticate);

// Admin routes
router.get('/all', authenticate, authorize('admin'), getAllOrders);
router.put('/:id/status', authenticate, authorize('admin'), updateOrderStatus);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.delete('/:id/cancel', cancelOrder);
router.get('/:id', getOrderById);

module.exports = router;
