import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Get user ID first
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: String
}));

const FlashcardSet = mongoose.model('FlashcardSet', new mongoose.Schema({
    title: String,
    description: String,
    userId: mongoose.Schema.Types.ObjectId,
    cards: [{
        term: String,
        definition: String
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}));

const sampleSets = [
    {
        title: "English - Vietnamese Basics",
        description: "Common English words with Vietnamese translations",
        cards: [
            { term: "Hello", definition: "Xin chào" },
            { term: "Goodbye", definition: "Tạm biệt" },
            { term: "Thank you", definition: "Cảm ơn" },
            { term: "Sorry", definition: "Xin lỗi" },
            { term: "Please", definition: "Làm ơn" },
            { term: "Yes", definition: "Có / Vâng" },
            { term: "No", definition: "Không" },
            { term: "Good morning", definition: "Chào buổi sáng" },
            { term: "Good night", definition: "Chúc ngủ ngon" },
            { term: "How are you?", definition: "Bạn khỏe không?" }
        ]
    },
    {
        title: "Programming Terms",
        description: "Common programming terminology",
        cards: [
            { term: "Variable", definition: "A named storage location in memory" },
            { term: "Function", definition: "A reusable block of code that performs a specific task" },
            { term: "Array", definition: "An ordered collection of elements" },
            { term: "Object", definition: "A collection of key-value pairs" },
            { term: "Loop", definition: "A structure that repeats code multiple times" },
            { term: "Condition", definition: "A statement that evaluates to true or false" },
            { term: "API", definition: "Application Programming Interface - a way for programs to communicate" },
            { term: "Database", definition: "An organized collection of structured data" }
        ]
    },
    {
        title: "TOEIC Vocabulary",
        description: "Essential words for TOEIC exam",
        cards: [
            { term: "accomplish", definition: "to succeed in doing something" },
            { term: "acquire", definition: "to obtain or get something" },
            { term: "adjacent", definition: "next to or near something" },
            { term: "allocate", definition: "to distribute resources for a purpose" },
            { term: "anticipate", definition: "to expect something to happen" },
            { term: "authorize", definition: "to give official permission" },
            { term: "comply", definition: "to act according to rules" },
            { term: "deadline", definition: "the time by which something must be done" },
            { term: "implement", definition: "to put a plan into action" },
            { term: "negotiate", definition: "to discuss to reach an agreement" }
        ]
    },
    {
        title: "Japanese Hiragana",
        description: "Learn basic Japanese Hiragana characters",
        cards: [
            { term: "あ (a)", definition: "Vowel 'a' sound" },
            { term: "い (i)", definition: "Vowel 'i' sound" },
            { term: "う (u)", definition: "Vowel 'u' sound" },
            { term: "え (e)", definition: "Vowel 'e' sound" },
            { term: "お (o)", definition: "Vowel 'o' sound" },
            { term: "か (ka)", definition: "K + a sound" },
            { term: "き (ki)", definition: "K + i sound" },
            { term: "く (ku)", definition: "K + u sound" },
            { term: "け (ke)", definition: "K + e sound" },
            { term: "こ (ko)", definition: "K + o sound" }
        ]
    }
];

async function seed() {
    try {
        // Find the first user
        const user = await User.findOne();

        if (!user) {
            console.log('❌ No user found. Please register first.');
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user._id})`);

        // Delete existing sets for this user
        await FlashcardSet.deleteMany({ userId: user._id });
        console.log('🗑️ Deleted existing sets');

        // Insert sample sets
        const setsToInsert = sampleSets.map(set => ({
            ...set,
            userId: user._id
        }));

        const inserted = await FlashcardSet.insertMany(setsToInsert);
        console.log(`✅ Inserted ${inserted.length} sample sets:`);
        inserted.forEach(set => {
            console.log(`   - ${set.title} (${set.cards.length} cards)`);
        });

        console.log('\n🎉 Seeding complete! Refresh your browser to see the sets.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding:', error);
        process.exit(1);
    }
}

seed();
