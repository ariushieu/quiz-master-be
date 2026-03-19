import express from 'express';
import GrammarLesson from '../models/GrammarLesson.js';
import GrammarProgress from '../models/GrammarProgress.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Get all grammar lessons (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { level, category, search } = req.query;
    const query = { isPublic: true };

    if (level) query.level = level;
    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const lessons = await GrammarLesson.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single grammar lesson
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await GrammarLesson.findById(req.params.id)
      .populate('createdBy', 'username avatar');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create grammar lesson (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const lesson = new GrammarLesson({
      ...req.body,
      createdBy: req.user.userId
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update grammar lesson (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const lesson = await GrammarLesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete grammar lesson (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const lesson = await GrammarLesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    await GrammarProgress.deleteMany({ lesson: req.params.id });
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit exercise answers
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body; // Array of { exerciseId, userAnswer }
    const lesson = await GrammarLesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Calculate score
    let correct = 0;
    const results = answers.map(answer => {
      const exercise = lesson.exercises.id(answer.exerciseId);
      let isCorrect = false;

      if (exercise.type === 'multiple-choice') {
        isCorrect = answer.userAnswer === exercise.correctAnswer;
      } else if (exercise.type === 'fill-in-blank') {
        // Check all blanks
        isCorrect = exercise.blanks.every((blank, idx) => {
          const userAns = answer.userAnswer[idx]?.toLowerCase().trim();
          const correctAns = blank.correctAnswer.toLowerCase().trim();
          const alternatives = blank.alternatives?.map(a => a.toLowerCase().trim()) || [];
          return userAns === correctAns || alternatives.includes(userAns);
        });
      } else if (exercise.type === 'sentence-correction' || exercise.type === 'sentence-reorder') {
        isCorrect = answer.userAnswer.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim();
      }

      if (isCorrect) correct++;

      return {
        exerciseId: answer.exerciseId,
        correct: isCorrect,
        userAnswer: answer.userAnswer,
        timestamp: new Date()
      };
    });

    const score = Math.round((correct / answers.length) * 100);

    // Update or create progress
    let progress = await GrammarProgress.findOne({
      user: req.user.userId,
      lesson: req.params.id
    });

    if (progress) {
      progress.score = score;
      progress.attempts += 1;
      progress.lastAttemptDate = new Date();
      progress.completed = score >= 70;
      progress.exerciseResults = results;
    } else {
      progress = new GrammarProgress({
        user: req.user.userId,
        lesson: req.params.id,
        score,
        attempts: 1,
        lastAttemptDate: new Date(),
        completed: score >= 70,
        exerciseResults: results
      });
    }

    await progress.save();

    res.json({
      score,
      correct,
      total: answers.length,
      passed: score >= 70,
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user progress for a lesson
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const progress = await GrammarProgress.findOne({
      user: req.user.userId,
      lesson: req.params.id
    });

    res.json(progress || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all user progress
router.get('/user/progress', auth, async (req, res) => {
  try {
    const progress = await GrammarProgress.find({ user: req.user.userId })
      .populate('lesson', 'title category level')
      .sort({ lastAttemptDate: -1 });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
