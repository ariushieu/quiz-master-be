import express from 'express';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import User from '../models/User.js';
import { SPECIAL_BADGES } from '../config/achievements.js';

const router = express.Router();

// Get all users (for admin to select who to grant badge)
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find()
            .select('username email avatar role specialBadges createdAt')
            .sort({ createdAt: -1 });

        res.json(users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            specialBadges: user.specialBadges?.map(b => b.badgeId) || [],
            createdAt: user.createdAt
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get available special badges
router.get('/badges', auth, adminAuth, async (req, res) => {
    try {
        res.json(Object.values(SPECIAL_BADGES));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Grant a special badge to user
router.post('/badge/grant', auth, adminAuth, async (req, res) => {
    try {
        const { userId, badgeId } = req.body;

        // Validate badge exists
        if (!SPECIAL_BADGES[badgeId]) {
            return res.status(400).json({ message: 'Invalid badge ID' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user already has this badge
        const hasBadge = user.specialBadges?.some(b => b.badgeId === badgeId);
        if (hasBadge) {
            return res.status(400).json({ message: 'User already has this badge' });
        }

        // Grant the badge
        if (!user.specialBadges) {
            user.specialBadges = [];
        }

        user.specialBadges.push({
            badgeId,
            grantedAt: new Date(),
            grantedBy: req.user._id
        });

        await user.save();

        res.json({
            message: `Badge "${SPECIAL_BADGES[badgeId].name}" granted to ${user.username}`,
            badge: SPECIAL_BADGES[badgeId],
            user: {
                id: user._id,
                username: user.username,
                specialBadges: user.specialBadges
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Revoke a special badge from user
router.post('/badge/revoke', auth, adminAuth, async (req, res) => {
    try {
        const { userId, badgeId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has this badge
        const badgeIndex = user.specialBadges?.findIndex(b => b.badgeId === badgeId);
        if (badgeIndex === -1 || badgeIndex === undefined) {
            return res.status(400).json({ message: 'User does not have this badge' });
        }

        // Remove the badge
        user.specialBadges.splice(badgeIndex, 1);
        await user.save();

        res.json({
            message: `Badge revoked from ${user.username}`,
            user: {
                id: user._id,
                username: user.username,
                specialBadges: user.specialBadges
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
