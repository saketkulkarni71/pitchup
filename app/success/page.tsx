'use client'
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Your pitch is ready. We've sent the details to your email. See you on the field!
        </p>
        
        <Link 
          href="/"
          className="inline-block w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-95"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}