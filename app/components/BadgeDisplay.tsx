'use client'
import { getBadgeDefinition } from '@/utils/badge-calculator'

interface Badge {
    id: string
    badge_type: string
    sport_name?: string
    earned_at: string
}

interface BadgeDisplayProps {
    badges: Badge[]
}

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
    if (badges.length === 0) {
        return (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Badges Yet</h3>
                <p className="text-slate-600 font-medium">
                    Keep playing and contributing to earn badges!
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => {
                const definition = getBadgeDefinition(badge.badge_type)
                if (!definition) return null

                return (
                    <div
                        key={badge.id}
                        className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="text-4xl mb-3">{definition.icon}</div>
                        <h4 className="text-lg font-black text-slate-900 mb-1">
                            {definition.label}
                        </h4>
                        <p className="text-sm text-slate-600 font-medium mb-3">
                            {definition.description}
                        </p>
                        {badge.sport_name && (
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                {badge.sport_name}
                            </span>
                        )}
                        <p className="text-xs text-slate-400 font-bold mt-3">
                            Earned {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
