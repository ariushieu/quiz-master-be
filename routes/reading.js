import express from 'express';
import ReadingPassage from '../models/ReadingPassage.js';
import { auth, admin } from '../middleware/auth.js';

const router = express.Router();

// Create new passage (Admin only)
router.post('/', auth, admin, async (req, res) => {
    try {
        const { title, passageText, level, topic, questions, isPublic } = req.body;

        // Basic validation
        if (!title || !passageText) {
            return res.status(400).json({ message: 'Title and Passage Text are required' });
        }

        const newPassage = new ReadingPassage({
            title,
            passageText,
            level,
            topic,
            questions: questions || [],
            isPublic: isPublic !== undefined ? isPublic : true,
            createdBy: req.user.id
        });

        const savedPassage = await newPassage.save();
        res.status(201).json(savedPassage);
    } catch (err) {
        console.error('Error in POST /api/reading:', err);
        res.status(500).json({ message: 'Failed to create reading passage' });
    }
});

// Get all passages (minimal info for list)
router.get('/', async (req, res) => {
    try {
        const passages = await ReadingPassage.find({ isPublic: true })
            .select('title level topic description questions createdAt')
            .sort({ createdAt: -1 });
        res.json(passages);
    } catch (err) {
        console.error('Error in GET /api/reading:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get single passage by ID
router.get('/:id', async (req, res) => {
    try {
        const passage = await ReadingPassage.findById(req.params.id);
        if (!passage) return res.status(404).json({ message: 'Passage not found' });
        res.json(passage);
    } catch (err) {
        console.error('Error in GET /api/reading/:id', err);
        res.status(500).json({ message: err.message });
    }
});

// Update passage (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const { title, passageText, level, topic, questions, isPublic } = req.body;

        const updatedPassage = await ReadingPassage.findByIdAndUpdate(
            req.params.id,
            { title, passageText, level, topic, questions, isPublic },
            { new: true }
        );

        if (!updatedPassage) {
            return res.status(404).json({ message: 'Passage not found' });
        }

        res.json(updatedPassage);
    } catch (err) {
        console.error('Error in PUT /api/reading/:id', err);
        res.status(500).json({ message: 'Failed to update passage' });
    }
});

// Delete passage (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const deletedPassage = await ReadingPassage.findByIdAndDelete(req.params.id);

        if (!deletedPassage) {
            return res.status(404).json({ message: 'Passage not found' });
        }

        res.json({ message: 'Passage deleted successfully' });
    } catch (err) {
        console.error('Error in DELETE /api/reading/:id', err);
        res.status(500).json({ message: 'Failed to delete passage' });
    }
});

export default router;
