const Order = require('../models/Order');
const Laptop = require('../models/Laptop');
const mongoose = require('mongoose');

exports.createOrder = async (req, res, next) => {

    try {
        const { items, shippingAddress, paymentMethod, notes } = req.body;
        const userId = req.user.userId;

        // Validate items
        if (!items || items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        // Fetch laptop details and validate stock
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            // Atomic stock update
            const updatedLaptop = await Laptop.findOneAndUpdate(
                { _id: item.laptopId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (!updatedLaptop) {
                throw new Error(`Insufficient stock for laptop ID ${item.laptopId}`);
            }

            // Calculate price with discount
            const finalPrice = updatedLaptop.price * (1 - (updatedLaptop.discount || 0) / 100);

            orderItems.push({
                laptopId: updatedLaptop._id,
                model: updatedLaptop.model,
                brand: updatedLaptop.brand,
                quantity: item.quantity,
                priceAtPurchase: finalPrice,
                specifications: {
                    processor: updatedLaptop.specifications.processor,
                    ram: updatedLaptop.specifications.ram,
                    storage: updatedLaptop.specifications.storage
                }
            });

            subtotal += finalPrice * item.quantity;
        }

        // Calculate delivery cost based on subtotal
        const shippingCost = subtotal > 1000 ? 0 : 29.99; // Free shipping over $1000
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax + shippingCost;

        // Generate order number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        // Get count of orders today for sequence
        const count = await Order.countDocuments({
            createdAt: {
                $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
            }
        });

        const orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
        console.log('DEBUG: Generated Order Number:', orderNumber);

        // Create order
        const order = new Order({
            orderNumber,
            userId,
            items: orderItems,
            shippingAddress,
            payment: {
                method: paymentMethod,
                status: 'pending'
            },
            delivery: {
                method: shippingCost === 0 ? 'standard' : 'express',
                cost: shippingCost,
                estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            },
            subtotal,
            tax,
            shippingCost,
            total,
            notes
        });

        await order.save();

        // If payment method is not cash on delivery, mark as confirmed
        if (paymentMethod !== 'cash_on_delivery') {
            order.status = 'confirmed';
            order.payment.status = 'completed';
            order.payment.paidAt = new Date();
            await order.save();
        }



        // Populate laptop details for response
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'items.laptopId',
                select: 'brand model images'
            });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder
        });
    } catch (error) {

        next(error);
    }
};

exports.getUserOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const userId = req.user.userId;

        const filter = { userId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate({
                path: 'items.laptopId',
                select: 'brand model images'
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.userId
        }).populate({
            path: 'items.laptopId',
            select: 'brand model images specifications'
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

exports.cancelOrder = async (req, res, next) => {

    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.userId
        }).populate('items.laptopId');

        if (!order) {
            throw new Error('Order not found');
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.status)) {
            throw new Error(`Cannot cancel order with status: ${order.status}`);
        }

        // Return stock to inventory
        for (const item of order.items) {
            await Laptop.updateOne(
                { _id: item.laptopId },
                { $inc: { stock: item.quantity } }
            );
        }

        // Update order status
        order.status = 'cancelled';
        order.cancellationReason = req.body.reason || 'User requested cancellation';
        await order.save();



        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {

        next(error);
    }
};

// Admin only endpoints
exports.getAllOrders = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { page = 1, limit = 20, status, startDate, endDate } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(filter)
            .populate({
                path: 'userId',
                select: 'username email profile'
            })
            .populate({
                path: 'items.laptopId',
                select: 'brand model'
            })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { status, trackingNumber } = req.body;
        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updateData = { status };
        if (status === 'shipped' && trackingNumber) {
            updateData['delivery.trackingNumber'] = trackingNumber;
        }
        if (status === 'delivered') {
            updateData['delivery.deliveredAt'] = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};