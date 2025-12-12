import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import FlashcardSet from '../models/FlashcardSet.js';

dotenv.config();

const IELTS_WORDS = [
    { term: "Abate", definition: "Giảm bớt, làm yếu đi" },
    { term: "Abstract", definition: "Trừu tượng" },
    { term: "Acquisition", definition: "Sự giành được, sự thu được" },
    { term: "Adapt", definition: "Thích nghi" },
    { term: "Adequate", definition: "Đầy đủ, thỏa đáng" },
    { term: "Adverse", definition: "Bất lợi, có hại" },
    { term: "Advocate", definition: "Ủng hộ" },
    { term: "Aesthetic", definition: "Thẩm mỹ" },
    { term: "Affordable", definition: "Giá cả phải chăng" },
    { term: "Aggressive", definition: "Hung hăng, quyết liệt" },
    { term: "Allocate", definition: "Phân bổ" },
    { term: "Alternative", definition: "Sự lựa chọn thay thế" },
    { term: "Ambiguous", definition: "Mơ hồ, nhập nhằng" },
    { term: "Analyze", definition: "Phân tích" },
    { term: "Annual", definition: "Hàng năm" },
    { term: "Anticipate", definition: "Dự đoán, lường trước" },
    { term: "Apparent", definition: "Rõ ràng" },
    { term: "Appreciate", definition: "Đánh giá cao, cảm kích" },
    { term: "Approach", definition: "Phương pháp, cách tiếp cận" },
    { term: "Appropriate", definition: "Thích hợp" },
    { term: "Artificial", definition: "Nhân tạo" },
    { term: "Aspect", definition: "Khía cạnh" },
    { term: "Assess", definition: "Đánh giá" },
    { term: "Associate", definition: "Liên kết, kết giao" },
    { term: "Assume", definition: "Cho rằng, giả sử" },
    { term: "Attitude", definition: "Thái độ" },
    { term: "Attribute", definition: "Quy cho là" },
    { term: "Authority", definition: "Thẩm quyền, chính quyền" },
    { term: "Available", definition: "Có sẵn" },
    { term: "Aware", definition: "Nhận thức" },
    { term: "Benefit", definition: "Lợi ích" },
    { term: "Bias", definition: "Thiên kiến, xu hướng thiên vị" },
    { term: "Brief", definition: "Ngắn gọn" },
    { term: "Capable", definition: "Có khả năng" },
    { term: "Capacity", definition: "Sức chứa, năng lực" },
    { term: "Category", definition: "Hạng mục, loại" },
    { term: "Challenge", definition: "Thử thách" },
    { term: "Change", definition: "Thay đổi" },
    { term: "Characteristic", definition: "Đặc điểm" },
    { term: "Chemical", definition: "Hóa học" },
    { term: "Circumstance", definition: "Hoàn cảnh" },
    { term: "Cite", definition: "Trích dẫn" },
    { term: "Civil", definition: "Dân sự" },
    { term: "Clarify", definition: "Làm rõ" },
    { term: "Classic", definition: "Cổ điển, kinh điển" },
    { term: "Clause", definition: "Mệnh đề, điều khoản" },
    { term: "Code", definition: "Mã, quy tắc" },
    { term: "Coherent", definition: "Mạch lạc" },
    { term: "Coincide", definition: "Trùng hợp" },
    { term: "Collapse", definition: "Sụp đổ" }
];

const IELTS_SYNONYMS = [
    { term: "Important, crucial, significant", definition: "Quan trọng" },
    { term: "Common, universal, ubiquitous", definition: "Phổ biến" },
    { term: "Abundant, ample, plentiful", definition: "Dồi dào" },
    { term: "Stick, adhere, cling", definition: "Gắn với" },
    { term: "Neglect, ignore", definition: "Không quan tâm" },
    { term: "Near, adjacent, adjoin", definition: "Gần" },
    { term: "Pursue, woo, seek", definition: "Theo đuổi" },
    { term: "Accurate, precise, exact", definition: "Chính xác" },
    { term: "Vague, obscure", definition: "Mơ hồ" },
    { term: "Top, peak, summit", definition: "Đỉnh" },
    { term: "Competitor, rival, opponent", definition: "Đối thủ" },
    { term: "Blame, condemn", definition: "Đổ lỗi" },
    { term: "Opinion, perspective, standpoint", definition: "Quan điểm" },
    { term: "Fame, prestige, reputation", definition: "Danh tiếng" },
    { term: "Build, erect, establish", definition: "Xây dựng" },
    { term: "Insult, humiliate", definition: "Xúc phạm" },
    { term: "Complain, grumble", definition: "Phàn nàn" },
    { term: "Primary, radical, fundamental", definition: "Chính" },
    { term: "Relieve, alleviate", definition: "Xoa dịu" },
    { term: "Force, coerce into, compel", definition: "Bắt ép" },
    { term: "Enlarge, magnify", definition: "Mở rộng" },
    { term: "Complex, intricate", definition: "Phức tạp" },
    { term: "Lonely, solitary", definition: "Cô đơn" },
    { term: "Small, minuscule, minute", definition: "Nhỏ bé" },
    { term: "Praise, extol, compliment", definition: "Ca ngợi" },
    { term: "Hard-working, assiduous", definition: "Chăm chỉ" },
    { term: "Difficult, arduous", definition: "Khó khăn" },
    { term: "Poor, barren, infertile", definition: "Cằn cỗi" },
    { term: "Fragile, brittle, vulnerable", definition: "Dễ tổn thương" },
    { term: "Show, demonstrate", definition: "Thể hiện" },
    { term: "Big, massive, colossal, tremendous", definition: "To lớn" },
    { term: "Avoid, shun", definition: "Tránh" },
    { term: "Fair, impartial", definition: "Công bằng" },
    { term: "Attack, assault", definition: "Tấn công" },
    { term: "Dislike, abhor, loathe", definition: "Không thích" },
    { term: "Ruin, devastate", definition: "Phá hủy" },
    { term: "Always, invariably", definition: "Luôn luôn" },
    { term: "Forever, perpetual, immutable", definition: "Mãi mãi" },
    { term: "Surprise, startle, astound, astonish", definition: "Bất ngờ" },
    { term: "Enthusiasm, zeal, fervency", definition: "Nhiệt huyết" },
    { term: "Quiet, tranquil, serene", definition: "Bình lặng" },
    { term: "Expensive, exorbitant", definition: "Đắt đỏ" },
    { term: "Luxurious, lavish, sumptuous", definition: "Sang chảnh" },
    { term: "Boring, tedious", definition: "Nhàm chán" },
    { term: "Respect, esteem", definition: "Tôn trọng" },
    { term: "Worry, fret", definition: "Lo lắng" },
    { term: "Cold, chilly, icy", definition: "Lạnh" },
    { term: "Hot, boiling", definition: "Nóng" },
    { term: "Dangerous, perilous", definition: "Nguy hiểm" },
    { term: "Only, unique, distinctive", definition: "Độc đáo" }
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
