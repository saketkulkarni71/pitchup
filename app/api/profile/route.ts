import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase-server'

// GET - Fetch complete player profile
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileError) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Fetch player sports
        const { data: sports, error: sportsError } = await supabase
            .from('player_sports')
            .select('*')
            .eq('player_id', user.id)
            .order('rank', { ascending: true })

        // Manually fetch sport profiles for these sports to ensure data is returned
        // (Nested join select('*, sport_profiles(*)') can sometimes fail with RLS)
        let sportsWithProfiles = sports || []
        if (sportsWithProfiles.length > 0) {
            const sportIds = sportsWithProfiles.map((s: any) => s.id)
            const { data: profiles } = await supabase
                .from('sport_profiles')
                .select('*')
                .in('player_sport_id', sportIds)

            // Attach profiles to sports
            sportsWithProfiles = sportsWithProfiles.map((sport: any) => ({
                ...sport,
                sport_profiles: profiles?.filter((p: any) => p.player_sport_id === sport.id) || []
            }))
        }

        // Fetch badges
        const { data: badges, error: badgesError } = await supabase
            .from('player_badges')
            .select('*')
            .eq('player_id', user.id)
            .order('earned_at', { ascending: false })

        // Fetch participation stats
        const { data: stats, error: statsError } = await supabase
            .from('participation_stats')
            .select('*')
            .eq('player_id', user.id)

        // Get active since date
        const { data: activeSince } = await supabase
            .rpc('get_active_since', { user_id: user.id })

        return NextResponse.json({
            profile,
            sports: sportsWithProfiles,
            badges: badges || [],
            stats: stats || [],
            activeSince: activeSince || profile.created_at
        })
    } catch (error: any) {
        console.error('Profile fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update player profile basic info
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { username, display_name, city, bio, avatar_url } = body

        // Validate username uniqueness if provided
        if (username) {
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', username)
                .neq('id', user.id)
                .single()

            if (existingUser) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
            }
        }

        // Update profile
        const updates: any = {
            id: user.id,
            updated_at: new Date().toISOString()
        }

        if (username !== undefined) updates.username = username
        if (display_name !== undefined) updates.display_name = display_name
        if (city !== undefined) updates.city = city
        if (bio !== undefined) updates.bio = bio
        if (avatar_url !== undefined) updates.avatar_url = avatar_url

        const { data, error } = await supabase
            .from('profiles')
            .upsert(updates)
            .select()
            .single()

        if (error) {
            console.error('Profile update error:', error)
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
        }

        return NextResponse.json({ profile: data })
    } catch (error: any) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
