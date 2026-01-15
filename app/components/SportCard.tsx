'use client'
import { getSportEmoji } from '@/utils/sports-config'

interface SportCardProps {
    sportName: string
    gamesPlayed: number
    lastPlayedAt?: string
    intensityPreference?: string
}

export default function SportCard({
    sportName,
    gamesPlayed,
    lastPlayedAt,
    intensityPreference
}: SportCardProps) {
    const emoji = getSportEmoji(sportName)

    const lastPlayedText = lastPlayedAt
        ? new Date(lastPlayedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Never'

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                        {emoji}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900">{sportName}</h4>
                        {intensityPreference && (
                            <span className="text-xs font-bold text-slate-500">
                                {intensityPreference}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-2xl font-black text-slate-900">{gamesPlayed}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Games Played
                    </div>
                </div>
                <div>
                    <div className="text-sm font-bold text-slate-700">{lastPlayedText}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Last Played
                    </div>
                </div>
            </div>
        </div>
    )
}
