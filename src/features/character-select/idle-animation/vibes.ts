import type { Vibe } from '../../../types/shield'

export interface VibeParams {
  label: string
  hint: string
  swayDeg: number // side-to-side rotation amplitude
  swayHz: number
  bobPx: number // vertical bounce amplitude
  bobHz: number
  breatheScale: number // subtle vertical scale for breathing
  breatheHz: number
  tiltDeg: number // constant resting head-tilt
}

export const VIBES: Record<Vibe, VibeParams> = {
  cool: {
    label: 'Cool',
    hint: 'Slow, unbothered sway',
    swayDeg: 1.2,
    swayHz: 0.15,
    bobPx: 3,
    bobHz: 0.3,
    breatheScale: 0.008,
    breatheHz: 0.22,
    tiltDeg: -1.5
  },
  tough: {
    label: 'Tough',
    hint: 'Planted. Heavy breathing, no wobble',
    swayDeg: 0.4,
    swayHz: 0.12,
    bobPx: 1.5,
    bobHz: 0.25,
    breatheScale: 0.016,
    breatheHz: 0.18,
    tiltDeg: 0
  },
  cute: {
    label: 'Cute',
    hint: 'Light bounce with a head-tilt',
    swayDeg: 2,
    swayHz: 0.35,
    bobPx: 5,
    bobHz: 0.55,
    breatheScale: 0.01,
    breatheHz: 0.4,
    tiltDeg: 2.5
  },
  confident: {
    label: 'Confident',
    hint: 'Upright, chest out, steady',
    swayDeg: 0.8,
    swayHz: 0.18,
    bobPx: 2.5,
    bobHz: 0.28,
    breatheScale: 0.012,
    breatheHz: 0.25,
    tiltDeg: 0
  },
  playful: {
    label: 'Playful',
    hint: 'Bouncy, can barely stand still',
    swayDeg: 2.6,
    swayHz: 0.5,
    bobPx: 7,
    bobHz: 0.7,
    breatheScale: 0.012,
    breatheHz: 0.5,
    tiltDeg: 1
  }
}

export const VIBE_ORDER: Vibe[] = ['cool', 'tough', 'cute', 'confident', 'playful']
