import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Explain a flashcard
router.post('/explain', auth, async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'AI chưa được cấu hình' });
        }

        const { term, definition } = req.body;
        if (!term || !definition) {
            return res.status(400).json({ message: 'Missing term/definition' });
        }

        const prompt = `Flashcard: Term="${term}", Definition="${definition}".
Provide: 1) Explanation 2) 2 examples 3) Memory tip. Be concise. Use Vietnamese if definition is Vietnamese.`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048, thinkingConfig: { thinkingBudget: 0 } }
            })
        });

        const data = await response.json();
        if (!response.ok) return res.status(500).json({ message: data.error?.message || 'AI error' });

        const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!explanation) return res.status(500).json({ message: 'No AI response' });

        res.json({ explanation });
    } catch (error) {
        console.error('AI explain error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Chat with AI
router.post('/chat', auth, async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ message: 'AI not configured' });

        const { term, definition, question, history = [] } = req.body;

        const systemPrompt = `You are a helpful language learning assistant. Student is studying: Term="${term}", Definition="${definition}". Help them learn. Use markdown formatting. Use Vietnamese if definition is Vietnamese.`;

        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Tôi sẽ giúp bạn học từ này!' }] }
        ];

        // Add history (last 6 messages)
        for (const msg of history.slice(-6)) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }

        contents.push({ role: 'user', parts: [{ text: question }] });

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
                contents,
                generationConfig: { temperature: 0.8, maxOutputTokens: 1024, thinkingConfig: { thinkingBudget: 0 } }
            })
        });

        const data = await response.json();
        if (!response.ok) return res.status(500).json({ message: data.error?.message || 'AI error' });

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return res.status(500).json({ message: 'No response' });

        res.json({ response: text });
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Generate quiz hint
router.post('/hint', auth, async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return res.status(500).json({ message: 'AI not configured' });

        const { term, definition } = req.body;
        const prompt = `Short hint (max 10 words) to remember "${term}" = "${definition}". Just the hint.`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 100, thinkingConfig: { thinkingBudget: 0 } }
            })
        });

        if (!response.ok) return res.status(500).json({ message: 'Failed' });

        const data = await response.json();
        const hint = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        res.json({ hint });
    } catch (error) {
        console.error('AI hint error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
