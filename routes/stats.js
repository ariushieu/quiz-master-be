import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { ACHIEVEMENTS, SPECIAL_BADGES, getAchievementsStatus, getSpecialBadgesStatus, getUnlockedSpecialBadges } from '../config/achievements.js';

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
            specialBadgesCount: user.specialBadges?.length || 0,
            totalSpecialBadges: Object.keys(SPECIAL_BADGES).length,
            memberSince: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get achievements for current user (includes special badges)
router.get('/achievements', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const achievements = getAchievementsStatus(user);
        const specialBadges = getSpecialBadgesStatus(user);

        res.json({
            achievements,
            specialBadges
        });
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
            .select('username avatar stats achievements specialBadges createdAt');

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
            specialBadges: getUnlockedSpecialBadges(user),
            memberSince: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Claim quest badge
// Claim quest badge
router.post('/claim-quest', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const badgeId = 'newcomer';

        // Ensure achievements array exists
        if (!user.achievements) {
            user.achievements = [];
        }

        if (user.achievements.includes(badgeId)) {
            // If already claimed, just return success
            return res.json({ success: true, message: 'Achievement already owned', badge: ACHIEVEMENTS[badgeId] });
        }

        user.achievements.push(badgeId);

        await user.save();
        res.json({ success: true, message: 'Achievement granted', badge: ACHIEVEMENTS[badgeId] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
