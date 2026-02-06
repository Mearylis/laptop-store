const mongoose = require('mongoose');
const Category = require('../models/Category');

/**
 * Scans the database for Laptops with invalid 'category' fields (strings)
 * and attempts to fix them by looking up the category by name/slug.
 */
const fixLaptopCategories = async () => {
    try {
        if (mongoose.connection.readyState !== 1) return;

        // Use raw collection to bypass Mongoose Schema validation
        const collection = mongoose.connection.db.collection('laptops');

        let fixedCount = 0;

        // --- FIX 1: Categories (String -> ObjectId) ---
        const brokenCategoryLaptops = await collection.find({
            category: { $type: 2 }
        }).toArray();

        if (brokenCategoryLaptops.length > 0) {
            // Cache categories
            const categories = await Category.find({});
            const catMap = new Map();
            categories.forEach(c => {
                catMap.set(c.name.toLowerCase(), c._id);
                catMap.set(c.slug.toLowerCase(), c._id);
                catMap.set(c._id.toString(), c._id);
            });

            for (const laptop of brokenCategoryLaptops) {
                const rawCategory = laptop.category;
                if (!rawCategory) continue;

                const searchKey = rawCategory.toString().toLowerCase().trim();
                const validId = catMap.get(searchKey);

                if (validId) {
                    await collection.updateOne(
                        { _id: laptop._id },
                        { $set: { category: validId } }
                    );
                    console.log(`🔧 AutoFix: Category "${rawCategory}" -> ${validId} for ${laptop.model}`);
                    fixedCount++;
                }
            }
        }

        // --- FIX 2: Numeric Fields (String -> Number) ---
        const brokenNumericLaptops = await collection.find({
            $or: [
                { price: { $type: 2 } },
                { stock: { $type: 2 } },
                { discount: { $type: 2 } }
            ]
        }).toArray();

        for (const laptop of brokenNumericLaptops) {
            const updates = {};

            if (typeof laptop.price === 'string') {
                const num = parseFloat(laptop.price.replace(/[^\d.]/g, ''));
                if (!isNaN(num)) updates.price = num;
            }
            if (typeof laptop.stock === 'string') {
                const num = parseInt(laptop.stock.replace(/[^\d]/g, ''), 10);
                if (!isNaN(num)) updates.stock = num;
            }
            if (typeof laptop.discount === 'string') {
                const num = parseFloat(laptop.discount.replace(/[^\d.]/g, ''));
                if (!isNaN(num)) updates.discount = num;
            }

            if (Object.keys(updates).length > 0) {
                await collection.updateOne(
                    { _id: laptop._id },
                    { $set: updates }
                );
                console.log(`🔧 AutoFix: Fixed numeric types for ${laptop.model}`);
                fixedCount++;
            }
        }

        // --- FIX 3: Missing Timestamps (Sorting issue) ---
        const brokenDateLaptops = await collection.find({
            $or: [
                { createdAt: { $exists: false } },
                { updatedAt: { $exists: false } }
            ]
        }).toArray();

        for (const laptop of brokenDateLaptops) {
            const now = new Date();
            await collection.updateOne(
                { _id: laptop._id },
                {
                    $set: {
                        createdAt: laptop.createdAt || now,
                        updatedAt: now
                    }
                }
            );
            console.log(`🔧 AutoFix: Added timestamps to ${laptop.model}`);
            fixedCount++;
        }

        // --- FIX 4: Missing isActive (Visibility issue) ---
        // Compass inserts bypass Mongoose defaults. If 'isActive' is missing, the backend query { isActive: true } hides it.
        const hiddenLaptops = await collection.find({
            isActive: { $exists: false }
        }).toArray();

        for (const laptop of hiddenLaptops) {
            await collection.updateOne(
                { _id: laptop._id },
                { $set: { isActive: true } }
            );
            console.log(`🔧 AutoFix: Set isActive=true for ${laptop.model}`);
            fixedCount++;
        }

        if (fixedCount > 0) {
            console.log(`✨ AutoFix: Repaired ${fixedCount} issues.`);
        }

    } catch (error) {
        console.error('❌ AutoFix Error:', error);
    }
};

const startAutoFixer = (intervalMs = 3000) => {
    console.log('🛡️ Auto-Fixer active: Polling for Compass imports every 3s...');
    // Run immediately on start
    fixLaptopCategories();

    // Then poll periodically
    setInterval(fixLaptopCategories, intervalMs);
};

module.exports = { startAutoFixer, fixLaptopCategories };
