'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import Header from './components/Header'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Header />

      <div className="flex flex-col items-center justify-center px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              Book Your
              <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Perfect Pitch
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Find and reserve top-rated sports venues instantly. From Football to Padel, your next game is just a click away.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/book"
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              Browse Venues
            </Link>
            {user && (
              <Link
                href="/bookings"
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-slate-200 hover:border-blue-400 transition-all hover:shadow-lg w-full sm:w-auto"
              >
                My Bookings
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:scale-105">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Instant Booking</h3>
              <p className="text-slate-600 font-medium">
                Reserve your slot in seconds with real-time availability
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:scale-105">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Top Venues</h3>
              <p className="text-slate-600 font-medium">
                Access premium sports facilities across the city
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:scale-105">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Secure Payment</h3>
              <p className="text-slate-600 font-medium">
                Safe and easy checkout powered by Stripe
              </p>
            </div>
          </div>

          {/* Sports Icons */}
          <div className="mt-20 flex justify-center gap-6 text-4xl opacity-40">
            <span>⚽</span>
            <span>🏀</span>
            <span>🎾</span>
            <span>🏐</span>
            <span>🏓</span>
          </div>
        </div>
      </div>
    </main>
  )
}