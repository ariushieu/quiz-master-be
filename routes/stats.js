import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import { ACHIEVEMENTS, SPECIAL_BADGES, getAchievementsStatus, getSpecialBadgesStatus, getUnlockedSpecialBadges } from '../config/achievements.js';

const router = express.Router();

// Helper to check if a user is Top 1
async function checkIsTop1(userId) {
    const topUser = await User.findOne()
        .sort({
            'stats.currentStreak': -1,
            'stats.totalCardsStudied': -1,
            'stats.longestStreak': -1
        })
        .select('_id');

    return topUser && topUser._id.toString() === userId.toString();
}

// Get current user's stats
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for Champion Badge (Top 1)
        const isTop1 = await checkIsTop1(user._id);

        if (isTop1 && !user.achievements.includes('champion')) {
            user.achievements.push('champion');
            await user.save();
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

// Helper to calculate real-time streak (check if user missed days)
function calculateRealStreak(user) {
    const storedStreak = user.stats?.currentStreak || 0;
    const lastStudyDate = user.stats?.lastStudyDate;

    if (!lastStudyDate || storedStreak === 0) {
        return 0;
    }

    const now = new Date();
    const lastStudy = new Date(lastStudyDate);

    // Calculate difference in days (using UTC to avoid timezone issues)
    const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const lastDay = Date.UTC(lastStudy.getUTCFullYear(), lastStudy.getUTCMonth(), lastStudy.getUTCDate());
    const diffDays = Math.floor((nowDay - lastDay) / (1000 * 60 * 60 * 24));

    // If more than 1 day passed, streak is broken
    // 0 = today (still valid)
    // 1 = yesterday (still valid, waiting for today's study)
    // > 1 = missed at least one day, streak broken
    if (diffDays > 1) {
        return 0;
    }

    return storedStreak;
}

// Get leaderboard - Top users by STREAK
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const users = await User.find()
            .select('username avatar stats.xp stats.totalCardsStudied stats.currentStreak stats.longestStreak stats.lastStudyDate achievements')
            .limit(100); // Get more users to sort after calculating real streak

        // Calculate real streak for each user
        const leaderboardData = users.map(user => ({
            username: user.username,
            avatar: user.avatar,
            xp: user.stats?.xp || 0,
            cardsStudied: user.stats?.totalCardsStudied || 0,
            streak: calculateRealStreak(user),
            longestStreak: user.stats?.longestStreak || 0,
            achievementsCount: user.achievements?.length || 0
        }));

        // Sort by real streak (desc), then cardsStudied (desc), then longestStreak (desc)
        leaderboardData.sort((a, b) => {
            if (b.streak !== a.streak) return b.streak - a.streak;
            if (b.cardsStudied !== a.cardsStudied) return b.cardsStudied - a.cardsStudied;
            return b.longestStreak - a.longestStreak;
        });

        // Take top 20 and add rank
        const leaderboard = leaderboardData.slice(0, 20).map((user, index) => ({
            rank: index + 1,
            ...user
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
