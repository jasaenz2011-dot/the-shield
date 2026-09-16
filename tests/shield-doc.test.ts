import { describe, expect, it } from 'vitest'
import { newShieldDocument, SHIELD_DOC_VERSION, SUBJECTS } from '../src/types/shield'

// Must stay in sync with the main process' filesystem-safety check.
const SHIELD_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/

describe('newShieldDocument', () => {
  it('creates a versioned, empty document', () => {
    const doc = newShieldDocument('Avery')
    expect(doc.version).toBe(SHIELD_DOC_VERSION)
    expect(doc.studentName).toBe('Avery')
    expect(doc.style).toBeNull()
    expect(doc.template).toBeNull()
    expect(doc.character).toBeNull()
    expect(doc.artifacts).toEqual([])
    expect(doc.templateData).toEqual({})
    expect(Date.parse(doc.createdAt)).not.toBeNaN()
    expect(doc.updatedAt).toBe(doc.createdAt)
  })

  it('generates filesystem-safe, unique ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => newShieldDocument('x').id))
    expect(ids.size).toBe(50)
    for (const id of ids) expect(id).toMatch(SHIELD_ID)
  })
})

describe('SUBJECTS', () => {
  it('defines label, icon, and color for every subject', () => {
    const entries = Object.entries(SUBJECTS)
    expect(entries.length).toBe(6)
    for (const [, meta] of entries) {
      expect(meta.label.length).toBeGreaterThan(0)
      expect(meta.icon.length).toBeGreaterThan(0)
      expect(meta.hue).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
