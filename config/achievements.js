// Achievement definitions - NO XP related

// Special badges - manually granted by admin only
export const SPECIAL_BADGES = {
    founder: {
        id: 'founder',
        name: 'Founder',
        description: 'Người sáng lập QuizMaster',
        icon: '⭐',
        exclusive: true
    },
    beta_tester: {
        id: 'beta_tester',
        name: 'Beta Tester',
        description: 'Người thử nghiệm đầu tiên',
        icon: '🧪',
        exclusive: true
    },
    contributor: {
        id: 'contributor',
        name: 'Contributor',
        description: 'Đóng góp cho dự án',
        icon: '💝',
        exclusive: true
    }
};

// Regular achievements - auto-unlocked based on stats
export const ACHIEVEMENTS = {
    // Newcomer Quest
    newcomer: {
        id: 'newcomer',
        name: 'Newcomer',
        description: 'Hoàn thành nhiệm vụ tân thủ',
        icon: '🚀',
        check: (stats) => false // Manually claimed via quest
    },

    // Card milestones
    first_card: {
        id: 'first_card',
        name: 'First Steps',
        description: 'Học thẻ đầu tiên',
        icon: '🎯',
        check: (stats) => stats.totalCardsStudied >= 1
    },
    cards_10: {
        id: 'cards_10',
        name: 'Getting Started',
        description: 'Học 10 thẻ',
        icon: '📚',
        check: (stats) => stats.totalCardsStudied >= 10
    },
    cards_50: {
        id: 'cards_50',
        name: 'Card Collector',
        description: 'Học 50 thẻ',
        icon: '🃏',
        check: (stats) => stats.totalCardsStudied >= 50
    },
    cards_100: {
        id: 'cards_100',
        name: 'Card Master',
        description: 'Học 100 thẻ',
        icon: '👑',
        check: (stats) => stats.totalCardsStudied >= 100
    },
    cards_500: {
        id: 'cards_500',
        name: 'Card Legend',
        description: 'Học 500 thẻ',
        icon: '🏆',
        check: (stats) => stats.totalCardsStudied >= 500
    },

    // Streak achievements
    streak_3: {
        id: 'streak_3',
        name: 'On Fire',
        description: '3 ngày học liên tiếp',
        icon: '🔥',
        check: (stats) => stats.longestStreak >= 3
    },
    streak_7: {
        id: 'streak_7',
        name: 'Week Warrior',
        description: '7 ngày học liên tiếp',
        icon: '⚔️',
        check: (stats) => stats.longestStreak >= 7
    },
    streak_30: {
        id: 'streak_30',
        name: 'Dedicated Learner',
        description: '30 ngày học liên tiếp',
        icon: '💎',
        check: (stats) => stats.longestStreak >= 30
    },

    // Quiz achievements
    quiz_first: {
        id: 'quiz_first',
        name: 'Quiz Taker',
        description: 'Hoàn thành quiz đầu tiên',
        icon: '✏️',
        check: (stats) => stats.totalQuizzesTaken >= 1
    },
    quiz_10: {
        id: 'quiz_10',
        name: 'Quiz Master',
        description: 'Hoàn thành 10 quiz',
        icon: '🎓',
        check: (stats) => stats.totalQuizzesTaken >= 10
    }
};

// Check for new achievements
export function checkAchievements(user) {
    const newAchievements = [];
    const existingAchievements = user.achievements || [];

    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
        if (!existingAchievements.includes(id) && achievement.check(user.stats)) {
            newAchievements.push(achievement);
            user.achievements.push(id);
        }
    }

    return newAchievements;
}

// Get all achievements with unlock status
export function getAchievementsStatus(user) {
    const existingAchievements = user.achievements || [];

    return Object.values(ACHIEVEMENTS).map(a => ({
        ...a,
        unlocked: existingAchievements.includes(a.id),
        check: undefined
    }));
}

// Get special badges status for a user
export function getSpecialBadgesStatus(user) {
    const userBadges = user.specialBadges || [];
    const userBadgeIds = userBadges.map(b => b.badgeId);

    return Object.values(SPECIAL_BADGES).map(badge => ({
        ...badge,
        unlocked: userBadgeIds.includes(badge.id),
        grantedAt: userBadges.find(b => b.badgeId === badge.id)?.grantedAt || null
    }));
}

// Get only unlocked special badges for a user
export function getUnlockedSpecialBadges(user) {
    const userBadges = user.specialBadges || [];

    return userBadges.map(ub => {
        const badge = SPECIAL_BADGES[ub.badgeId];
        if (!badge) return null;
        return {
            ...badge,
            unlocked: true,
            grantedAt: ub.grantedAt
        };
    }).filter(Boolean);
}
