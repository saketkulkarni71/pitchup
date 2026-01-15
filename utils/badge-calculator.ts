// Badge calculation utilities
// Determines which badges a player has earned based on participation stats

export interface ParticipationStats {
    games_played: number
    games_hosted: number
    games_cancelled: number
    no_shows: number
}

export interface Badge {
    type: 'reliable_participant' | 'regular_host' | 'season_finisher' | 'active_player'
    label: string
    description: string
    icon: string
}

export const BADGE_DEFINITIONS: Record<string, Badge> = {
    reliable_participant: {
        type: 'reliable_participant',
        label: 'Reliable Participant',
        description: 'Played 10+ games with excellent attendance',
        icon: '✅'
    },
    regular_host: {
        type: 'regular_host',
        label: 'Regular Host',
        description: 'Hosted 5+ games for the community',
        icon: '🏠'
    },
    season_finisher: {
        type: 'season_finisher',
        label: 'Season Finisher',
        description: 'Completed a full season',
        icon: '🏆'
    },
    active_player: {
        type: 'active_player',
        label: 'Active Player',
        description: 'Played 25+ games',
        icon: '⚡'
    }
}

/**
 * Calculate which badges a player has earned
 * @param stats - Participation statistics
 * @returns Array of badge types the player has earned
 */
export function calculateEligibleBadges(stats: ParticipationStats): string[] {
    const eligibleBadges: string[] = []

    // Reliable Participant: 10+ games with <10% no-show rate
    if (stats.games_played >= 10) {
        const noShowRate = stats.games_played > 0
            ? (stats.no_shows / stats.games_played) * 100
            : 0

        if (noShowRate < 10) {
            eligibleBadges.push('reliable_participant')
        }
    }

    // Regular Host: Hosted 5+ games
    if (stats.games_hosted >= 5) {
        eligibleBadges.push('regular_host')
    }

    // Active Player: 25+ games played
    if (stats.games_played >= 25) {
        eligibleBadges.push('active_player')
    }

    // Season Finisher: This would require additional logic based on league/season data
    // For now, we'll leave this as a placeholder that can be manually awarded
    // or calculated based on future season tracking features

    return eligibleBadges
}

/**
 * Get badge definition by type
 * @param badgeType - Badge type string
 * @returns Badge definition or undefined
 */
export function getBadgeDefinition(badgeType: string): Badge | undefined {
    return BADGE_DEFINITIONS[badgeType]
}

/**
 * Get all badge definitions
 * @returns Array of all badge definitions
 */
export function getAllBadgeDefinitions(): Badge[] {
    return Object.values(BADGE_DEFINITIONS)
}

/**
 * Calculate reliability percentage
 * @param stats - Participation statistics
 * @returns Reliability percentage (0-100)
 */
export function calculateReliabilityPercentage(stats: ParticipationStats): number {
    if (stats.games_played === 0) return 100

    const totalCommitments = stats.games_played + stats.no_shows
    const fulfilled = stats.games_played

    return Math.round((fulfilled / totalCommitments) * 100)
}
