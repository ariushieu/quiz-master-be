import mongoose from 'mongoose';

const studyProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    setId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FlashcardSet',
        required: true
    },
    cardIndex: {
        type: Number,
        required: true
    },
    // Track if card has been studied (for counting unique cards)
    isStudied: {
        type: Boolean,
        default: false
    },
    // SM-2 Algorithm fields
    easeFactor: {
        type: Number,
        default: 2.5,
        min: 1.3
    },
    interval: {
        type: Number,
        default: 0
    },
    repetitions: {
        type: Number,
        default: 0
    },
    nextReviewDate: {
        type: Date,
        default: Date.now
    },
    lastReviewDate: {
        type: Date,
        default: null
    }
});

studyProgressSchema.index({ userId: 1, setId: 1, cardIndex: 1 }, { unique: true });

export default mongoose.model('StudyProgress', studyProgressSchema);
