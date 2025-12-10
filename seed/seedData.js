import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FlashcardSet from '../models/FlashcardSet.js';

dotenv.config();

const IELTS_WORDS = [
    { term: "Abate (v)", definition: "Giảm bớt, làm yếu đi (to become less strong)." },
    { term: "Abstract (adj)", definition: "Trừu tượng (existing as an idea, feeling, or quality, not as a material object)." },
    { term: "Acquisition (n)", definition: "Sự giành được, sự thu được (the process of getting something)." },
    { term: "Adapt (v)", definition: "Thích nghi (to change to suit different conditions)." },
    { term: "Adequate (adj)", definition: "Đầy đủ, thỏa đáng (enough or satisfactory for a particular purpose)." },
    { term: "Adverse (adj)", definition: "Bất lợi, có hại (having a negative or harmful effect)." },
    { term: "Advocate (v)", definition: "Ủng hộ (to publicly support or suggest an idea)." },
    { term: "Aesthetic (adj)", definition: "Thẩm mỹ (relating to the enjoyment or study of beauty)." },
    { term: "Affordable (adj)", definition: "Giá cả phải chăng (not expensive)." },
    { term: "Aggressive (adj)", definition: "Hung hăng; Quyết liệt (behaving in an angry and violent way towards another person)." },
    { term: "Allocate (v)", definition: "Phân bổ (to give something to someone as their share)." },
    { term: "Alternative (n)", definition: "Sự lựa chọn thay thế (an object or plan that you can use instead)." },
    { term: "Ambiguous (adj)", definition: "Mơ hồ, nhập nhằng (having or expressing more than one possible meaning)." },
    { term: "Analyze (v)", definition: "Phân tích (to study or examine something in detail)." },
    { term: "Annual (adj)", definition: "Hàng năm (happening once every year)." },
    { term: "Anticipate (v)", definition: "Dự đoán, lường trước (to imagine or expect that something will happen)." },
    { term: "Apparent (adj)", definition: "Rõ ràng (able to be seen or understood)." },
    { term: "Appreciate (v)", definition: "Đánh giá cao, cảm kích (to recognize how good someone or something is)." },
    { term: "Approach (n)", definition: "Phương pháp, cách tiếp cận (a way of considering or doing something)." },
    { term: "Appropriate (adj)", definition: "Thích hợp (suitable or right for a particular situation)." },
    { term: "Artificial (adj)", definition: "Nhân tạo (made by people, often as a copy of something natural)." },
    { term: "Aspect (n)", definition: "Khía cạnh (one part of a situation, problem, subject, etc.)." },
    { term: "Assess (v)", definition: "Đánh giá (to judge or decide the amount, value, quality, or importance of something)." },
    { term: "Associate (v)", definition: "Liên kết, kết giao (to connect someone or something in your mind with someone or something else)." },
    { term: "Assume (v)", definition: "Cho rằng, giả sử (to accept something to be true without question or proof)." },
    { term: "Attitude (n)", definition: "Thái độ (a feeling or opinion about something or someone)." },
    { term: "Attribute (v)", definition: "Quy cho là (to say or think that something is the result of a particular thing)." },
    { term: "Authority (n)", definition: "Thẩm quyền, chính quyền (the moral or legal right or ability to control)." },
    { term: "Available (adj)", definition: "Có sẵn (able to be bought, used, or reached)." },
    { term: "Aware (adj)", definition: "Nhận thức (knowing that something exists, or having knowledge or experience of a particular thing)." },
    { term: "Benefit (n)", definition: "Lợi ích (a helpful or good effect)." },
    { term: "Bias (n)", definition: "Thiên kiến, xu hướng thiên vị (the action of supporting or opposing a particular person or thing in an unfair way)." },
    { term: "Brief (adj)", definition: "Ngắn gọn (lasting only a short time or containing few words)." },
    { term: "Capable (adj)", definition: "Có khả năng (able to do things effectively and skilfully, and to achieve results)." },
    { term: "Capacity (n)", definition: "Sức chứa, năng lực (the total amount that can be contained or produced)." },
    { term: "Category (n)", definition: "Hạng mục, loại (a type, or a group of things having some features that are the same)." },
    { term: "Challenge (n)", definition: "Thử thách (something that needs great mental or physical effort)." },
    { term: "Change (v)", definition: "Thay đổi (to make or become different)." },
    { term: "Characteristic (n)", definition: "Đặc điểm (a typical or noticeable quality of someone or something)." },
    { term: "Chemical (adj)", definition: "Hóa học (relating to chemicals or chemistry)." },
    { term: "Circumstance (n)", definition: "Hoàn cảnh (a fact or event that makes a situation the way it is)." },
    { term: "Cite (v)", definition: "Trích dẫn (to mention something as proof for a theory or as a reason why something has happened)." },
    { term: "Civil (adj)", definition: "Dân sự (not military or religious, or relating to the ordinary people of a country)." },
    { term: "Clarify (v)", definition: "Làm rõ (to make something clear or easier to understand)." },
    { term: "Classic (adj)", definition: "Cổ điển, kinh điển (having a high quality or standard against which other things are judged)." },
    { term: "Clause (n)", definition: "Mệnh đề; Điều khoản (a group of words, consisting of a subject and a finite form of a verb)." },
    { term: "Code (n)", definition: "Mã, quy tắc (a system of words, letters, or signs used to represent a message in secret form)." },
    { term: "Coherent (adj)", definition: "Mạch lạc (If an argument, set of ideas, or a plan is coherent, it is clear and carefully considered)." },
    { term: "Coincide (v)", definition: "Trùng hợp (to happen at or near the same time)." },
    { term: "Collapse (v)", definition: "Sụp đổ (to fall down suddenly because of pressure or having no strength or support)." }
];

const IELTS_SYNONYMS = [
    { term: "important", definition: "crucial, significant - quan trọng" },
    { term: "common", definition: "universal, ubiquitous - phổ biến" },
    { term: "abundant", definition: "ample, plentiful - dồi dào" },
    { term: "stick", definition: "adhere, cling - gắn với" },
    { term: "neglect", definition: "ignore - không quan tâm" },
    { term: "near", definition: "adjacent, adjoin - gần" },
    { term: "pursue", definition: "woo, seek - theo đuổi" },
    { term: "accurate", definition: "precise, exact - chính xác" },
    { term: "vague", definition: "obscure - mơ hồ" },
    { term: "top", definition: "peak, summit - đỉnh" },
    { term: "competitor", definition: "rival, opponent - đối thủ" },
    { term: "blame", definition: "condemn - đổ lỗi" },
    { term: "opinion", definition: "perspective, standpoint - quan điểm" },
    { term: "fame", definition: "prestige, reputation - danh tiếng" },
    { term: "build", definition: "erect, establish - xây dựng" },
    { term: "insult", definition: "humiliate - xúc phạm" },
    { term: "complain", definition: "grumble - phàn nàn" },
    { term: "primary", definition: "radical, fundamental - chính" },
    { term: "relieve", definition: "alleviate - xoa dịu" },
    { term: "force", definition: "coerce into, compel - bắt ép" },
    { term: "enlarge", definition: "magnify - mở rộng" },
    { term: "complex", definition: "intricate - phức tạp" },
    { term: "lonely", definition: "solitary - cô đơn" },
    { term: "small", definition: "minuscule, minute - nhỏ bé" },
    { term: "praise", definition: "extol, compliment - ca ngợi" },
    { term: "hard-working", definition: "assiduous - chăm chỉ" },
    { term: "difficult", definition: "arduous - khó khăn" },
    { term: "poor (soil)", definition: "barren, infertile - cằn cỗi" },
    { term: "fragile", definition: "brittle, vulnerable - dễ tổn thương" },
    { term: "show", definition: "demonstrate - thể hiện" },
    { term: "big", definition: "massive, colossal, tremendous - to lớn" },
    { term: "avoid", definition: "shun - tránh" },
    { term: "fair", definition: "impartial - công bằng" },
    { term: "attack", definition: "assault - tấn công" },
    { term: "dislike", definition: "abhor, loathe - không thích" },
    { term: "ruin", definition: "devastate - phá hủy" },
    { term: "always", definition: "invariably - luôn luôn" },
    { term: "forever", definition: "perpetual, immutable - mãi mãi" },
    { term: "surprise", definition: "startle, astound, astonish - bất ngờ" },
    { term: "enthusiasm", definition: "zeal, fervency - nhiệt huyết" },
    { term: "quiet", definition: "tranquil, serene - bình lặng" },
    { term: "expensive", definition: "exorbitant - đắt đỏ" },
    { term: "luxurious", definition: "lavish, sumptuous - sang chảnh" },
    { term: "boring", definition: "tedious - nhàm chán" },
    { term: "respect", definition: "esteem - tôn trọng" },
    { term: "worry", definition: "fret - lo lắng" },
    { term: "cold", definition: "chilly, icy - lạnh" },
    { term: "hot", definition: "boiling - nóng" },
    { term: "dangerous", definition: "perilous - nguy hiểm" },
    { term: "only", definition: "unique, distinctive - độc đáo" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find existing admin
        let adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });

        if (!adminUser) {
            console.warn('⚠️ No admin user found! Skipping seed. Please create an account and assign admin role, then restart.');
            process.exit(0);
        }

        console.log(`Using Admin: ${adminUser.username}`);



        // 2. Create or Update IELTS Set
        const setTitle = "IELTS Band 4.5+ Vocabulary (Must Know)";

        // Find set by TITLE only (to handle ownership transfer)
        let ieltsSet = await FlashcardSet.findOne({ title: setTitle });

        if (!ieltsSet) {
            ieltsSet = new FlashcardSet({
                title: setTitle,
                description: "50 từ vựng tiếng Anh quan trọng thường gặp trong bài thi IELTS (Band 4.5+). Bao gồm Collocations, Idioms và từ vựng học thuật.",
                userId: adminUser._id,
                cards: IELTS_WORDS,
                isPublic: true
            });
            await ieltsSet.save();
            console.log(`✅ Created Set: "${setTitle}" with ${IELTS_WORDS.length} words`);
        } else {
            console.log(`ℹ️ Set "${setTitle}" already exists - Updating...`);
            // Update ownership, cards and isPublic
            ieltsSet.userId = adminUser._id; // Transfer ownership to real admin
            ieltsSet.cards = IELTS_WORDS;
            ieltsSet.isPublic = true;
            await ieltsSet.save();
            console.log('✅ Updated existing set (and ownership) with cleaned data');
        }

        // 3. Create or Update IELTS Synonyms Set
        const synonymSetTitle = "50 CỤM TỪ ĐỒNG NGHĨA HAY XUẤT HIỆN TRONG BÀI THI IELTS - Part 1";

        let synonymSet = await FlashcardSet.findOne({ title: synonymSetTitle });

        if (!synonymSet) {
            synonymSet = new FlashcardSet({
                title: synonymSetTitle,
                description: "50 cặp từ đồng nghĩa phổ biến trong bài thi IELTS. Giúp nâng cao vốn từ vựng và khả năng paraphrase.",
                userId: adminUser._id,
                cards: IELTS_SYNONYMS,
                isPublic: true
            });
            await synonymSet.save();
            console.log(`✅ Created Set: "${synonymSetTitle}" with ${IELTS_SYNONYMS.length} words`);
        } else {
            console.log(`ℹ️ Set "${synonymSetTitle}" already exists - Updating...`);
            synonymSet.userId = adminUser._id;
            synonymSet.cards = IELTS_SYNONYMS;
            synonymSet.isPublic = true;
            await synonymSet.save();
            console.log('✅ Updated existing synonyms set with new data');
        }

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDB();
