'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProfileCompletionResult, getCompletionStatusMessage } from '@/utils/profile-utils'

interface ProfileCompletionPromptProps {
    completion: ProfileCompletionResult
}

export default function ProfileCompletionPrompt({ completion }: ProfileCompletionPromptProps) {
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        // Check if user has dismissed the prompt
        const isDismissed = localStorage.getItem('profile_completion_dismissed') === 'true'
        setDismissed(isDismissed)
    }, [])

    const handleDismiss = () => {
        localStorage.setItem('profile_completion_dismissed', 'true')
        setDismissed(true)
    }

    // Don't show if complete or dismissed
    if (completion.percentage === 100 || dismissed) {
        return null
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 mb-8 relative">
            <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Dismiss"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl">
                    📋
                </div>

                <div className="flex-grow">
                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        Complete Your Player Profile
                    </h3>
                    <p className="text-slate-600 font-medium mb-4">
                        {getCompletionStatusMessage(completion)}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Profile Completion
                            </span>
                            <span className="text-sm font-black text-blue-600">
                                {completion.percentage}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${completion.percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Missing Sections */}
                    {completion.missingSections.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Sections to Complete:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {completion.missingSections.map((section) => (
                                    <span
                                        key={section}
                                        className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold"
                                    >
                                        {section}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <Link
                        href="#basic-info"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:scale-105 active:scale-95"
                    >
                        Complete Profile
                    </Link>
                </div>
            </div>
        </div>
    )
}
