// The shield document is the single source of truth for a student's portfolio.
// It is what gets saved to disk and, in Phase 7, what the export pipeline renders.

export const SHIELD_DOC_VERSION = 0

export type Vibe = 'cool' | 'tough' | 'cute' | 'confident' | 'playful'

export interface CharacterConfig {
  // shield:// URLs of assets saved under this shield's assets folder
  cutoutUrl: string
  originalUrl: string
  vibe: Vibe
  montageUrls: string[]
}

export interface ShieldDocument {
  version: typeof SHIELD_DOC_VERSION
  id: string
  studentName: string
  createdAt: string
  updatedAt: string
  // Set by later phases; kept in the schema now so documents round-trip forward.
  style: string | null // Phase 2: art style id
  template: string | null // Phase 3: template id
  character: CharacterConfig | null // Phase 1: cutout, vibe, montage refs
  artifacts: unknown[] // Phase 4: ingested media
}

export function newShieldDocument(studentName: string): ShieldDocument {
  const now = new Date().toISOString()
  return {
    version: SHIELD_DOC_VERSION,
    id: `shield-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    studentName,
    createdAt: now,
    updatedAt: now,
    style: null,
    template: null,
    character: null,
    artifacts: []
  }
}
