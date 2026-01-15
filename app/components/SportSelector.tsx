'use client'
import { useState } from 'react'
import { AVAILABLE_SPORTS, getSportEmoji } from '@/utils/sports-config'

interface Sport {
    id?: string
    sport_name: string
    rank: number
}

interface SportSelectorProps {
    selectedSports: Sport[]
    onSportsChange: (sports: Sport[]) => void
    onSave: () => void
}

export default function SportSelector({ selectedSports, onSportsChange, onSave }: SportSelectorProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [tempSports, setTempSports] = useState<Sport[]>(selectedSports)

    const handleAddSport = (sportName: string) => {
        if (tempSports.length >= 5) {
            alert('You can select up to 5 sports')
            return
        }

        if (tempSports.some(s => s.sport_name === sportName)) {
            alert('Sport already selected')
            return
        }

        const newRank = tempSports.length + 1
        setTempSports([...tempSports, { sport_name: sportName, rank: newRank }])
    }

    const handleRemoveSport = (sportName: string) => {
        const filtered = tempSports
            .filter(s => s.sport_name !== sportName)
            .map((s, index) => ({ ...s, rank: index + 1 })) // Re-rank
        setTempSports(filtered)
    }

    const handleMoveUp = (index: number) => {
        if (index === 0) return
        const newSports = [...tempSports]
        const temp = newSports[index]
        newSports[index] = newSports[index - 1]
        newSports[index - 1] = temp
        // Update ranks
        newSports.forEach((s, i) => s.rank = i + 1)
        setTempSports(newSports)
    }

    const handleMoveDown = (index: number) => {
        if (index === tempSports.length - 1) return
        const newSports = [...tempSports]
        const temp = newSports[index]
        newSports[index] = newSports[index + 1]
        newSports[index + 1] = temp
        // Update ranks
        newSports.forEach((s, i) => s.rank = i + 1)
        setTempSports(newSports)
    }

    const handleSave = () => {
        onSportsChange(tempSports)
        setIsEditing(false)
        onSave()
    }

    const handleCancel = () => {
        setTempSports(selectedSports)
        setIsEditing(false)
    }

    const availableSportsToAdd = AVAILABLE_SPORTS.filter(
        sport => !tempSports.some(s => s.sport_name === sport.name)
    )

    if (!isEditing && selectedSports.length === 0) {
        return (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                <div className="text-5xl mb-4">🏅</div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Select Your Sports</h3>
                <p className="text-slate-600 font-medium mb-6">
                    Choose up to 5 sports you play, ranked by preference
                </p>
                <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    Add Sports
                </button>
            </div>
        )
    }

    if (!isEditing) {
        return (
            <div className="bg-white border border-slate-200 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black text-slate-900">My Sports</h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        Edit
                    </button>
                </div>
                <div className="space-y-2">
                    {selectedSports.map((sport) => (
                        <div
                            key={sport.sport_name}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                        >
                            <span className="text-2xl">{getSportEmoji(sport.sport_name)}</span>
                            <span className="flex-grow font-bold text-slate-900">{sport.sport_name}</span>
                            <span className="text-xs font-black text-slate-400 bg-slate-200 px-2 py-1 rounded-full">
                                #{sport.rank}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white border-2 border-blue-200 rounded-3xl p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">Edit Sports (Max 5)</h3>

            {/* Selected Sports */}
            {tempSports.length > 0 && (
                <div className="space-y-2 mb-6">
                    {tempSports.map((sport, index) => (
                        <div
                            key={sport.sport_name}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
                        >
                            <span className="text-2xl">{getSportEmoji(sport.sport_name)}</span>
                            <span className="flex-grow font-bold text-slate-900">{sport.sport_name}</span>
                            <span className="text-xs font-black text-slate-400">#{sport.rank}</span>

                            {/* Move buttons */}
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === tempSports.length - 1}
                                    className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    ↓
                                </button>
                            </div>

                            <button
                                onClick={() => handleRemoveSport(sport.sport_name)}
                                className="text-red-500 hover:text-red-700 font-bold text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Sport */}
            {tempSports.length < 5 && availableSportsToAdd.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Add Sport:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {availableSportsToAdd.map((sport) => (
                            <button
                                key={sport.name}
                                onClick={() => handleAddSport(sport.name)}
                                className="flex items-center gap-2 p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all font-bold text-sm"
                            >
                                <span className="text-xl">{sport.emoji}</span>
                                <span>{sport.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={tempSports.length === 0}
                    className="flex-grow bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    Save Sports
                </button>
                <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
