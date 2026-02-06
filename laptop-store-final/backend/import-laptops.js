const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Laptop = require('./src/models/Laptop');
const Category = require('./src/models/Category');

dotenv.config();

const importLaptops = async () => {
    try {
        // 1. Validate arguments
        const args = process.argv.slice(2);
        if (args.length !== 1) {
            console.error('Usage: node import-laptops.js <path-to-json-file>');
            process.exit(1);
        }

        const filePath = args[0];
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            process.exit(1);
        }

        // 2. Connect to Database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 3. Read and Parse JSON
        const rawData = fs.readFileSync(filePath, 'utf-8');
        let laptopsData;
        try {
            laptopsData = JSON.parse(rawData);
        } catch (e) {
            console.error('❌ Invalid JSON format');
            process.exit(1);
        }

        if (!Array.isArray(laptopsData)) {
            console.error('❌ JSON root must be an array of laptops');
            process.exit(1);
        }

        console.log(`📦 Found ${laptopsData.length} items to process...`);

        let importedCount = 0;
        let skippedCount = 0;
        let updatedCount = 0;

        // 4. Process each laptop
        for (const item of laptopsData) {
            try {
                // Resolve Category
                let categoryId;

                // If the JSON already provides an ObjectId (rare but possible)
                if (mongoose.Types.ObjectId.isValid(item.category)) {
                    const catExists = await Category.exists({ _id: item.category });
                    if (catExists) categoryId = item.category;
                }

                // Look up by slug or name if not an ID
                if (!categoryId && (item.categorySlug || item.category)) {
                    const query = {};
                    if (item.categorySlug) query.slug = item.categorySlug;
                    else query.name = new RegExp('^' + item.category + '$', 'i'); // Case-insensitive name match

                    const category = await Category.findOne(query);
                    if (category) {
                        categoryId = category._id;
                    }
                }

                if (!categoryId) {
                    console.warn(`⚠️  Skipping "${item.model}": Category not found or invalid (value: ${item.categorySlug || item.category})`);
                    skippedCount++;
                    continue;
                }

                // Prepare laptop object
                const laptopDoc = {
                    ...item,
                    category: categoryId
                };

                // Remove convenience fields so they don't error in strict mode (although Mongoose v6+ strips unknown by default)
                delete laptopDoc.categorySlug;

                // Upsert based on SKU
                const result = await Laptop.updateOne(
                    { sku: item.sku },
                    { $set: laptopDoc },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) {
                    importedCount++;
                    console.log(`✅ Imported: ${item.brand} ${item.model}`);
                } else if (result.modifiedCount > 0) {
                    updatedCount++;
                    console.log(`🔄 Updated: ${item.brand} ${item.model}`);
                } else {
                    console.log(`Example: ${item.brand} ${item.model} (No changes)`);
                }

            } catch (err) {
                console.error(`❌ Error processing "${item.model || 'Unknown'}": ${err.message}`);
                skippedCount++;
            }
        }

        console.log('\n--- Summary ---');
        console.log(`Total Processed: ${laptopsData.length}`);
        console.log(`Created: ${importedCount}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped/Failed: ${skippedCount}`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Critical Error:', error);
        process.exit(1);
    }
};

importLaptops();
