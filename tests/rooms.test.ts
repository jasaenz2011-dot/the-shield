import { describe, expect, it } from 'vitest'
import { ROOMS, roomById } from '../src/features/templates/mansion/rooms'
import { SUBJECTS } from '../src/types/shield'

describe('mansion rooms', () => {
  it('starts in the entry hall, which shows every subject', () => {
    expect(ROOMS[0].id).toBe('hall')
    expect(ROOMS[0].subject).toBeNull()
  })

  it('has unique ids and only valid subjects', () => {
    const ids = ROOMS.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const room of ROOMS) {
      if (room.subject !== null) {
        expect(Object.keys(SUBJECTS)).toContain(room.subject)
      }
      expect(room.wallA).toMatch(/^#[0-9a-f]{6}$/i)
      expect(room.wallB).toMatch(/^#[0-9a-f]{6}$/i)
      expect(room.accent).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('falls back to the entry hall for unknown room ids', () => {
    expect(roomById('does-not-exist').id).toBe('hall')
    expect(roomById('science').name).toBe('Science Lab')
  })
})
