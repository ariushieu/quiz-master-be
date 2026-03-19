import mongoose from 'mongoose';

const grammarProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GrammarLesson',
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptDate: Date,
  exerciseResults: [{
    exerciseId: mongoose.Schema.Types.ObjectId,
    correct: Boolean,
    userAnswer: mongoose.Schema.Types.Mixed,
    timestamp: Date
  }]
}, {
  timestamps: true
});

grammarProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export default mongoose.model('GrammarProgress', grammarProgressSchema);
