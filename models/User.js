import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Gamification - Stats
    stats: {
        totalCardsStudied: { type: Number, default: 0 },
        totalQuizzesTaken: { type: Number, default: 0 },
        totalCorrectAnswers: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastStudyDate: { type: Date, default: null },
        cardsStudiedToday: { type: Number, default: 0 },
        lastCardDate: { type: Date, default: null },
        streakUpdatedToday: { type: Boolean, default: false }  // Flag to prevent multiple updates
    },
    // Avatar URL from Cloudinary
    avatar: {
        type: String,
        default: null
    },
    achievements: [{
        type: String
    }]
});

// Hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Track daily cards and update streak
userSchema.methods.trackCardStudied = function () {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let isNewDay = false;

    if (this.stats.lastCardDate) {
        const lastCard = new Date(this.stats.lastCardDate);
        const lastCardDay = new Date(lastCard.getFullYear(), lastCard.getMonth(), lastCard.getDate());

        if (lastCardDay.getTime() === today.getTime()) {
            this.stats.cardsStudiedToday += 1;
        } else {
            // New day - reset counters
            this.stats.cardsStudiedToday = 1;
            this.stats.streakUpdatedToday = false;
            isNewDay = true;
        }
    } else {
        this.stats.cardsStudiedToday = 1;
        this.stats.streakUpdatedToday = false;
    }

    this.stats.lastCardDate = now;

    // Update streak when reaching 10 cards (only once per day)
    if (this.stats.cardsStudiedToday >= 10 && !this.stats.streakUpdatedToday) {
        this.updateStreak();
        this.stats.streakUpdatedToday = true;
    }
};

// Update streak
userSchema.methods.updateStreak = function () {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!this.stats.lastStudyDate) {
        // First time reaching 10 cards
        this.stats.currentStreak = 1;
        this.stats.longestStreak = 1;
    } else {
        const lastStudy = new Date(this.stats.lastStudyDate);
        const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());
        const diffDays = Math.floor((today - lastStudyDay) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same day - already updated
        } else if (diffDays === 1) {
            // Consecutive day
            this.stats.currentStreak += 1;
            if (this.stats.currentStreak > this.stats.longestStreak) {
                this.stats.longestStreak = this.stats.currentStreak;
            }
        } else {
            // Streak broken
            this.stats.currentStreak = 1;
        }
    }

    this.stats.lastStudyDate = now;
};

export default mongoose.model('User', userSchema);
