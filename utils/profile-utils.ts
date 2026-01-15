// Profile completion utilities
// Calculates profile completion percentage and identifies missing sections

export interface ProfileCompletionResult {
    percentage: number
    missingSections: string[]
    completedSections: string[]
}

export interface PlayerProfile {
    id: string
    username?: string
    display_name?: string
    city?: string
    bio?: string
    avatar_url?: string
}

export interface PlayerSport {
    id: string
    sport_name: string
    rank: number
}

export interface SportProfile {
    id: string
    player_sport_id: string
    years_playing?: string
    playing_frequency?: string
    competitive_background?: string
    intensity_preference?: string
    preferred_role?: string
    team_preference?: string
    comfortable_hosting?: boolean
    physical_traits?: any
    personal_goals?: string[]
}

/**
 * Calculate profile completion percentage
 * @param profile - Player profile data
 * @param sports - Array of player sports
 * @param sportProfiles - Array of sport profiles
 * @returns ProfileCompletionResult with percentage and missing sections
 */
export function calculateProfileCompletion(
    profile: PlayerProfile | null,
    sports: PlayerSport[] = [],
    sportProfiles: SportProfile[] = []
): ProfileCompletionResult {
    const sections: { name: string; completed: boolean }[] = []

    // Section 1: Basic Info (25%)
    const hasBasicInfo = !!(
        profile?.username &&
        profile?.display_name &&
        profile?.city
    )
    sections.push({ name: 'Basic Info', completed: hasBasicInfo })

    // Section 2: Sports Selection (25%)
    const hasSports = sports.length > 0
    sections.push({ name: 'Sports Selection', completed: hasSports })

    // Section 3: Sport-Specific Details (50%)
    // Each sport should have a profile to be considered complete
    const sportProfilesComplete = sports.length > 0 && sports.every(sport => {
        const profile = sportProfiles.find(sp => sp.player_sport_id === sport.id)
        return profile && isSportProfileComplete(profile)
    })
    sections.push({ name: 'Sport-Specific Details', completed: sportProfilesComplete })

    const completedSections = sections.filter(s => s.completed).map(s => s.name)
    const missingSections = sections.filter(s => !s.completed).map(s => s.name)

    // Calculate weighted percentage
    let percentage = 0
    if (hasBasicInfo) percentage += 25
    if (hasSports) percentage += 25
    if (sportProfilesComplete) percentage += 50

    return {
        percentage,
        completedSections,
        missingSections
    }
}

/**
 * Check if a sport profile is complete
 * @param sportProfile - Sport profile to check
 * @returns true if all required fields are filled
 */
function isSportProfileComplete(sportProfile: SportProfile): boolean {
    return !!(
        sportProfile.years_playing &&
        sportProfile.playing_frequency &&
        sportProfile.competitive_background &&
        sportProfile.intensity_preference &&
        sportProfile.team_preference &&
        sportProfile.personal_goals &&
        sportProfile.personal_goals.length > 0
    )
}

/**
 * Check if profile completion prompt should be shown
 * @param completion - Profile completion result
 * @param dismissed - Whether user has dismissed the prompt
 * @returns true if prompt should be shown
 */
export function shouldShowCompletionPrompt(
    completion: ProfileCompletionResult,
    dismissed: boolean = false
): boolean {
    // Don't show if 100% complete
    if (completion.percentage === 100) return false

    // Show if not dismissed
    return !dismissed
}

/**
 * Get profile completion status message
 * @param completion - Profile completion result
 * @returns User-friendly status message
 */
export function getCompletionStatusMessage(completion: ProfileCompletionResult): string {
    if (completion.percentage === 100) {
        return 'Your profile is complete!'
    }

    if (completion.percentage >= 75) {
        return 'Almost there! Just a few more details.'
    }

    if (completion.percentage >= 50) {
        return 'You\'re halfway there. Keep going!'
    }

    if (completion.percentage >= 25) {
        return 'Good start! Add more details to complete your profile.'
    }

    return 'Complete your profile to get the most out of PitchUp.'
}
