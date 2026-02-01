const Order = require('../models/Order');
const Laptop = require('../models/Laptop');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getSalesAnalytics = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { period = 'monthly', startDate, endDate } = req.query;

        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        let groupBy;
        switch (period) {
            case 'daily':
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                break;
            case 'weekly':
                groupBy = { $dateToString: { format: '%Y-%W', date: '$createdAt' } };
                break;
            case 'monthly':
            default:
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                break;
        }

        // Sales aggregation
        const salesData = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['delivered', 'shipped', 'processing'] },
                    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalSales: { $sum: '$total' },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$total' },
                    totalItemsSold: { $sum: { $size: '$items' } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top selling laptops
        const topLaptops = await Order.aggregate([
            { $match: { status: { $in: ['delivered', 'shipped', 'processing'] } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.laptopId',
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: {
                        $sum: { $multiply: ['$items.quantity', '$items.priceAtPurchase'] }
                    }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'laptops',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'laptopDetails'
                }
            },
            { $unwind: '$laptopDetails' },
            {
                $project: {
                    laptopId: '$_id',
                    model: '$laptopDetails.model',
                    brand: '$laptopDetails.brand',
                    totalSold: 1,
                    totalRevenue: 1,
                    image: { $arrayElemAt: ['$laptopDetails.images', 0] }
                }
            }
        ]);

        // Customer metrics
        const customerMetrics = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    activeCustomers: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    },
                    admins: {
                        $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Revenue by status
        const revenueByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    totalRevenue: { $sum: '$total' },
                    orderCount: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                salesData,
                topLaptops,
                customerMetrics: customerMetrics[0] || {},
                revenueByStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getDashboardStats = async (req, res, next) => {
    console.log('DEBUG: getDashboardStats started');
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        console.log('DEBUG: Dates calculated', { today, startOfToday, startOfMonth });

        // Today's stats
        const todayStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfToday },
                    status: { $in: ['delivered', 'shipped', 'processing'] }
                }
            },
            {
                $group: {
                    _id: null,
                    todaySales: { $sum: '$total' },
                    todayOrders: { $sum: 1 }
                }
            }
        ]);

        console.log('DEBUG: Today stats fetched:', todayStats);

        // Monthly stats
        const monthlyStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $in: ['delivered', 'shipped', 'processing'] }
                }
            },
            {
                $group: {
                    _id: null,
                    monthlySales: { $sum: '$total' },
                    monthlyOrders: { $sum: 1 }
                }
            }
        ]);

        console.log('DEBUG: Monthly stats fetched:', monthlyStats);

        // Low stock alerts
        const lowStockLaptops = await Laptop.find({
            stock: { $lt: 5 },
            isActive: true
        })
            .limit(5)
            .select('brand model stock images');

        console.log('DEBUG: Low stock fetched');

        // Pending orders
        const pendingOrders = await Order.countDocuments({
            status: { $in: ['pending', 'confirmed'] }
        });

        // Total customers
        const totalCustomers = await User.countDocuments({ role: 'customer' });

        // Active products
        const activeProducts = await Laptop.countDocuments({ isActive: true });

        console.log('DEBUG: All metrics fetched, sending response');

        res.json({
            success: true,
            data: {
                today: todayStats[0] || { todaySales: 0, todayOrders: 0 },
                monthly: monthlyStats[0] || { monthlySales: 0, monthlyOrders: 0 },
                alerts: {
                    lowStock: lowStockLaptops,
                    pendingOrders
                },
                overview: {
                    totalCustomers,
                    activeProducts,
                    totalOrders: (monthlyStats[0]?.monthlyOrders || 0)
                }
            }
        });
    } catch (error) {
        console.error('CRITICAL DASHBOARD ERROR:', error);
        next(error);
    };
};