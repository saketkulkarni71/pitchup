'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import Link from 'next/link'

export default function Header() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) setProfile(data)
            }
        }
        fetchUser()
    }, [])

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                        PitchUp
                    </h1>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        href="/book"
                        className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        Venues
                    </Link>
                    <div className="h-4 w-[1px] bg-slate-200"></div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/bookings"
                                className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                My Bookings
                            </Link>
                            <div className="h-4 w-[1px] bg-slate-200"></div>
                            <Link
                                href="/profile"
                                className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                {displayName}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="text-sm font-bold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
