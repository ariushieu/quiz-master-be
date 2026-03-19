import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GrammarLesson from '../models/GrammarLesson.js';
import User from '../models/User.js';

dotenv.config();

const grammarLessons = [
  {
    title: 'Present Simple vs Present Continuous',
    description: 'Learn when to use present simple and present continuous tenses',
    level: 'beginner',
    category: 'tenses',
    difficulty: 2,
    content: `# Present Simple vs Present Continuous

## Present Simple
Used for:
- Habits and routines: "I drink coffee every morning"
- General truths: "The sun rises in the east"
- Permanent situations: "She works in a bank"

Structure: Subject + base verb (+ s/es for he/she/it)

## Present Continuous
Used for:
- Actions happening now: "I am studying English"
- Temporary situations: "She is staying with friends this week"
- Future arrangements: "We are meeting tomorrow"

Structure: Subject + am/is/are + verb-ing`,
    examples: [
      {
        sentence: 'I work from 9 to 5 every day.',
        translation: 'Tôi làm việc từ 9 giờ đến 5 giờ mỗi ngày.'
      },
      {
        sentence: 'I am working on a special project this week.',
        translation: 'Tuần này tôi đang làm một dự án đặc biệt.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'She ___ to work by bus every day.',
        options: ['go', 'goes', 'is going', 'going'],
        correctAnswer: 'goes',
        hint: 'This is a daily routine',
        explanation: 'We use present simple for habits and routines'
      },
      {
        type: 'multiple-choice',
        question: 'Look! It ___ outside.',
        options: ['rain', 'rains', 'is raining', 'raining'],
        correctAnswer: 'is raining',
        hint: 'This is happening right now',
        explanation: 'We use present continuous for actions happening now'
      },
      {
        type: 'fill-in-blank',
        question: 'I usually ___ coffee, but today I ___ tea.',
        blanks: [
          { position: 0, correctAnswer: 'drink', alternatives: [] },
          { position: 1, correctAnswer: 'am drinking', alternatives: ["'m drinking"] }
        ],
        hint: 'First blank is a habit, second is happening now'
      }
    ],
    tags: ['tenses', 'present', 'beginner']
  },
  {
    title: 'Past Simple - Regular and Irregular Verbs',
    description: 'Master the past simple tense with regular and irregular verbs',
    level: 'beginner',
    category: 'tenses',
    difficulty: 2,
    content: `# Past Simple Tense

Used for completed actions in the past.

## Regular Verbs
Add -ed to the base form:
- work → worked
- play → played
- study → studied

## Irregular Verbs
Must be memorized:
- go → went
- eat → ate
- see → saw
- buy → bought

## Negative: didn't + base verb
"I didn't go to school yesterday"

## Question: Did + subject + base verb?
"Did you see the movie?"`,
    examples: [
      {
        sentence: 'I visited Paris last summer.',
        translation: 'Tôi đã đến thăm Paris mùa hè năm ngoái.'
      },
      {
        sentence: 'She bought a new car yesterday.',
        translation: 'Cô ấy đã mua một chiếc xe mới hôm qua.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'They ___ to the cinema last night.',
        options: ['go', 'goes', 'went', 'going'],
        correctAnswer: 'went',
        hint: 'This is an irregular verb'
      },
      {
        type: 'multiple-choice',
        question: 'I ___ my homework yesterday.',
        options: ['finish', 'finished', 'finishing', 'finishes'],
        correctAnswer: 'finished',
        hint: 'This is a regular verb'
      },
      {
        type: 'sentence-correction',
        question: 'Correct this sentence: "She didn\'t went to school yesterday."',
        correctAnswer: "She didn't go to school yesterday.",
        hint: 'After didn\'t, use the base form'
      }
    ],
    tags: ['tenses', 'past', 'beginner']
  },
  {
    title: 'First Conditional',
    description: 'Learn how to talk about real possibilities in the future',
    level: 'intermediate',
    category: 'conditionals',
    difficulty: 3,
    content: `# First Conditional

Used for real or possible situations in the future.

## Structure
If + present simple, will + base verb

## Examples
- If it rains, I will stay home.
- If you study hard, you will pass the exam.

## Notes
- The "if" clause can come first or second
- We can use "unless" (= if not)
- Other modals can replace "will": can, may, might, should`,
    examples: [
      {
        sentence: 'If I have time, I will call you.',
        translation: 'Nếu tôi có thời gian, tôi sẽ gọi cho bạn.'
      },
      {
        sentence: 'You will get wet if you don\'t take an umbrella.',
        translation: 'Bạn sẽ bị ướt nếu không mang ô.'
      }
    ],
    exercises: [
      {
        type: 'multiple-choice',
        question: 'If she ___ early, she ___ the bus.',
        options: [
          'leaves, will catch',
          'will leave, catches',
          'leave, will catch',
          'leaves, catches'
        ],
        correctAnswer: 'leaves, will catch',
        hint: 'If + present simple, will + base verb'
      },
      {
        type: 'fill-in-blank',
        question: 'If it ___ tomorrow, we ___ go to the beach.',
        blanks: [
          { position: 0, correctAnswer: 'rains', alternatives: [] },
          { position: 1, correctAnswer: "won't", alternatives: ['will not'] }
        ]
      }
    ],
    tags: ['conditionals', 'intermediate', 'future']
  }
];

async function seedGrammar() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing grammar lessons
    await GrammarLesson.deleteMany({});
    console.log('🗑️  Cleared existing grammar lessons');

    // Add createdBy to each lesson
    const lessonsWithCreator = grammarLessons.map(lesson => ({
      ...lesson,
      createdBy: admin._id
    }));

    // Insert lessons
    await GrammarLesson.insertMany(lessonsWithCreator);
    console.log(`✅ Added ${grammarLessons.length} grammar lessons`);

    console.log('🎉 Grammar seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding grammar:', error);
    process.exit(1);
  }
}

seedGrammar();
