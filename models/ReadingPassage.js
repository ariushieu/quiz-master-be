import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: function() {
            return this.type !== 'table-completion';
        }
    },
    type: {
        type: String,
        enum: ['multiple-choice', 'true-false-not-given', 'fill-in-blank', 'matching', 'table-completion'],
        required: true
    },
    options: [{
        type: String
    }],
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // Can be String or Array depending on type
        required: function() {
            return this.type !== 'table-completion';
        }
    },
    explanation: {
        type: String
    },
    wordLimit: {
        type: String, // e.g. "NO MORE THAN TWO WORDS"
        required: false
    },
    // For grouping questions (IELTS structure)
    groupLabel: {
        type: String // e.g. "Questions 1-6"
    },
    groupInstruction: {
        type: String // e.g. "Do the following statements agree with the information..."
    },
    subHeading: {
        type: String // e.g. "Advantages of cork bottle stoppers"
    },
    // For table-completion type
    tableStructure: {
        headers: [String], // Column headers
        rows: [{
            cells: [{
                type: {
                    type: String,
                    enum: ['text', 'blank']
                },
                value: String, // For 'text' type
                blankId: Number, // For 'blank' type - question number
                answer: String // For 'blank' type - correct answer
            }]
        }]
    }
});

const readingPassageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    passageText: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'IELTS Band 4.5-5.5', 'IELTS Band 6.0-7.0', 'IELTS Band 7.5+', 'IELTS Passage 1', 'IELTS Passage 2', 'IELTS Passage 3', 'IELTS Reading'],
        default: 'IELTS Reading'
    },
    topic: {
        type: String,
        required: false,
        default: ''
    },
    questions: [questionSchema],
    isPublic: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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
readingPassageSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('ReadingPassage', readingPassageSchema);
