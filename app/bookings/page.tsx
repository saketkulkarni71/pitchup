'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchMyBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
      return
    }

    // We can fetch from 'bookings' table now for better accuracy, or 'slots' if legacy
    // Let's use the new 'bookings' tableSource of truth
    const { data } = await supabase
      .from('bookings')
      .select('*, slots(*, venues(*))')
      .eq('user_id', user.id)
      .eq('status', 'confirmed') // Only show confirmed
      .order('created_at', { ascending: false })

    if (data) setBookings(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel?")) return;

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, userId: user?.id })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      alert("Booking cancelled successfully")
      fetchMyBookings() // Refresh list
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="min-h-screen p-8 text-black">Loading...</div>

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-black text-black">My Bookings</h1>
        <a href="/profile" className="text-sm font-bold text-slate-500 hover:text-blue-600">Settings</a>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl font-bold text-slate-900 mb-4">No upcoming matches.</p>
            <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold text-sm">Find a Pitch</a>
          </div>
        ) : (
          bookings.map((booking) => {
            const slot = booking.slots
            const venue = slot?.venues

            // Safety check in case seed data relationship missing
            if (!slot || !venue) return null

            return (
              <div key={booking.id} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-4xl bg-white p-3 rounded-2xl shadow-sm border border-slate-100">{venue.image_emoji}</span>
                  <div>
                    <h3 className="font-black text-2xl text-black">{venue.name}</h3>
                    <p className="text-lg font-bold text-slate-700">
                      {new Date(slot.slot_date).toLocaleDateString()} at {slot.start_time.substring(11, 16)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {/* Placeholder for Reschedule */}
                  {/* <button className="text-blue-600 font-bold text-xs bg-blue-50 px-4 py-3 rounded-xl hover:bg-blue-100 transition-all ml-auto md:ml-0">
                   Reschedule
                 </button> */}
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="text-red-600 font-black text-xs bg-red-50 border border-red-100 px-4 py-3 rounded-xl hover:bg-red-100 transition-all w-full md:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}