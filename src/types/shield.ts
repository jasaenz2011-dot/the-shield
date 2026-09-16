// The shield document is the single source of truth for a student's portfolio.
// It is what gets saved to disk and, in Phase 7, what the export pipeline renders.

export const SHIELD_DOC_VERSION = 0

export type Vibe = 'cool' | 'tough' | 'cute' | 'confident' | 'playful'

export type Subject = 'math' | 'science' | 'art' | 'history' | 'reading' | 'life'

export type ArtifactKind = 'image' | 'video' | 'audio' | 'text'

// Template-agnostic content: every template renders the same artifact list its
// own way, so switching templates never loses student work.
export interface ArtifactRef {
  id: string
  kind: ArtifactKind
  url: string // shield:// asset URL ('' for text-only artifacts)
  caption: string
  subject: Subject
  createdAt: string
}

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
  artifacts: ArtifactRef[] // Phase 4: ingested media
  // Per-template layout hints keyed by template id; preserved across switches.
  templateData: Record<string, unknown>
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
    artifacts: [],
    templateData: {}
  }
}

export const SUBJECTS: Record<Subject, { label: string; icon: string; hue: string }> = {
  math: { label: 'Math', icon: '÷', hue: '#38bdf8' },
  science: { label: 'Science', icon: '⚛', hue: '#4ade80' },
  art: { label: 'Art', icon: '✎', hue: '#f472b6' },
  history: { label: 'History', icon: '⧗', hue: '#fbbf24' },
  reading: { label: 'Reading', icon: '¶', hue: '#c084fc' },
  life: { label: 'My Life', icon: '☀', hue: '#fb923c' }
}
