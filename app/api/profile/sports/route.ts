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

        // Delete existing sports for this user
        await supabase
            .from('player_sports')
            .delete()
            .eq('player_id', user.id)

        // Insert new sports
        const sportsToInsert = sports.map(s => ({
            player_id: user.id,
            sport_name: s.sport_name,
            rank: s.rank
        }))

        const { data, error } = await supabase
            .from('player_sports')
            .insert(sportsToInsert)
            .select()

        if (error) {
            console.error('Sports insert error:', error)
            return NextResponse.json({ error: 'Failed to update sports' }, { status: 500 })
        }

        return NextResponse.json({ sports: data })
    } catch (error: any) {
        console.error('Sports update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
