const Laptop = require('../models/Laptop');
const Review = require('../models/Review');
const Category = require('../models/Category');
const mongoose = require('mongoose');

exports.getAllLaptops = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt',
            order = 'desc',
            brand,
            category,
            minPrice,
            maxPrice,
            ram,
            storage,
            processor,
            search
        } = req.query;

        // Build filter
        const filter = { isActive: true };

        if (brand) {
            filter.brand = { $in: brand.split(',') };
        }

        if (category) {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (ram) {
            filter['specifications.ram'] = { $regex: ram, $options: 'i' };
        }

        if (storage) {
            filter['specifications.storage'] = { $regex: storage, $options: 'i' };
        }

        if (processor) {
            filter['specifications.processor'] = { $regex: processor, $options: 'i' };
        }

        if (search) {
            filter.$or = [
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort
        const sortOptions = {};
        sortOptions[sort] = order === 'desc' ? -1 : 1;

        // Execute query with pagination
        const laptops = await Laptop.find(filter)
            .populate('category', 'name slug')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count for pagination
        const total = await Laptop.countDocuments(filter);

        // Get aggregation for price ranges
        const priceStats = await Laptop.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        res.json({
            success: true,
            data: laptops,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: Number(limit)
            },
            filters: {
                priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 }
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getLaptopById = async (req, res, next) => {
    try {
        const laptop = await Laptop.findById(req.params.id)
            .populate('category', 'name slug')
            .populate({
                path: 'reviews',
                match: { isActive: true },
                options: { sort: { helpfulVotes: -1, createdAt: -1 }, limit: 10 },
                populate: {
                    path: 'userId',
                    select: 'username profile.avatar'
                }
            });

        if (!laptop) {
            return res.status(404).json({
                success: false,
                message: 'Laptop not found'
            });
        }

        // Get related laptops (same brand or category)
        const relatedLaptops = await Laptop.find({
            _id: { $ne: laptop._id },
            $or: [
                { brand: laptop.brand },
                { category: laptop.category }
            ],
            isActive: true
        })
            .limit(4)
            .select('brand model price images ratings');

        res.json({
            success: true,
            data: laptop,
            relatedLaptops
        });
    } catch (error) {
        next(error);
    }
};

exports.createLaptop = async (req, res, next) => {
    try {
        // Check admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const laptopData = req.body;

        // Generate SKU if not provided
        if (!laptopData.sku) {
            const brandCode = laptopData.brand.substring(0, 3).toUpperCase();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            laptopData.sku = `${brandCode}-${random}`;
        }

        const laptop = new Laptop(laptopData);
        await laptop.save();

        res.status(201).json({
            success: true,
            message: 'Laptop created successfully',
            data: laptop
        });
    } catch (error) {
        next(error);
    }
};

exports.updateLaptop = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const laptop = await Laptop.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!laptop) {
            return res.status(404).json({
                success: false,
                message: 'Laptop not found'
            });
        }

        res.json({
            success: true,
            message: 'Laptop updated successfully',
            data: laptop
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteLaptop = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        // Soft delete (set isActive to false)
        const laptop = await Laptop.findByIdAndUpdate(
            req.params.id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!laptop) {
            return res.status(404).json({
                success: false,
                message: 'Laptop not found'
            });
        }

        res.json({
            success: true,
            message: 'Laptop deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.updateStock = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { quantity } = req.body;
        const laptop = await Laptop.findById(req.params.id);

        if (!laptop) {
            return res.status(404).json({
                success: false,
                message: 'Laptop not found'
            });
        }

        laptop.stock += Number(quantity);
        await laptop.save();

        res.json({
            success: true,
            message: 'Stock updated successfully',
            data: { stock: laptop.stock }
        });
    } catch (error) {
        next(error);
    }
};

exports.getLaptopStats = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const stats = await Laptop.aggregate([
            {
                $group: {
                    _id: '$brand',
                    totalLaptops: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    totalStock: { $sum: '$stock' },
                    avgRating: { $avg: '$ratings.average' }
                }
            },
            { $sort: { totalLaptops: -1 } }
        ]);

        // Get price distribution
        const priceDistribution = await Laptop.aggregate([
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: [0, 500, 1000, 1500, 2000, 3000, 5000, 10000],
                    default: '10000+',
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                byBrand: stats,
                priceDistribution
            }
        });
    } catch (error) {
        next(error);
    }
};