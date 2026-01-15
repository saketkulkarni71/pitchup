import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase-server'

// POST - Add/update favourite sports
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { sports } = body // Array of { sport_name, rank }

        // Validate sports array
        if (!Array.isArray(sports) || sports.length === 0 || sports.length > 5) {
            return NextResponse.json({ error: 'Must select 1-5 sports' }, { status: 400 })
        }

        // Validate ranks are unique and in range 1-5
        const ranks = sports.map(s => s.rank)
        if (new Set(ranks).size !== ranks.length) {
            return NextResponse.json({ error: 'Ranks must be unique' }, { status: 400 })
        }

        if (ranks.some(r => r < 1 || r > 5)) {
            return NextResponse.json({ error: 'Ranks must be between 1 and 5' }, { status: 400 })
        }

        // Strategy: Wipe and Re-insert (with Profile Restoration)
        // This avoids unique constraint collisions on rank swapping and CHECK constraints on temp values.

        // 1. Delete ALL existing sports for this user
        // (Cascading delete will remove sport_profiles, so we must rely on incoming data or fetch backup)
        // The frontend sends the full 'sports' object including 'sport_profiles', so we use that.

        await supabase
            .from('player_sports')
            .delete()
            .eq('player_id', user.id)

        // 2. Prepare inserts
        const sportsToInsert = sports.map((s: any) => ({
            player_id: user.id,
            sport_name: s.sport_name,
            rank: s.rank
        }))

        // 3. Insert Sports
        const { data: insertedSports, error: insertError } = await supabase
            .from('player_sports')
            .insert(sportsToInsert)
            .select()

        if (insertError) {
            console.error('Sports insert error:', insertError)
            return NextResponse.json({ error: 'Failed to save sports configuration' }, { status: 500 })
        }

        // 4. Restore/Migrate Sport Profiles
        // Map the NEW player_sport_id to the OLD profile data
        const profilesToInsert: any[] = []

        if (insertedSports) {
            for (const newSport of insertedSports) {
                // Find original data for this sport
                // The input 'sports' array has the 'sport_profiles' nested array if it was fetched from DB
                const originalSport = sports.find((s: any) => s.sport_name === newSport.sport_name)

                // If we have profile data, prepare it for insertion with NEW ID
                if (originalSport && originalSport.sport_profiles && originalSport.sport_profiles.length > 0) {
                    const profileData = originalSport.sport_profiles[0]
                    const { id, player_sport_id, created_at, updated_at, ...cleanProfile } = profileData

                    profilesToInsert.push({
                        ...cleanProfile,
                        player_sport_id: newSport.id,
                        updated_at: new Date().toISOString()
                    })
                }
            }

            if (profilesToInsert.length > 0) {
                const { error: profileError } = await supabase
                    .from('sport_profiles')
                    .insert(profilesToInsert)

                if (profileError) {
                    // Log but don't fail the request entirely (sports are saved)
                    console.error('Profile restoration error:', profileError)
                }
            }
        }

        // 5. Return fresh data
        const { data: finalData } = await supabase
            .from('player_sports')
            .select('*, sport_profiles(*)')
            .eq('player_id', user.id)
            .order('rank', { ascending: true })

        return NextResponse.json({ sports: finalData })
    } catch (error: any) {
        console.error('Sports update error:', error)
        return NextResponse.json({ error: `Internal error: ${error.message}` }, { status: 500 })
    }
}

// DELETE - Remove a sport
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const sportId = searchParams.get('sportId')

        if (!sportId) {
            return NextResponse.json({ error: 'Sport ID required' }, { status: 400 })
        }

        // Verify ownership
        const { data: sport } = await supabase
            .from('player_sports')
            .select('player_id')
            .eq('id', sportId)
            .single()

        if (!sport || sport.player_id !== user.id) {
            return NextResponse.json({ error: 'Sport not found' }, { status: 404 })
        }

        // Delete sport (cascades to sport_profiles)
        const { error } = await supabase
            .from('player_sports')
            .delete()
            .eq('id', sportId)

        if (error) {
            console.error('Sport delete error:', error)
            return NextResponse.json({ error: 'Failed to delete sport' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Sport delete error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
