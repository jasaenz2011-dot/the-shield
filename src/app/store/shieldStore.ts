import { create } from 'zustand'
import { newShieldDocument, type ShieldDocument } from '../../types/shield'

interface ShieldState {
  shields: ShieldDocument[]
  current: ShieldDocument | null
  refresh: () => Promise<void>
  createShield: (studentName: string) => Promise<ShieldDocument>
  openShield: (id: string) => Promise<void>
  updateCurrent: (patch: Partial<ShieldDocument>) => Promise<void>
}

export const useShieldStore = create<ShieldState>((set, get) => ({
  shields: [],
  current: null,

  refresh: async () => {
    const docs = (await window.shieldAPI.listShields()) as ShieldDocument[]
    docs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    set({ shields: docs })
  },

  createShield: async (studentName: string) => {
    const doc = newShieldDocument(studentName.trim() || 'Student')
    await window.shieldAPI.saveShield(doc)
    const docs = (await window.shieldAPI.listShields()) as ShieldDocument[]
    docs.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    set({ current: doc, shields: docs })
    return doc
  },

  openShield: async (id: string) => {
    const doc = (await window.shieldAPI.loadShield(id)) as ShieldDocument
    set({ current: doc })
  },

  updateCurrent: async (patch: Partial<ShieldDocument>) => {
    const current = get().current
    if (!current) return
    const next: ShieldDocument = { ...current, ...patch, updatedAt: new Date().toISOString() }
    await window.shieldAPI.saveShield(next)
    set({ current: next })
  }
}))
