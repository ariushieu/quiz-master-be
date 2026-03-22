import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import FlashcardSet from '../models/FlashcardSet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we load the env from the server root
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedOxford = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not defined in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find existing admin
        let adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });

        if (!adminUser) {
            console.warn('⚠️ No admin user found! Please create an account and assign admin role first.');
            process.exit(0);
        }

        console.log(`Using Admin: ${adminUser.username} (${adminUser._id})`);

        // 2. Read the oxford JSON file
        const dataPath = path.join(__dirname, 'data', 'oxford-3000-full.json');
        
        if (!fs.existsSync(dataPath)) {
            console.error(`❌ Data file not found at ${dataPath}. Did the scraper run successfully?`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(dataPath, 'utf8');
        const oxfordWords = JSON.parse(rawData);
        
        console.log(`📌 Loaded ${oxfordWords.length} Oxford words.`);

        // 3. Split into sets of 100 words
        const chunkSize = 100;
        let setCounter = 1;

        for (let i = 0; i < oxfordWords.length; i += chunkSize) {
            const chunk = oxfordWords.slice(i, i + chunkSize);
            const setTitle = `Oxford 3000 - Part ${setCounter} (${i + 1} - ${i + chunk.length})`;

            // Find set by Title
            let flashcardSet = await FlashcardSet.findOne({ title: setTitle });

            if (!flashcardSet) {
                flashcardSet = new FlashcardSet({
                    title: setTitle,
                    description: `Danh sách từ vựng Oxford 3000 thông dụng nhất - Phần ${setCounter}. Giúp bạn xây dựng nền tảng từ vựng tiếng Anh vững chắc.`,
                    userId: adminUser._id,
                    cards: chunk,
                    isPublic: true
                });
                await flashcardSet.save();
                console.log(`✅ Created Set: "${setTitle}" with ${chunk.length} words`);
            } else {
                console.log(`ℹ️ Set "${setTitle}" already exists - Updating...`);
                // Update ownership and cards
                flashcardSet.userId = adminUser._id;
                flashcardSet.cards = chunk;
                flashcardSet.isPublic = true;
                await flashcardSet.save();
                console.log(`✅ Updated existing "${setTitle}"`);
            }
            
            setCounter++;
        }

        console.log('🎉 Oxford Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedOxford();
