import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase-server'
import { calculateEligibleBadges } from '@/utils/badge-calculator'

// GET - Fetch participation statistics
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all participation stats
        const { data: stats, error: statsError } = await supabase
            .from('participation_stats')
            .select('*')
            .eq('player_id', user.id)

        if (statsError) {
            console.error('Stats fetch error:', statsError)
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
        }

        // Calculate eligible badges based on overall stats
        const overallStats = stats?.find(s => s.sport_name === null)
        let eligibleBadges: string[] = []

        if (overallStats) {
            eligibleBadges = calculateEligibleBadges({
                games_played: overallStats.games_played,
                games_hosted: overallStats.games_hosted,
                games_cancelled: overallStats.games_cancelled,
                no_shows: overallStats.no_shows
            })
        }

        // Fetch existing badges
        const { data: existingBadges } = await supabase
            .from('player_badges')
            .select('badge_type')
            .eq('player_id', user.id)

        const existingBadgeTypes = existingBadges?.map(b => b.badge_type) || []

        // Auto-award new badges (this could also be done via a cron job)
        const newBadges = eligibleBadges.filter(b => !existingBadgeTypes.includes(b))

        if (newBadges.length > 0) {
            const badgesToInsert = newBadges.map(badgeType => ({
                player_id: user.id,
                badge_type: badgeType,
                sport_name: null
            }))

            await supabase
                .from('player_badges')
                .insert(badgesToInsert)
        }

        return NextResponse.json({
            stats: stats || [],
            eligibleBadges,
            newBadgesAwarded: newBadges
        })
    } catch (error: any) {
        console.error('Stats fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
