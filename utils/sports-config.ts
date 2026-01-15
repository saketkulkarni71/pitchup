// Sports configuration for PitchUp
// Defines available sports, roles, and sport-specific traits

export interface SportConfig {
  name: string
  emoji: string
  roles: string[]
  physicalTraits: {
    label: string
    options: string[]
  }[]
}

export const AVAILABLE_SPORTS: SportConfig[] = [
  {
    name: 'Football',
    emoji: '⚽',
    roles: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Flexible'],
    physicalTraits: [
      {
        label: 'Preferred Foot',
        options: ['Left', 'Right', 'Both']
      },
      {
        label: 'Play Style',
        options: ['Offense-focused', 'Defense-focused', 'Balanced']
      },
      {
        label: 'Strength',
        options: ['Speed', 'Technique', 'Endurance', 'Power']
      }
    ]
  },
  {
    name: 'Basketball',
    emoji: '🏀',
    roles: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center', 'Flexible'],
    physicalTraits: [
      {
        label: 'Shooting Hand',
        options: ['Left', 'Right', 'Both']
      },
      {
        label: 'Play Style',
        options: ['Offense-focused', 'Defense-focused', 'Balanced']
      },
      {
        label: 'Strength',
        options: ['Shooting', 'Passing', 'Defense', 'Rebounding']
      }
    ]
  },
  {
    name: 'Tennis',
    emoji: '🎾',
    roles: ['Singles', 'Doubles', 'Both'],
    physicalTraits: [
      {
        label: 'Playing Hand',
        options: ['Left', 'Right']
      },
      {
        label: 'Play Style',
        options: ['Aggressive', 'Defensive', 'All-court']
      },
      {
        label: 'Strength',
        options: ['Serve', 'Baseline', 'Net Play', 'Volleys']
      }
    ]
  },
  {
    name: 'Padel',
    emoji: '🎾',
    roles: ['Left Side', 'Right Side', 'Flexible'],
    physicalTraits: [
      {
        label: 'Playing Hand',
        options: ['Left', 'Right']
      },
      {
        label: 'Play Style',
        options: ['Aggressive', 'Defensive', 'Balanced']
      },
      {
        label: 'Strength',
        options: ['Smash', 'Lob', 'Wall Play', 'Net Play']
      }
    ]
  },
  {
    name: 'Volleyball',
    emoji: '🏐',
    roles: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Libero', 'Opposite', 'Flexible'],
    physicalTraits: [
      {
        label: 'Hitting Hand',
        options: ['Left', 'Right', 'Both']
      },
      {
        label: 'Play Style',
        options: ['Offense-focused', 'Defense-focused', 'Balanced']
      },
      {
        label: 'Strength',
        options: ['Spiking', 'Blocking', 'Serving', 'Passing']
      }
    ]
  },
  {
    name: 'Badminton',
    emoji: '🏸',
    roles: ['Singles', 'Doubles', 'Both'],
    physicalTraits: [
      {
        label: 'Playing Hand',
        options: ['Left', 'Right']
      },
      {
        label: 'Play Style',
        options: ['Aggressive', 'Defensive', 'All-court']
      },
      {
        label: 'Strength',
        options: ['Smash', 'Drop Shot', 'Net Play', 'Defense']
      }
    ]
  },
  {
    name: 'Table Tennis',
    emoji: '🏓',
    roles: ['Singles', 'Doubles', 'Both'],
    physicalTraits: [
      {
        label: 'Playing Hand',
        options: ['Left', 'Right']
      },
      {
        label: 'Play Style',
        options: ['Offensive', 'Defensive', 'All-round']
      },
      {
        label: 'Strength',
        options: ['Forehand', 'Backhand', 'Spin', 'Speed']
      }
    ]
  },
  {
    name: 'Cricket',
    emoji: '🏏',
    roles: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper', 'Flexible'],
    physicalTraits: [
      {
        label: 'Batting Hand',
        options: ['Left', 'Right']
      },
      {
        label: 'Bowling Hand',
        options: ['Left', 'Right', 'N/A']
      },
      {
        label: 'Strength',
        options: ['Batting', 'Bowling', 'Fielding', 'All-round']
      }
    ]
  }
]

export const PERSONAL_GOALS = [
  'Stay active',
  'Improve seriously',
  'Play structured leagues',
  'Return after injury',
  'Mentor others',
  'Make new friends',
  'Compete at higher level'
]

export const YEARS_PLAYING_OPTIONS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
]

export const PLAYING_FREQUENCY_OPTIONS = [
  'Occasionally',
  'Weekly',
  'Multiple times per week',
  'Daily'
]

export const COMPETITIVE_BACKGROUND_OPTIONS = [
  'Casual / Social',
  'Local leagues',
  'Club / Academy (past)',
  'Club / Academy (current)',
  'Regional competition',
  'National competition'
]

export const INTENSITY_PREFERENCE_OPTIONS = [
  'Casual',
  'Competitive',
  'High-intensity'
]

export const TEAM_PREFERENCE_OPTIONS = [
  'Structured',
  'Free-flowing',
  'No preference'
]

// Helper function to get sport config by name
export function getSportConfig(sportName: string): SportConfig | undefined {
  return AVAILABLE_SPORTS.find(s => s.name === sportName)
}

// Helper function to get all sport names
export function getAllSportNames(): string[] {
  return AVAILABLE_SPORTS.map(s => s.name)
}

// Helper function to get sport emoji
export function getSportEmoji(sportName: string): string {
  return getSportConfig(sportName)?.emoji || '🏅'
}
