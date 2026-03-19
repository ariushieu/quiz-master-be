import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-in-blank', 'sentence-correction', 'sentence-reorder'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  // For multiple-choice
  options: [String],
  // For fill-in-blank (sentence with ___ or {blank})
  blanks: [{
    position: Number,
    correctAnswer: String,
    alternatives: [String] // accepted alternatives
  }],
  // For sentence-reorder
  words: [String], // shuffled words
  correctOrder: [String], // correct sentence
  // Common fields
  correctAnswer: String,
  explanation: String,
  hint: String
});

const grammarLessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  category: {
    type: String,
    required: true,
    // e.g., 'tenses', 'conditionals', 'passive-voice', 'modals', etc.
  },
  content: {
    type: String,
    required: true // Markdown content explaining the grammar rule
  },
  examples: [{
    sentence: String,
    translation: String
  }],
  exercises: [exerciseSchema],
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

grammarLessonSchema.index({ title: 'text', description: 'text', tags: 'text' });
grammarLessonSchema.index({ category: 1, level: 1 });

export default mongoose.model('GrammarLesson', grammarLessonSchema);
