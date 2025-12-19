'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { format, addDays, isSameDay } from 'date-fns' // The helper we installed

export default function Home() {
  const [venues, setVenues] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()) // Default to Today
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // 1. Generate the 14-day array for the scroller
  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data } = await supabase.from('venues').select('*, slots(*)')
      if (data) setVenues(data)
    }
    fetchData()
  }, [])

  const handleBooking = async (venue: any) => {
    if (!user) { window.location.href = '/login'; return }
    if (!selectedSlotId) { alert("Select a time!"); return }

    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          venueName: venue.name, 
          price: venue.price_per_hour,
          slotId: selectedSlotId,
          userId: user.id 
        }),
      })
      const data = await response.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-blue-600 tracking-tighter">PitchUp</h1>
        {user ? (
          <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-200">
            {user.email}
          </span>
        ) : (
          <a href="/login" className="text-sm font-bold text-blue-600 hover:underline">Login</a>
        )}
      </header>

      {/* DATE SCROLLER */}
      <div className="max-w-6xl mx-auto mb-10 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-3">
          {days.map((day) => {
            const isSelected = isSameDay(day, selectedDate)
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day)
                  setSelectedSlotId(null) // Reset selection when date changes
                }}
                className={`flex-shrink-0 w-20 py-4 rounded-2xl flex flex-col items-center transition-all border-2 ${
                  isSelected 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                }`}
              >
                <span className="text-[10px] uppercase font-black opacity-60">{format(day, 'EEE')}</span>
                <span className="text-xl font-black">{format(day, 'd')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* VENUE GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col border border-white">
            <div className="p-8">
              <span className="text-4xl mb-2 block">{venue.image_emoji}</span>
              <h2 className="text-2xl font-bold">{venue.name}</h2>
              <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest">{venue.sport}</p>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 flex-grow">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Available Times</p>
              <div className="grid grid-cols-3 gap-2">
                {venue.slots
                  ?.filter((slot: any) => isSameDay(new Date(slot.slot_date), selectedDate))
                  .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))
                  .map((slot: any) => {
                    const time = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    const isBooked = slot.is_booked
                    const isSelected = selectedSlotId === slot.id

                    return (
                      <button
                        key={slot.id}
                        disabled={isBooked}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                          isBooked 
                          ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed opacity-60' 
                          : isSelected 
                          ? 'bg-green-600 border-green-600 text-white shadow-md' 
                          : 'bg-white border-slate-100 text-slate-600 hover:border-green-400'
                        }`}
                      >
                        {time}
                        {isBooked && <span className="block text-[8px] uppercase mt-1 opacity-60">Full</span>}
                      </button>
                    )
                  })}
              </div>
            </div>

            <div className="p-8 flex items-center justify-between">
              <div className="text-2xl font-black">€{venue.price_per_hour}<span className="text-xs text-slate-400">/hr</span></div>
              <button 
                onClick={() => handleBooking(venue)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-200"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}