import { z } from 'zod'

export const schoolConfigSchema = z.object({
  schoolName: z.string().min(1).optional(),
  mascotName: z.string().min(1).optional(),
  schoolYear: z.string().min(1).optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      foreground: z.string().optional()
    })
    .optional(),
  splash: z
    .object({
      // Filename of a video inside school-config/, or null for the blank slot.
      video: z.string().nullable().optional(),
      maxSeconds: z.number().positive().max(60).optional(),
      fadeOutMs: z.number().nonnegative().max(10000).optional(),
      skipAfterFirstRun: z.boolean().optional()
    })
    .optional()
})

export type SchoolConfigInput = z.infer<typeof schoolConfigSchema>

export interface SchoolConfig {
  schoolName: string
  mascotName: string
  schoolYear: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  splash: {
    video: string | null
    maxSeconds: number
    fadeOutMs: number
    skipAfterFirstRun: boolean
  }
}

export const DEFAULT_CONFIG: SchoolConfig = {
  schoolName: 'My School',
  mascotName: 'Stingray',
  schoolYear: '2026–27',
  colors: {
    primary: '#22d3ee',
    secondary: '#0e7490',
    accent: '#fbbf24',
    background: '#0b0f1a',
    foreground: '#f8fafc'
  },
  splash: {
    video: null,
    maxSeconds: 8,
    fadeOutMs: 600,
    skipAfterFirstRun: true
  }
}

export function resolveConfig(raw: unknown): SchoolConfig {
  const parsed = schoolConfigSchema.safeParse(raw)
  if (!parsed.success) return DEFAULT_CONFIG
  const input = parsed.data
  return {
    schoolName: input.schoolName ?? DEFAULT_CONFIG.schoolName,
    mascotName: input.mascotName ?? DEFAULT_CONFIG.mascotName,
    schoolYear: input.schoolYear ?? DEFAULT_CONFIG.schoolYear,
    colors: { ...DEFAULT_CONFIG.colors, ...input.colors },
    splash: {
      video: input.splash?.video ?? DEFAULT_CONFIG.splash.video,
      maxSeconds: input.splash?.maxSeconds ?? DEFAULT_CONFIG.splash.maxSeconds,
      fadeOutMs: input.splash?.fadeOutMs ?? DEFAULT_CONFIG.splash.fadeOutMs,
      skipAfterFirstRun: input.splash?.skipAfterFirstRun ?? DEFAULT_CONFIG.splash.skipAfterFirstRun
    }
  }
}
