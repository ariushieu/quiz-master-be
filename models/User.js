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
    }],
    // Role for admin access
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Special badges - granted by admin
    specialBadges: [{
        badgeId: { type: String, required: true },
        grantedAt: { type: Date, default: Date.now },
        grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
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

// Helper to get local date values based on timezone offset
function getValuesInTimezone(date, offsetMinutes) {
    if (offsetMinutes === undefined || offsetMinutes === null) {
        // Default to UTC if no offset provided
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth(),
            day: date.getUTCDate()
        };
    }

    // Adjust date by offset to get local time
    // offsetMinutes is minutes from UTC (e.g., Vietnam is -420)
    // We subtract it properly or adds?
    // JS getTimezoneOffset() returns +420 for UTC-7, -420 for UTC+7 (Vietnam)
    // Wait, getTimezoneOffset() returns positive if local is behind UTC, negative if ahead.
    // e.g. Vietnam (GMT+7) -> -420.
    // So to get Local time from UTC: UTC - offsetMinutes

    const localTime = new Date(date.getTime() - (offsetMinutes * 60 * 1000));
    return {
        year: localTime.getUTCFullYear(),
        month: localTime.getUTCMonth(),
        day: localTime.getUTCDate()
    };
}

// Track daily cards and update streak
userSchema.methods.trackCardStudied = function (timezoneOffset) {
    const now = new Date();
    const todayVals = getValuesInTimezone(now, timezoneOffset);
    // Create a comparable 'day' timestamp (using UTC methods on local values ensures stability)
    const todayTime = Date.UTC(todayVals.year, todayVals.month, todayVals.day);

    let isNewDay = false;

    if (this.stats.lastCardDate) {
        const lastCard = new Date(this.stats.lastCardDate);
        const lastCardVals = getValuesInTimezone(lastCard, timezoneOffset);
        const lastCardTime = Date.UTC(lastCardVals.year, lastCardVals.month, lastCardVals.day);

        if (lastCardTime === todayTime) {
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
        this.updateStreak(timezoneOffset);
        this.stats.streakUpdatedToday = true;
    }
};

// Update streak
userSchema.methods.updateStreak = function (timezoneOffset) {
    const now = new Date();
    const todayVals = getValuesInTimezone(now, timezoneOffset);
    const todayTime = Date.UTC(todayVals.year, todayVals.month, todayVals.day);

    if (!this.stats.lastStudyDate) {
        // First time reaching 10 cards
        this.stats.currentStreak = 1;
        this.stats.longestStreak = 1;
    } else {
        const lastStudy = new Date(this.stats.lastStudyDate);
        const lastStudyVals = getValuesInTimezone(lastStudy, timezoneOffset);
        const lastStudyTime = Date.UTC(lastStudyVals.year, lastStudyVals.month, lastStudyVals.day);

        // Calculate difference in days
        const diffDays = Math.floor((todayTime - lastStudyTime) / (1000 * 60 * 60 * 24));

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
