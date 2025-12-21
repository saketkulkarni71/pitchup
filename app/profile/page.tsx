'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function Profile() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')

    const supabase = createClient()

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                window.location.href = '/login'
                return
            }
            setUser(user)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) setProfile(data)
            setLoading(false)
        }
        getProfile()
    }, [])

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const updates = {
            id: user.id,
            full_name: profile.full_name,
            updated_at: new Date(),
        }

        const { error } = await supabase.from('profiles').upsert(updates)
        if (error) {
            setMessage('Error updating profile')
        } else {
            setMessage('Profile updated successfully!')
        }
        setLoading(false)
    }

    if (loading && !user) return <div className="p-8">Loading...</div>

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-black mb-8">Account Settings</h1>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
                    <form onSubmit={updateProfile} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Email</label>
                            <input
                                type="text"
                                value={user?.email}
                                disabled
                                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profile?.full_name || ''}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 text-slate-900 font-bold focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>

                        {message && (
                            <p className={`text-center font-bold text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </main>
    )
}
