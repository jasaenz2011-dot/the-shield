import { describe, expect, it } from 'vitest'
import { VIBES, VIBE_ORDER } from '../src/features/character-select/idle-animation/vibes'

describe('idle animation vibes', () => {
  it('exposes exactly the five locked vibes, in picker order', () => {
    expect(VIBE_ORDER).toEqual(['cool', 'tough', 'cute', 'confident', 'playful'])
    expect(Object.keys(VIBES).sort()).toEqual([...VIBE_ORDER].sort())
  })

  it('keeps every vibe subtle enough to read as idle, not dance', () => {
    for (const vibe of VIBE_ORDER) {
      const p = VIBES[vibe]
      expect(p.label.length).toBeGreaterThan(0)
      expect(p.swayDeg).toBeGreaterThan(0)
      expect(p.swayDeg).toBeLessThanOrEqual(5)
      expect(p.bobPx).toBeGreaterThan(0)
      expect(p.bobPx).toBeLessThanOrEqual(10)
      expect(p.breatheScale).toBeGreaterThan(0)
      expect(p.breatheScale).toBeLessThan(0.05)
      expect(p.swayHz).toBeGreaterThan(0)
      expect(p.swayHz).toBeLessThan(1)
    }
  })

  it('makes the vibes visually distinct from each other', () => {
    const signatures = VIBE_ORDER.map((v) => {
      const p = VIBES[v]
      return `${p.swayDeg}/${p.bobPx}/${p.breatheScale}/${p.tiltDeg}`
    })
    expect(new Set(signatures).size).toBe(VIBE_ORDER.length)
  })
})
