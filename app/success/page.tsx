'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const slotId = searchParams.get('slotId')
  const supabase = createClient()

  useEffect(() => {
    const confirmBooking = async () => {
      if (!slotId) return
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // THIS IS THE PART THAT TURNS THE SLOT RED
      await supabase
        .from('slots')
        .update({ 
          is_booked: true, 
          booked_by: user.id 
        })
        .eq('id', slotId)
    }
    confirmBooking()
  }, [slotId])

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-50 rounded-[3rem] p-10 text-center border-4 border-blue-600">
        <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl">✓</div>
        <h1 className="text-4xl font-black text-black mb-4">Game On!</h1>
        <p className="text-slate-800 text-lg font-bold mb-8">Your pitch is secured. The slot is now marked as booked.</p>
        
        <div className="flex flex-col gap-4">
          <Link href="/bookings" className="bg-blue-600 text-white font-black py-4 rounded-2xl text-xl shadow-lg">View My Bookings</Link>
          <Link href="/" className="text-slate-900 font-bold hover:underline">Back to Home</Link>
        </div>
      </div>
    </main>
  )
}