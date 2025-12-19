'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchMyBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('slots')
        .select('*, venues(name, image_emoji)')
        .eq('booked_by', user.id)
        .eq('is_booked', true)

      if (data) setBookings(data)
    }
    fetchMyBookings()
  }, [])

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-black mb-8 text-black">My Bookings</h1>
      
      <div className="max-w-2xl space-y-4">
        {bookings.length === 0 ? (
          <p className="text-xl font-bold text-slate-900">No bookings found yet. Go book a pitch!</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-200 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-white p-3 rounded-2xl shadow-sm border border-slate-100">{booking.venues?.image_emoji}</span>
                <div>
                  <h3 className="font-black text-2xl text-black">{booking.venues?.name}</h3>
                  <p className="text-lg font-bold text-slate-700">
                    {new Date(booking.slot_date).toLocaleDateString()} at {booking.start_time.substring(11, 16)}
                  </p>
                </div>
              </div>
              <button className="text-red-600 font-black text-sm bg-red-100 border-2 border-red-200 px-6 py-3 rounded-2xl hover:bg-red-200 transition-all">
                Cancel
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  )
}