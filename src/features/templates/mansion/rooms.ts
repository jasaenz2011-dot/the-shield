import type { Subject } from '../../../types/shield'

export interface RoomPreset {
  id: string
  name: string
  subject: Subject | null // null = entry hall (shows everything)
  icon: string
  // Two wall tones + an accent; each room reads as its own place.
  wallA: string
  wallB: string
  accent: string
  floor: string
}

export const ROOMS: RoomPreset[] = [
  {
    id: 'hall',
    name: 'Entry Hall',
    subject: null,
    icon: '⌂',
    wallA: '#101a2b',
    wallB: '#1c2a44',
    accent: '#22d3ee',
    floor: '#0a1120'
  },
  {
    id: 'math',
    name: 'Math Room',
    subject: 'math',
    icon: '÷',
    wallA: '#0c1f2e',
    wallB: '#123a52',
    accent: '#38bdf8',
    floor: '#081521'
  },
  {
    id: 'science',
    name: 'Science Lab',
    subject: 'science',
    icon: '⚛',
    wallA: '#0d2417',
    wallB: '#14402a',
    accent: '#4ade80',
    floor: '#081a10'
  },
  {
    id: 'art',
    name: 'Art Studio',
    subject: 'art',
    icon: '✎',
    wallA: '#2a1220',
    wallB: '#471f38',
    accent: '#f472b6',
    floor: '#1d0c16'
  },
  {
    id: 'history',
    name: 'History Field',
    subject: 'history',
    icon: '⧗',
    wallA: '#261c0b',
    wallB: '#453413',
    accent: '#fbbf24',
    floor: '#1a1307'
  },
  {
    id: 'reading',
    name: 'Reading Nook',
    subject: 'reading',
    icon: '¶',
    wallA: '#1d1230',
    wallB: '#332052',
    accent: '#c084fc',
    floor: '#140b22'
  }
]

export const roomById = (id: string): RoomPreset => ROOMS.find((r) => r.id === id) ?? ROOMS[0]
