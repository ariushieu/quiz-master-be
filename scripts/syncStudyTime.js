import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory (server root)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const migrate = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users. Checking for discrepancies...`);

        let updatedCount = 0;

        for (const user of users) {
            const stats = user.stats || {};
            const weekly = stats.weeklyStudyTime || 0;
            const total = stats.totalStudyTime || 0;

            // Logic: If weekly > total, it means total missed some updates. 
            // Since we just launched, total should at least be equal to weekly.
            if (weekly > total) {
                await mongoose.connection.db.collection('users').updateOne(
                    { _id: user._id },
                    { $set: { 'stats.totalStudyTime': weekly } }
                );
                console.log(`Synced user ${user.username}: Total ${total} -> ${weekly}`);
                updatedCount++;
            }
        }

        console.log(`✅ Migration complete! Updated ${updatedCount} users.`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
    }
};

migrate();
