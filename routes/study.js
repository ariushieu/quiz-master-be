import express from 'express';
import StudyProgress from '../models/StudyProgress.js';
import FlashcardSet from '../models/FlashcardSet.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// SM-2 Algorithm
function calculateSM2(quality, prevEaseFactor, prevInterval, prevRepetitions) {
    let easeFactor = prevEaseFactor;
    let interval = prevInterval;
    let repetitions = prevRepetitions;

    if (quality >= 3) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(prevInterval * easeFactor);
        repetitions += 1;
    } else {
        repetitions = 0;
        interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);

    return { easeFactor, interval, repetitions };
}

// Get cards due for review
router.get('/:setId', auth, async (req, res) => {
    try {
        const set = await FlashcardSet.findById(req.params.setId);

        if (!set) {
            return res.status(404).json({ message: 'Set not found' });
        }

        // Access check: Owner or Public
        if (set.userId.toString() !== req.user._id.toString() && !set.isPublic) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const now = new Date();

        const cardsWithProgress = await Promise.all(
            set.cards.map(async (card, index) => {
                let progress = await StudyProgress.findOne({
                    userId: req.user._id,
                    setId: set._id,
                    cardIndex: index
                });

                if (!progress) {
                    progress = {
                        cardIndex: index,
                        easeFactor: 2.5,
                        interval: 0,
                        repetitions: 0,
                        nextReviewDate: now,
                        isNew: true
                    };
                }

                return {
                    ...card.toObject(),
                    cardIndex: index,
                    progress: {
                        isDue: new Date(progress.nextReviewDate) <= now
                    }
                };
            })
        );

        const dueCards = cardsWithProgress.filter(c => c.progress.isDue);

        res.json({
            setTitle: set.title,
            totalCards: set.cards.length,
            dueCards: dueCards.length,
            cards: dueCards
        });
    } catch (error) {
        console.error('Study get error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit review for a card
router.post('/:setId/review', auth, async (req, res) => {
    try {
        const { cardIndex, quality } = req.body;

        const set = await FlashcardSet.findById(req.params.setId);

        if (!set) {
            return res.status(404).json({ message: 'Set not found' });
        }

        // Access check
        if (set.userId.toString() !== req.user._id.toString() && !set.isPublic) {
            return res.status(403).json({ message: 'Access denied' });
        }

        let progress = await StudyProgress.findOne({
            userId: req.user._id,
            setId: set._id,
            cardIndex
        });

        const now = new Date();

        if (!progress) {
            progress = new StudyProgress({
                userId: req.user._id,
                setId: set._id,
                cardIndex,
                isStudied: false
            });
        }

        // Calculate SM-2 values
        const { easeFactor, interval, repetitions } = calculateSM2(
            quality,
            progress.easeFactor,
            progress.interval,
            progress.repetitions
        );

        progress.easeFactor = easeFactor;
        progress.interval = interval;
        progress.repetitions = repetitions;
        progress.lastReviewDate = now;
        progress.nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

        // Update user stats
        const User = (await import('../models/User.js')).default;
        const { checkAchievements } = await import('../config/achievements.js');

        const user = await User.findById(req.user._id);
        if (user) {
            // Only count if card not studied before
            if (!progress.isStudied) {
                user.stats.totalCardsStudied += 1;
                progress.isStudied = true;
            }

            if (quality >= 3) {
                user.stats.totalCorrectAnswers += 1;
            }

            // Track card - streak activates when 10 cards studied today
            const { timezoneOffset } = req.body;
            user.trackCardStudied(timezoneOffset);

            // SAVE DATA FIRST - Respond to client ASAP
            await Promise.all([user.save(), progress.save()]);

            res.json({
                message: 'Review recorded',
                nextReviewDate: progress.nextReviewDate,
                interval: progress.interval,
                cardsStudiedToday: user.stats.cardsStudiedToday
            });

            // NON-BLOCKING BACKGROUND TASKS
            // Check achievements and Leaderboard significantly slows down the response
            // so we run it after sending response
            (async () => {
                try {
                    // Check achievements
                    const newAchievements = checkAchievements(user);
                    if (newAchievements.length > 0) {
                        await user.save(); // Save again if achievements unlocked
                    }

                    // Check for Champion Badge (Top 1)
                    // Only check if user has high streak or high cards to avoid spamming DB on every newbie click
                    if ((user.stats.currentStreak > 3 || user.stats.totalCardsStudied > 50) && !user.achievements.includes('champion')) {
                        const topUser = await User.findOne()
                            .sort({
                                'stats.currentStreak': -1,
                                'stats.totalCardsStudied': -1,
                                'stats.longestStreak': -1
                            })
                            .select('_id');

                        if (topUser && topUser._id.toString() === user._id.toString()) {
                            user.achievements.push('champion');
                            await user.save();
                        }
                    }
                } catch (bgError) {
                    console.error('Background stats update error:', bgError);
                }
            })();

        } else {
            await progress.save();
            res.json({
                message: 'Review recorded',
                nextReviewDate: progress.nextReviewDate,
                interval: progress.interval
            });
        }
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get study statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const now = new Date();

        const totalProgress = await StudyProgress.countDocuments({
            userId: req.user._id,
            isStudied: true
        });

        const dueToday = await StudyProgress.countDocuments({
            userId: req.user._id,
            nextReviewDate: { $lte: now }
        });

        res.json({
            totalCardsStudied: totalProgress,
            dueToday
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
