import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase-server'

// POST - Create/update sport-specific profile
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            player_sport_id,
            years_playing,
            playing_frequency,
            competitive_background,
            intensity_preference,
            preferred_role,
            team_preference,
            comfortable_hosting,
            physical_traits,
            personal_goals
        } = body

        if (!player_sport_id) {
            return NextResponse.json({ error: 'player_sport_id required' }, { status: 400 })
        }

        // Verify the player_sport belongs to this user
        const { data: playerSport } = await supabase
            .from('player_sports')
            .select('player_id')
            .eq('id', player_sport_id)
            .single()

        if (!playerSport || playerSport.player_id !== user.id) {
            return NextResponse.json({ error: 'Invalid player_sport_id' }, { status: 403 })
        }

        // Upsert sport profile
        const sportProfileData: any = {
            player_sport_id,
            updated_at: new Date().toISOString()
        }

        if (years_playing !== undefined) sportProfileData.years_playing = years_playing
        if (playing_frequency !== undefined) sportProfileData.playing_frequency = playing_frequency
        if (competitive_background !== undefined) sportProfileData.competitive_background = competitive_background
        if (intensity_preference !== undefined) sportProfileData.intensity_preference = intensity_preference
        if (preferred_role !== undefined) sportProfileData.preferred_role = preferred_role
        if (team_preference !== undefined) sportProfileData.team_preference = team_preference
        if (comfortable_hosting !== undefined) sportProfileData.comfortable_hosting = comfortable_hosting
        if (physical_traits !== undefined) sportProfileData.physical_traits = physical_traits
        if (personal_goals !== undefined) sportProfileData.personal_goals = personal_goals

        const { data, error } = await supabase
            .from('sport_profiles')
            .upsert(sportProfileData, { onConflict: 'player_sport_id' })
            .select()
            .single()

        if (error) {
            console.error('Sport profile upsert error:', error)
            return NextResponse.json({ error: 'Failed to update sport profile' }, { status: 500 })
        }

        return NextResponse.json({ sportProfile: data })
    } catch (error: any) {
        console.error('Sport profile error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET - Fetch sport profile by player_sport_id
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const playerSportId = searchParams.get('player_sport_id')

        if (!playerSportId) {
            return NextResponse.json({ error: 'player_sport_id required' }, { status: 400 })
        }

        // Verify ownership
        const { data: playerSport } = await supabase
            .from('player_sports')
            .select('player_id')
            .eq('id', playerSportId)
            .single()

        if (!playerSport || playerSport.player_id !== user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        // Fetch sport profile
        const { data, error } = await supabase
            .from('sport_profiles')
            .select('*')
            .eq('player_sport_id', playerSportId)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            console.error('Sport profile fetch error:', error)
            return NextResponse.json({ error: 'Failed to fetch sport profile' }, { status: 500 })
        }

        return NextResponse.json({ sportProfile: data || null })
    } catch (error: any) {
        console.error('Sport profile fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
