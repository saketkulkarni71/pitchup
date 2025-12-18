'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function Home() {
  const [venues, setVenues] = useState<any[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // --- SECTION 1: THE ENGINE (Fetching Data) ---
  useEffect(() => {
    const fetchVenues = async () => {
      // This pulls venues and their related slots from Supabase
      const { data, error } = await supabase
        .from('venues')
        .select('*, slots(*)')
      
      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setVenues(data || [])
      }
    }
    fetchVenues()
  }, [])

  // --- SECTION 2: THE LOGIC (Booking Action) ---
  const handleBooking = async (venue: any) => {
    if (!selectedSlotId) {
      alert("Please select a time slot first!");
      return;
    }

    setLoading(true);
    
    try {
      // Sends the booking info to your app/api/checkout/route.ts
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          venueName: venue.name, 
          price: venue.price_per_hour,
          slotId: selectedSlotId 
        }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; // The "Teleporter" to Stripe
      } else {
        alert("Stripe Error: " + data.error);
      }
    } catch (err) {
      alert("Connection error. Is your terminal running?");
    } finally {
      setLoading(false);
    }
  };

  // --- SECTION 3: THE DESIGN (The Website Look) ---
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      {/* Header */}
      <header className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-black text-blue-800 tracking-tighter mb-3">
          PitchUp
        </h1>
        <p className="text-slate-500 text-lg font-medium">
          Ireland's simplest way to book your next match.
        </p>
      </header>

      {/* Grid of Venues */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col overflow-hidden">
            
            {/* Top: Venue Info */}
            <div className="p-8">
              <div className="text-5xl mb-4">{venue.image_emoji}</div>
              <h2 className="text-2xl font-bold text-slate-900">{venue.name}</h2>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wide">{venue.sport}</p>
            </div>

            {/* Middle: Slot Selection */}
            <div className="px-8 py-6 bg-slate-50/50 flex-grow">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Available Slots</h3>
              <div className="flex flex-wrap gap-2">
                {venue.slots
                  ?.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                  .filter((slot: any) => !slot.is_booked)
                  .map((slot: any) => {
                    const time = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isSelected = selectedSlotId === slot.id;
                    
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                          isSelected 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                        }`}
                      >
                        {time}
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* Bottom: Price and CTA */}
            <div className="p-8 flex items-center justify-between bg-white border-t border-slate-50">
              <div>
                <span className="text-3xl font-black text-slate-900">€{venue.price_per_hour}</span>
                <span className="text-slate-400 font-bold">/hr</span>
              </div>
              <button 
                onClick={() => handleBooking(venue)}
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 shadow-lg shadow-blue-100"
              >
                {loading ? 'Wait...' : 'Book Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}