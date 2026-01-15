'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import Header from '../components/Header'
import ProfileCompletionPrompt from '../components/ProfileCompletionPrompt'
import SportSelector from '../components/SportSelector'
import SportProfileForm from '../components/SportProfileForm'
import ParticipationStats from '../components/ParticipationStats'
import BadgeDisplay from '../components/BadgeDisplay'
import SportCard from '../components/SportCard'
import { calculateProfileCompletion } from '@/utils/profile-utils'

export default function Profile() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [sports, setSports] = useState<any[]>([])
    const [badges, setBadges] = useState<any[]>([])
    const [stats, setStats] = useState<any[]>([])
    const [activeSince, setActiveSince] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    const supabase = createClient()

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            window.location.href = '/login'
            return
        }
        setUser(user)

        try {
            const response = await fetch('/api/profile')
            if (!response.ok) throw new Error('Failed to fetch profile')

            const data = await response.json()
            setProfile(data.profile)
            setSports(data.sports || [])
            setBadges(data.badges || [])
            setStats(data.stats || [])
            setActiveSince(data.activeSince)
        } catch (error: any) {
            console.error('Profile fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const updateBasicInfo = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: profile.username,
                    display_name: profile.display_name,
                    city: profile.city,
                    bio: profile.bio
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update')
            }

            const data = await response.json()
            setProfile(data.profile)
            setMessage('Profile updated successfully!')
            setTimeout(() => setMessage(''), 3000)
        } catch (error: any) {
            setMessage(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleSportsChange = async (newSports: any[]) => {
        try {
            const response = await fetch('/api/profile/sports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sports: newSports })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update sports')
            }

            await fetchProfile() // Refresh all data
        } catch (error: any) {
            alert(error.message)
        }
    }

    const handleSportProfileSave = async () => {
        await fetchProfile() // Refresh all data
    }

    if (loading && !user) {
        return (
            <main className="min-h-screen bg-slate-50">
                <Header />
                <div className="p-8 text-center text-slate-600 font-bold">Loading...</div>
            </main>
        )
    }

    // Calculate profile completion
    const sportProfiles = sports.flatMap(s => s.sport_profiles || [])
    const completion = calculateProfileCompletion(profile, sports, sportProfiles)

    // Get overall stats
    const overallStats = stats.find(s => s.sport_name === null) || {
        games_played: 0,
        games_hosted: 0,
        games_cancelled: 0,
        no_shows: 0
    }

    const displayName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'Player'
    const activeSinceDate = activeSince ? new Date(activeSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <Header />

            <div className="p-4 md:p-8 max-w-6xl mx-auto">
                {/* Profile Completion Prompt */}
                <ProfileCompletionPrompt completion={completion} />

                {/* Header Section */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-xl">
                            {displayName.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-grow">
                            <h1 className="text-4xl font-black text-slate-900 mb-2">{displayName}</h1>
                            <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-600">
                                {profile?.city && (
                                    <span className="flex items-center gap-1">
                                        📍 {profile.city}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    📅 Active since {activeSinceDate}
                                </span>
                            </div>
                        </div>

                        {/* Completion Badge */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl px-6 py-4 text-center">
                            <div className="text-3xl font-black text-blue-600 mb-1">
                                {completion.percentage}%
                            </div>
                            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Complete
                            </div>
                        </div>
                    </div>

                    {/* Primary Sports Badges */}
                    {sports.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {sports.slice(0, 3).map((sport) => (
                                <span
                                    key={sport.id}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-black flex items-center gap-2"
                                >
                                    <span>{sport.sport_name}</span>
                                    <span className="text-xs opacity-60">#{sport.rank}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Basic Info Section */}
                <section id="basic-info" className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Basic Information</h2>

                    <form onSubmit={updateBasicInfo} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={profile?.username || ''}
                                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                    className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Choose a username"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={profile?.display_name || ''}
                                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                                    className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Your display name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                                    City / Area
                                </label>
                                <input
                                    type="text"
                                    value={profile?.city || ''}
                                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                    className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="Your city"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={profile?.bio || ''}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:border-blue-500 focus:outline-none transition-colors resize-none"
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full md:w-auto bg-slate-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                        >
                            {saving ? 'Saving...' : 'Update Information'}
                        </button>

                        {message && (
                            <p className={`text-sm font-bold ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </section>

                {/* Sports & Interests Section */}
                <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Sports & Interests</h2>
                    <SportSelector
                        selectedSports={sports}
                        onSportsChange={handleSportsChange}
                        onSave={() => { }}
                    />
                </section>

                {/* Sport Profiles Section */}
                {sports.length > 0 && (
                    <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Sport Profiles</h2>
                        <div className="space-y-6">
                            {sports.map((sport) => {
                                const sportProfile = sport.sport_profiles?.[0]
                                return (
                                    <SportProfileForm
                                        key={sport.id}
                                        playerSportId={sport.id}
                                        sportName={sport.sport_name}
                                        initialData={sportProfile}
                                        onSave={handleSportProfileSave}
                                    />
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* Participation Stats Section */}
                <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Participation Stats</h2>
                    <ParticipationStats stats={overallStats} />
                </section>

                {/* Sport-Specific Stats */}
                {stats.filter(s => s.sport_name !== null).length > 0 && (
                    <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Sport Activity</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats
                                .filter(s => s.sport_name !== null)
                                .map((stat) => {
                                    const sport = sports.find(s => s.sport_name === stat.sport_name)
                                    const sportProfile = sport?.sport_profiles?.[0]

                                    return (
                                        <SportCard
                                            key={stat.id}
                                            sportName={stat.sport_name}
                                            gamesPlayed={stat.games_played}
                                            lastPlayedAt={stat.last_played_at}
                                            intensityPreference={sportProfile?.intensity_preference}
                                        />
                                    )
                                })}
                        </div>
                    </section>
                )}

                {/* Badges & Achievements Section */}
                <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Badges & Achievements</h2>
                    <BadgeDisplay badges={badges} />
                </section>
            </div>
        </main>
    )
}
