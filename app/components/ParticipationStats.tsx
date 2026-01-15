'use client'

interface ParticipationStatsProps {
    stats: {
        games_played: number
        games_hosted: number
        games_cancelled: number
        no_shows: number
    }
}

export default function ParticipationStats({ stats }: ParticipationStatsProps) {
    const statItems = [
        { label: 'Games Played', value: stats.games_played, icon: '⚽' },
        { label: 'Games Hosted', value: stats.games_hosted, icon: '🏠' },
        { label: 'Games Cancelled', value: stats.games_cancelled, icon: '📅' },
        { label: 'No-Shows', value: stats.no_shows, icon: '❌' }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.map((item) => (
                <div
                    key={item.label}
                    className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all"
                >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="text-3xl font-black text-slate-900 mb-1">{item.value}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    )
}
