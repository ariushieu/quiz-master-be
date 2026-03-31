import express from 'express';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

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

// Generate flashcards from raw note text (admin only)
router.post('/generate-flashcards', auth, adminAuth, async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'AI not configured' });
        }

        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Note content is required' });
        }

        const MAX_CHARS = 50000;
        if (text.length > MAX_CHARS) {
            return res.status(400).json({
                message: `Note is too long (${text.length} characters). Maximum is ${MAX_CHARS} characters.`
            });
        }

        const systemPrompt = `You are a vocabulary flashcard generator for Vietnamese learners studying English. Your task is to parse raw, unstructured vocabulary notes and SPLIT them into MULTIPLE flashcard sets grouped by topic.

CRITICAL: ALWAYS SPLIT BY TOPIC.
- If the notes contain words about music, daily routine, food, travel, etc. — create SEPARATE sets for each topic.
- NEVER combine different topics into one set. Each set should have a clear, specific theme.
- Even if the user did not explicitly label topics, YOU must detect and group them logically.
- If ALL words genuinely belong to one single topic, then return one set. But this should be rare.

CRITICAL RULES FOR EACH FIELD:

"term": The English word or phrase exactly as written by the user. Do NOT modify or correct it.

"definition": MUST be in Vietnamese. MUST be short — only 1-3 words or a brief phrase. This is the quick-glance meaning shown on the flashcard.
  GOOD examples: "phong phú", "từ bỏ", "kiên trì", "sự bền bỉ", "đáng tin cậy"
  BAD examples: "có nghĩa là rất nhiều, dồi dào" (too long), "abundant" (not Vietnamese), "available in large quantities, plentiful" (English, too long)
  If the user already wrote a Vietnamese definition, use it as-is (keep it short).
  If the user only wrote an English definition, translate it to Vietnamese and keep it concise.

"note": ALWAYS populate this field — never leave it empty. Include ALL of the following:
  1. IPA pronunciation (e.g., /əˈbʌndənt/)
  2. Part of speech (n., v., adj., adv., etc.)
  3. One example sentence in English
  4. Common collocations or usage patterns if relevant
  Format: each piece of info on a new line, like:
  "/əˈbʌndənt/ (adj.)\\nEx: Natural resources are abundant in this region.\\nCollocation: abundant supply, abundant evidence"

"title": MUST be in English. Short, descriptive topic name.
  GOOD: "Music Vocabulary", "Daily Routine", "Food & Cooking", "Business English"
  BAD: "Từ vựng âm nhạc" (not English), "Vocabulary Set" (too generic), "Mixed Words" (too vague)

"description": MUST be in English. One sentence describing the set.
  GOOD: "Common English words related to musical instruments and genres"
  BAD: "Các từ vựng về âm nhạc" (not English)

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown fences, no explanation:
{
  "sets": [
    {
      "title": "string",
      "description": "string",
      "cards": [
        { "term": "string", "definition": "string", "note": "string" }
      ]
    }
  ]
}

ADDITIONAL RULES:
- Minimum 1 set with 1 card. If no recognizable vocabulary: return { "sets": [] }
- Maximum ~200 cards total across all sets.
- Do NOT add cards for non-vocabulary content (instructions, headers, page numbers, etc.).
- Preserve the user's original terms exactly.
- Each set should have at least 2 cards. If a topic has only 1 word, merge it into the most related set.`;

        const userMessage = `Parse the following raw vocabulary notes into structured flashcard sets, grouped by topic:\n\n${text}`;

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: 'I understand. I will split vocabulary into topic-based sets with Vietnamese definitions and rich notes. Send me the vocabulary notes.' }] },
                    { role: 'user', parts: [{ text: userMessage }] }
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 8192,
                    thinkingConfig: { thinkingBudget: 0 }
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API error:', data);
            return res.status(500).json({
                message: data.error?.message || 'AI generation failed'
            });
        }

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return res.status(500).json({ message: 'No response from AI' });
        }

        // Parse JSON — strip markdown fences if AI includes them despite instructions
        let parsed;
        try {
            const cleaned = rawText
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            parsed = JSON.parse(cleaned);
        } catch (parseError) {
            console.error('JSON parse error:', parseError, '\nRaw:', rawText);
            return res.status(500).json({
                message: 'AI returned invalid format. Please try again.'
            });
        }

        // Support both old format { cards: [] } and new format { sets: [] }
        let sets;
        if (parsed.sets && Array.isArray(parsed.sets)) {
            sets = parsed.sets;
        } else if (parsed.cards && Array.isArray(parsed.cards)) {
            // Fallback: AI returned old single-set format
            sets = [{
                title: parsed.title || 'Untitled Set',
                description: parsed.description || '',
                cards: parsed.cards
            }];
        } else {
            return res.status(500).json({
                message: 'AI returned unexpected structure. Please try again.'
            });
        }

        // Sanitize each set
        const sanitizedSets = sets
            .map(set => ({
                title: set.title ? String(set.title).trim() : 'Untitled Set',
                description: set.description ? String(set.description).trim() : '',
                cards: (set.cards || [])
                    .filter(c => c.term && c.definition)
                    .map(c => ({
                        term: String(c.term).trim(),
                        definition: String(c.definition).trim(),
                        note: c.note ? String(c.note).trim() : ''
                    }))
            }))
            .filter(set => set.cards.length > 0);

        res.json({ sets: sanitizedSets });

    } catch (error) {
        console.error('Generate flashcards error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
