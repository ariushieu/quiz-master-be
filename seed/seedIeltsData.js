import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ReadingPassage from '../models/ReadingPassage.js';
import User from '../models/User.js';

dotenv.config();

const PASSAGES = [
    {
        title: "The Cork Oak",
        level: "IELTS Passage 1",
        topic: "Nature & Environment",
        passageText: `
<p><strong>The Cork Oak: A Renewable Resource</strong></p>
<p>Cork – the thick bark of the cork oak tree (Quercus suber) – is a remarkable material. It is tough, elastic, buoyant, and fire-resistant, suitable for a wide range of purposes. It has also been used for millennia: the ancient Egyptians sealed their sarcophagi (stone coffins) with cork, while the ancient Greeks and Romans used it for anything from beehives to sandals.</p>

<p>And the cork oak itself is an extraordinary tree. Its bark grows up to 20 cm in thickness, isolating the tree like a coat wrapped around the trunk and branches and keeping the inside temperature constant at 20°C all year round. Developed most probably as a defence against forest fires, the bark of the cork oak has a particular cellular structure – with about 40 million cells per cubic centimetre – that naught of technology has succeeded in replicating.</p>

<p>Most cork forests are found in climatic zones with Mediterranean conditions: long, hot, dry summers and mild, wet winters. The major cork-producing countries are Portugal, Spain, Algeria, Morocco, Italy, Tunisia and France. Portugal, which accounts for around 50 per cent of the world's cork production, has strict laws defending its cork forests, which are known as montados. It is illegal to cut down a cork oak without permission.</p>

<p>Cork harvesting is a very specialised profession. No mechanical means of stripping cork bark has been invented, so the job is done by teams of men using hand axes. The process is highly skilled. First, they make vertical cuts down the bark using small sharp axes, then leverage it away in pieces as large as possible. The most difficult part of the job is not to damage the innermost layer of the bark, the cambium, which is responsible for the regeneration of the bark. If this layer is damaged, the cork will not grow back.</p>

<p>The harvest takes place in summer, between May and August. A tree has to be about 25 years old before it can be stripped for the first time, and then it can only be harvested every nine years. The first harvest produces cork of poor quality, known as 'virgin cork', which is used for insulation or flooring. The second harvest, nine years later, produces better quality cork, but it is still not good enough for wine stoppers. It is only the third harvest, when the tree is over 40 years old, that the cork is of high enough quality to be used for wine stoppers, which account for about 60% of the trade.</p>
        `,
        questions: [
            // GROUP 1: Questions 1-5 (True/False/Not Given)
            {
                questionText: "The cork oak has the thickest bark of any living tree.",
                type: "true-false-not-given",
                options: ["True", "False", "Not Given"],
                correctAnswer: "Not Given",
                explanation: "The text says the bark grows up to 20cm, but doesn't compare it to 'any living tree'.",
                groupLabel: "Questions 1-5",
                groupInstruction: "Do the following statements agree with the information given in Reading Passage 1? In boxes 1-5, choose: TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this."
            },
            {
                questionText: "Scientists have developed a synthetic material with the same cellular structure as cork.",
                type: "true-false-not-given",
                options: ["True", "False", "Not Given"],
                correctAnswer: "False",
                explanation: "The text says 'naught of technology has succeeded in replicating' the cellular structure.",
                groupLabel: "Questions 1-5",
                groupInstruction: "Do the following statements agree with the information given in Reading Passage 1? In boxes 1-5, choose: TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this."
            },
            {
                questionText: "The cork oak bark protects the tree from fire.",
                type: "true-false-not-given",
                options: ["True", "False", "Not Given"],
                correctAnswer: "True",
                explanation: "The text states it was 'Developed most probably as a defence against forest fires'.",
                groupLabel: "Questions 1-5",
                groupInstruction: "Do the following statements agree with the information given in Reading Passage 1? In boxes 1-5, choose: TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this."
            },
            {
                questionText: "Ideally, cork should be stripped in the winter months.",
                type: "true-false-not-given",
                options: ["True", "False", "Not Given"],
                correctAnswer: "False",
                explanation: "The text says 'The harvest takes place in summer, between May and August'.",
                groupLabel: "Questions 1-5",
                groupInstruction: "Do the following statements agree with the information given in Reading Passage 1? In boxes 1-5, choose: TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this."
            },
            {
                questionText: "Portuguese law forbids the cutting down of cork oak trees without authorization.",
                type: "true-false-not-given",
                options: ["True", "False", "Not Given"],
                correctAnswer: "True",
                explanation: "The text says 'It is illegal to cut down a cork oak without permission'.",
                groupLabel: "Questions 1-5",
                groupInstruction: "Do the following statements agree with the information given in Reading Passage 1? In boxes 1-5, choose: TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this."
            },

            // GROUP 2: Questions 6-13 (Fill in the blank)
            {
                questionText: "The cork oak's bark fits the trunk like a _______.",
                type: "fill-in-blank",
                correctAnswer: "coat",
                wordLimit: "ONE WORD ONLY",
                explanation: "Text: 'isolating the tree like a coat wrapped around the trunk'.",
                groupLabel: "Questions 6-13",
                groupInstruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer."
            },
            {
                questionText: "Cork forests in Portugal are called _______.",
                type: "fill-in-blank",
                correctAnswer: "montados",
                wordLimit: "ONE WORD ONLY",
                explanation: "Text: 'cork forests, which are known as montados'.",
                groupLabel: "Questions 6-13",
                groupInstruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer."
            },
            {
                questionText: "The layer of the bark that allows it to grow back is called the _______.",
                type: "fill-in-blank",
                correctAnswer: "cambium",
                wordLimit: "ONE WORD ONLY",
                explanation: "Text: 'the innermost layer of the bark, the cambium'.",
                groupLabel: "Questions 6-13",
                groupInstruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer."
            },
            {
                questionText: "To harvest cork, workers use _______.",
                type: "fill-in-blank",
                correctAnswer: "axes",
                wordLimit: "ONE WORD ONLY",
                explanation: "Text: 'teams of men using hand axes'.",
                groupLabel: "Questions 6-13",
                groupInstruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer."
            },
            {
                questionText: "The first harvest yields cork that is described as _______.",
                type: "fill-in-blank",
                correctAnswer: "poor",
                wordLimit: "ONE WORD ONLY",
                explanation: "Text: 'produces cork of poor quality'.", // "virgin" is also correct but "poor" fits the adj slot 
                groupLabel: "Questions 6-13",
                groupInstruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer."
            },
            {
                questionText: "Cork suitable for wine stoppers is only available after the _______ harvest.",
                type: "fill-in-blank",
                correctAnswer: "third",
                wordLimit: "ONE WORD ONLY",
                explanation: "Text: 'It is only the third harvest... that the cork is of high enough quality'.",
                groupLabel: "Questions 6-13",
                groupInstruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer."
            },
            {
                questionText: "Approximately _______ percent of cork is used for wine stoppers.",
                type: "fill-in-blank",
                correctAnswer: "60",
                wordLimit: "ONE WORD AND/OR A NUMBER",
                explanation: "Text: 'account for about 60% of the trade'.",
                groupLabel: "Questions 6-13",
                groupInstruction: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer."
            }
        ]
    }
];

const seedIeltsData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find existing admin
        let adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });

        if (!adminUser) {
            console.warn('⚠️ No admin user found! Creating a dummy admin for seeding...');
            // In a real scenario we might want to fail, but for dev convenience let's pick the first user or fail if empty
            adminUser = await User.findOne().sort({ createdAt: 1 });
            if (!adminUser) {
                console.error('❌ No users found in DB. Please create a user first.');
                process.exit(1);
            }
            console.log(`⚠️ Using first found user as owner: ${adminUser.username}`);
        } else {
            console.log(`Using Admin: ${adminUser.username}`);
        }

        // 2. Clear existing passages to ensure only valid data exists
        await ReadingPassage.deleteMany({});
        console.log('🗑️ Cleared all existing reading passages');

        for (const passageData of PASSAGES) {
            let passage = await ReadingPassage.findOne({ title: passageData.title });

            if (passage) {
                console.log(`ℹ️ Updating existing passage: "${passageData.title}"`);
                passage.passageText = passageData.passageText;
                passage.questions = passageData.questions;
                passage.level = passageData.level;
                passage.topic = passageData.topic;
                passage.createdBy = adminUser._id;
                await passage.save();
            } else {
                console.log(`✅ Creating new passage: "${passageData.title}"`);
                passage = new ReadingPassage({
                    ...passageData,
                    createdBy: adminUser._id
                });
                await passage.save();
            }
        }

        console.log('🎉 IELTS Reading Data Seeded Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding IELTS data:', error);
        process.exit(1);
    }
};

seedIeltsData();
