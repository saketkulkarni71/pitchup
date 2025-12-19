'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the login link!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full border border-white">
        <h1 className="text-3xl font-black mb-2 text-slate-900">Sign in</h1>
        <p className="text-slate-500 mb-8 font-medium">Enter your email for a magic link.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
            Send Magic Link
          </button>
        </form>
        
        {message && (
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-700 text-sm font-bold text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}