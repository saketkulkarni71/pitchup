'use client'
import { useState } from 'react'
import {
    getSportConfig,
    YEARS_PLAYING_OPTIONS,
    PLAYING_FREQUENCY_OPTIONS,
    COMPETITIVE_BACKGROUND_OPTIONS,
    INTENSITY_PREFERENCE_OPTIONS,
    TEAM_PREFERENCE_OPTIONS,
    PERSONAL_GOALS
} from '@/utils/sports-config'

interface SportProfileFormProps {
    playerSportId: string
    sportName: string
    initialData?: any
    onSave: (data: any) => void
}

export default function SportProfileForm({
    playerSportId,
    sportName,
    initialData,
    onSave
}: SportProfileFormProps) {
    const sportConfig = getSportConfig(sportName)
    // Start collapsed if data exists, expanded if creating new profile
    const [isEditing, setIsEditing] = useState(!initialData)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        years_playing: initialData?.years_playing || '',
        playing_frequency: initialData?.playing_frequency || '',
        competitive_background: initialData?.competitive_background || '',
        intensity_preference: initialData?.intensity_preference || '',
        preferred_role: initialData?.preferred_role || '',
        team_preference: initialData?.team_preference || '',
        comfortable_hosting: initialData?.comfortable_hosting || false,
        physical_traits: initialData?.physical_traits || {},
        personal_goals: initialData?.personal_goals || []
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch('/api/profile/sport-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_sport_id: playerSportId,
                    ...formData
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to save')
            }

            const data = await response.json()
            await onSave(data.sportProfile) // Wait for parent to refresh
            setIsEditing(false)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handlePhysicalTraitChange = (label: string, value: string) => {
        setFormData({
            ...formData,
            physical_traits: {
                ...formData.physical_traits,
                [label]: value
            }
        })
    }

    const toggleGoal = (goal: string) => {
        const goals = formData.personal_goals || []
        if (goals.includes(goal)) {
            setFormData({
                ...formData,
                personal_goals: goals.filter((g: string) => g !== goal)
            })
        } else {
            setFormData({
                ...formData,
                personal_goals: [...goals, goal]
            })
        }
    }

    if (!isEditing && initialData) {
        return (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-200 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                            {getSportConfig(sportName)?.emoji || '🏅'}
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-900">{sportName}</h4>
                            <p className="text-xs font-bold text-slate-500">Profile Complete</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                    >
                        Edit
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Experience
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{formData.years_playing}</span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Frequency
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{formData.playing_frequency}</span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Background
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{formData.competitive_background}</span>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Intensity
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{formData.intensity_preference}</span>
                    </div>
                </div>

                {formData.personal_goals && formData.personal_goals.length > 0 && (
                    <div className="mt-4 bg-white rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Goals
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {formData.personal_goals.map((goal: string) => (
                                <span
                                    key={goal}
                                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold"
                                >
                                    {goal}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border-2 border-blue-200 rounded-2xl p-6 space-y-6">
            <h4 className="text-lg font-black text-slate-900">{sportName} Profile</h4>

            {/* Experience & Commitment */}
            <div className="space-y-4">
                <h5 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                    Experience & Commitment
                </h5>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Years Playing
                    </label>
                    <select
                        value={formData.years_playing}
                        onChange={(e) => setFormData({ ...formData, years_playing: e.target.value })}
                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        required
                    >
                        <option value="">Select...</option>
                        {YEARS_PLAYING_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Playing Frequency
                    </label>
                    <select
                        value={formData.playing_frequency}
                        onChange={(e) => setFormData({ ...formData, playing_frequency: e.target.value })}
                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        required
                    >
                        <option value="">Select...</option>
                        {PLAYING_FREQUENCY_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Competitive Background
                    </label>
                    <select
                        value={formData.competitive_background}
                        onChange={(e) => setFormData({ ...formData, competitive_background: e.target.value })}
                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        required
                    >
                        <option value="">Select...</option>
                        {COMPETITIVE_BACKGROUND_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Playing Style */}
            <div className="space-y-4">
                <h5 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                    Playing Style
                </h5>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Intensity Preference
                    </label>
                    <select
                        value={formData.intensity_preference}
                        onChange={(e) => setFormData({ ...formData, intensity_preference: e.target.value })}
                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        required
                    >
                        <option value="">Select...</option>
                        {INTENSITY_PREFERENCE_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {sportConfig && sportConfig.roles.length > 0 && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Preferred Role
                        </label>
                        <select
                            value={formData.preferred_role}
                            onChange={(e) => setFormData({ ...formData, preferred_role: e.target.value })}
                            className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select...</option>
                            {sportConfig.roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Team Preference
                    </label>
                    <select
                        value={formData.team_preference}
                        onChange={(e) => setFormData({ ...formData, team_preference: e.target.value })}
                        className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        required
                    >
                        <option value="">Select...</option>
                        {TEAM_PREFERENCE_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id={`hosting-${playerSportId}`}
                        checked={formData.comfortable_hosting}
                        onChange={(e) => setFormData({ ...formData, comfortable_hosting: e.target.checked })}
                        className="w-5 h-5 rounded border-2 border-slate-300"
                    />
                    <label htmlFor={`hosting-${playerSportId}`} className="text-sm font-bold text-slate-700">
                        Comfortable hosting games
                    </label>
                </div>
            </div>

            {/* Physical/Tactical Traits */}
            {sportConfig && sportConfig.physicalTraits.length > 0 && (
                <div className="space-y-4">
                    <h5 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                        Physical & Tactical Traits
                    </h5>

                    {sportConfig.physicalTraits.map(trait => (
                        <div key={trait.label}>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                {trait.label}
                            </label>
                            <select
                                value={formData.physical_traits[trait.label] || ''}
                                onChange={(e) => handlePhysicalTraitChange(trait.label, e.target.value)}
                                className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Select...</option>
                                {trait.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {/* Personal Goals */}
            <div className="space-y-4">
                <h5 className="text-sm font-black text-slate-700 uppercase tracking-wider">
                    Personal Goals
                </h5>
                <p className="text-xs text-slate-500 font-medium">
                    Select all that apply
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PERSONAL_GOALS.map(goal => (
                        <button
                            key={goal}
                            type="button"
                            onClick={() => toggleGoal(goal)}
                            className={`p-3 rounded-xl border-2 text-sm font-bold text-left transition-all ${formData.personal_goals?.includes(goal)
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                                }`}
                        >
                            {goal}
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-grow bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
                {initialData && (
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({
                                years_playing: initialData?.years_playing || '',
                                playing_frequency: initialData?.playing_frequency || '',
                                competitive_background: initialData?.competitive_background || '',
                                intensity_preference: initialData?.intensity_preference || '',
                                preferred_role: initialData?.preferred_role || '',
                                team_preference: initialData?.team_preference || '',
                                comfortable_hosting: initialData?.comfortable_hosting || false,
                                physical_traits: initialData?.physical_traits || {},
                                personal_goals: initialData?.personal_goals || []
                            })
                            setIsEditing(false)
                        }}
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    )
}
