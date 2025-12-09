import express from 'express';
import FlashcardSet from '../models/FlashcardSet.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get public sets (Explore)
router.get('/public', auth, async (req, res) => {
    try {
        const sets = await FlashcardSet.find({ isPublic: true })
            .populate('userId', 'username avatar')
            .sort({ createdAt: -1 });
        res.json(sets);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all sets for current user
router.get('/', auth, async (req, res) => {
    try {
        const sets = await FlashcardSet.find({ userId: req.user._id })
            .sort({ updatedAt: -1 });
        res.json(sets);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single set
router.get('/:id', auth, async (req, res) => {
    try {
        const set = await FlashcardSet.findById(req.params.id).populate('userId', 'username');

        if (!set) {
            return res.status(404).json({ message: 'Set not found' });
        }

        // Check access: Owner or Public
        if (set.userId._id.toString() !== req.user._id.toString() && !set.isPublic) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(set);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new set
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, cards, isPublic } = req.body;

        const set = new FlashcardSet({
            title,
            description,
            cards: cards || [],
            isPublic: isPublic || false,
            userId: req.user._id
        });

        await set.save();
        res.status(201).json(set);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update set
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description, cards, isPublic } = req.body;

        const set = await FlashcardSet.findOne({ _id: req.params.id, userId: req.user._id });

        if (!set) {
            return res.status(404).json({ message: 'Set not found or unauthorized' });
        }

        set.title = title;
        set.description = description;
        set.cards = cards;
        if (isPublic !== undefined) set.isPublic = isPublic;
        set.updatedAt = new Date();

        await set.save();
        res.json(set);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete set
router.delete('/:id', auth, async (req, res) => {
    try {
        const set = await FlashcardSet.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!set) {
            return res.status(404).json({ message: 'Set not found' });
        }

        res.json({ message: 'Set deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
