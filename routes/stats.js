import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { ACHIEVEMENTS, getAchievementsStatus } from '../config/achievements.js';

const router = express.Router();

// Get current user's stats
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            username: user.username,
            avatar: user.avatar,
            stats: user.stats || {
                totalCardsStudied: 0,
                totalQuizzesTaken: 0,
                totalCorrectAnswers: 0,
                currentStreak: 0,
                longestStreak: 0,
                xp: 0
            },
            achievementsCount: user.achievements?.length || 0,
            totalAchievements: Object.keys(ACHIEVEMENTS).length,
            memberSince: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get achievements for current user
router.get('/achievements', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const achievements = getAchievementsStatus(user);
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get leaderboard - Top users by STREAK
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const users = await User.find()
            .select('username avatar stats.xp stats.totalCardsStudied stats.currentStreak stats.longestStreak achievements')
            .sort({ 'stats.currentStreak': -1, 'stats.longestStreak': -1 })
            .limit(20);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            avatar: user.avatar,
            xp: user.stats?.xp || 0,
            cardsStudied: user.stats?.totalCardsStudied || 0,
            streak: user.stats?.currentStreak || 0,
            longestStreak: user.stats?.longestStreak || 0,
            achievementsCount: user.achievements?.length || 0
        }));

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get specific user's public profile
router.get('/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('username avatar stats achievements createdAt');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const achievements = getAchievementsStatus(user);
        const unlockedAchievements = achievements.filter(a => a.unlocked);

        res.json({
            username: user.username,
            avatar: user.avatar,
            stats: user.stats,
            achievements: unlockedAchievements,
            memberSince: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
