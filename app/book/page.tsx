'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase'
import { format, addDays, isSameDay, isAfter } from 'date-fns'
import Header from '../components/Header'

export default function BookPage() {
    const [venues, setVenues] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Filters
    const [sportFilter, setSportFilter] = useState<string>('All')
    const [locationType, setLocationType] = useState<string>('')

    const supabase = createClient()
    const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            const { data } = await supabase.from('venues').select('*, slots(*)')
            if (data) setVenues(data)
        }
        fetchData()

        // Realtime Subscription
        const channel = supabase
            .channel('realtime_slots')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'slots'
            }, (payload) => {
                // Optimistically update the slot in our local state
                setVenues(currentVenues =>
                    currentVenues.map(venue => ({
                        ...venue,
                        slots: venue.slots.map((slot: any) =>
                            slot.id === payload.new.id ? { ...slot, ...payload.new } : slot
                        )
                    }))
                )
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
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
            if (!response.ok) throw new Error(data.error || 'Booking Failed')
            if (data.url) window.location.href = data.url
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const filteredVenues = venues.filter(venue => {
        const matchesSport = sportFilter === 'All' || venue.sport === sportFilter;
        const matchesLocation = locationType === '' || venue.name.toLowerCase().includes(locationType.toLowerCase());
        return matchesSport && matchesLocation;
    });

    const uniqueSports = ['All', ...Array.from(new Set(venues.map(v => v.sport)))];

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
            <Header />

            <div className="p-4 md:p-8">

                {/* FILTERS & SEARCH */}
                <section className="max-w-6xl mx-auto mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-1">Find your court</h2>
                            <p className="text-slate-500 font-medium">Book top-rated sports venues instantly</p>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-grow md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search venue..."
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                    value={locationType}
                                    onChange={(e) => setLocationType(e.target.value)}
                                />
                                <span className="absolute left-3.5 top-3.5 text-slate-400">🔍</span>
                            </div>

                            <select
                                className="pl-4 pr-8 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer hover:border-blue-300 transition-all"
                                value={sportFilter}
                                onChange={(e) => setSportFilter(e.target.value)}
                            >
                                {uniqueSports.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* DATE SCROLLER */}
                <div className="max-w-6xl mx-auto mb-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex gap-3">
                        {days.map((day) => {
                            const isSelected = isSameDay(day, selectedDate)
                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => {
                                        setSelectedDate(day)
                                        setSelectedSlotId(null)
                                    }}
                                    className={`flex-shrink-0 w-20 py-4 rounded-2xl flex flex-col items-center transition-all border-2 duration-200 ${isSelected
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-100 ring-4 ring-slate-100'
                                        : 'bg-white border-white text-slate-400 hover:border-slate-200 hover:text-slate-600 shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    <span className="text-[10px] uppercase font-black opacity-60 tracking-wider">{format(day, 'EEE')}</span>
                                    <span className="text-xl font-black">{format(day, 'd')}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* VENUE GRID */}
                {filteredVenues.length === 0 ? (
                    <div className="max-w-6xl mx-auto text-center py-20">
                        <span className="text-6xl mb-4 block">🏜️</span>
                        <p className="text-xl font-bold text-slate-400">No venues found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVenues.map((venue) => (
                            <div key={venue.id} className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col">
                                <div className="p-8 pb-4 relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100">
                                            {venue.image_emoji}
                                        </div>
                                        <span className="bg-slate-900 text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-full tracking-widest">
                                            {venue.sport}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight mb-1">{venue.name}</h2>
                                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                                        <span>📍</span>
                                        <span>City Center</span> {/* Placeholder for location */}
                                    </div>
                                </div>

                                <div className="px-8 py-6 bg-slate-50/50 flex-grow border-t border-slate-100/50">
                                    <div className="flex justify-between items-end mb-4">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Available Times</p>
                                        <p className="text-[11px] font-bold text-slate-300">{format(selectedDate, 'MMM d')}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {venue.slots
                                            ?.filter((slot: any) => isSameDay(new Date(slot.slot_date), selectedDate))
                                            .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))
                                            .map((slot: any) => {
                                                const time = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                                                // Check new statuses
                                                const now = new Date();
                                                const isLocked = slot.status === 'pending' && slot.locked_until && new Date(slot.locked_until) > now;
                                                const isTrulyBooked = slot.status === 'booked' || slot.is_booked === true;

                                                const unavailable = isTrulyBooked || isLocked;
                                                const isSelected = selectedSlotId === slot.id

                                                return (
                                                    <button
                                                        key={slot.id}
                                                        disabled={unavailable}
                                                        onClick={() => setSelectedSlotId(slot.id)}
                                                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 relative ${unavailable
                                                            ? 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed decoration-slate-300'
                                                            : isSelected
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105 z-10'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'
                                                            }`}
                                                    >
                                                        {time}
                                                        {isLocked && !isTrulyBooked && (
                                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
                                                        )}
                                                    </button>
                                                )
                                            })}
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white mt-auto">
                                    <div>
                                        <span className="text-2xl font-black text-slate-900">€{venue.price_per_hour}</span>
                                        <span className="text-xs font-bold text-slate-400">/hr</span>
                                    </div>
                                    <button
                                        onClick={() => handleBooking(venue)}
                                        disabled={loading || !selectedSlotId}
                                        className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-200 disabled:cursor-not-allowed disabled:scale-100 shadow-lg shadow-slate-200"
                                    >
                                        {loading ? '...' : 'Book'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
