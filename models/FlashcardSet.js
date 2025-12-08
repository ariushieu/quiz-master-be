import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true
    },
    definition: {
        type: String,
        required: true
    }
});

const flashcardSetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cards: [flashcardSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
flashcardSetSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('FlashcardSet', flashcardSetSchema);
