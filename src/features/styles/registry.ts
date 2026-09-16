// Art styles. Each style is a token set consumed everywhere a scene is
// rendered: the 3D name material, chrome, fonts, and the CSS treatment of
// scene surfaces. Previews are the live SampleRoom component driven by these
// same tokens, so the gallery can never drift from what students actually get.

export interface ShieldStyle {
  id: string
  name: string
  tagline: string
  // scene accents (school brand colors stay untouched; styles restyle scenes)
  palette: { primary: string; accent: string; glow: string }
  nameMaterial: { color: string; metalness: number; roughness: number }
  headingFont: string
  // CSS filter applied to scene surfaces (previews, montage)
  sceneFilter: string
  chrome: { radius: string; borderWidth: string }
  preview: { wallA: string; wallB: string; floor: string }
  // motion baked into the scene itself (Animated style)
  livelyScene: boolean
}

export const STYLES: ShieldStyle[] = [
  {
    id: 'realistic',
    name: 'Realistic',
    tagline: 'Clean light, true colors, photo-real feel.',
    palette: { primary: '#9db4c8', accent: '#d9c9a3', glow: '#ffffff' },
    nameMaterial: { color: '#c8d4e0', metalness: 0.75, roughness: 0.3 },
    headingFont: "system-ui, 'Segoe UI', sans-serif",
    sceneFilter: 'saturate(0.95) contrast(1.02)',
    chrome: { radius: '10px', borderWidth: '1px' },
    preview: { wallA: '#3d4a57', wallB: '#55646f', floor: '#2b333c' },
    livelyScene: false
  },
  {
    id: 'cyberpunk',
    name: 'Futuristic',
    tagline: 'Neon glow, chrome edges, midnight city.',
    palette: { primary: '#22d3ee', accent: '#f0abfc', glow: '#22d3ee' },
    nameMaterial: { color: '#22d3ee', metalness: 0.9, roughness: 0.15 },
    headingFont: "'Segoe UI', system-ui, sans-serif",
    sceneFilter: 'saturate(1.35) contrast(1.12) hue-rotate(-8deg)',
    chrome: { radius: '4px', borderWidth: '2px' },
    preview: { wallA: '#12081f', wallB: '#241145', floor: '#08040f' },
    livelyScene: false
  },
  {
    id: 'retro',
    name: 'Retro 80s–90s',
    tagline: 'Sunset gradients, scanlines, arcade heart.',
    palette: { primary: '#fb7185', accent: '#fbbf24', glow: '#fb7185' },
    nameMaterial: { color: '#fb7185', metalness: 0.5, roughness: 0.35 },
    headingFont: "'Courier New', monospace",
    sceneFilter: 'saturate(1.25) contrast(1.08) sepia(0.12)',
    chrome: { radius: '0px', borderWidth: '3px' },
    preview: { wallA: '#3b1140', wallB: '#7c2050', floor: '#1d0a22' },
    livelyScene: false
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    tagline: 'Flat color, bold lines, cel-shaded pop.',
    palette: { primary: '#38bdf8', accent: '#facc15', glow: '#facc15' },
    nameMaterial: { color: '#facc15', metalness: 0.05, roughness: 0.9 },
    headingFont: "'Comic Sans MS', 'Segoe UI', sans-serif",
    sceneFilter: 'saturate(1.6) contrast(1.15)',
    chrome: { radius: '18px', borderWidth: '3px' },
    preview: { wallA: '#1d4ed8', wallB: '#3b82f6', floor: '#172554' },
    livelyScene: false
  },
  {
    id: 'toybox',
    name: '3D Toybox',
    tagline: 'Soft plastic, rounded everything, toy-shelf shine.',
    palette: { primary: '#4ade80', accent: '#fb923c', glow: '#fef3c7' },
    nameMaterial: { color: '#fb923c', metalness: 0.2, roughness: 0.45 },
    headingFont: "'Trebuchet MS', system-ui, sans-serif",
    sceneFilter: 'saturate(1.3) brightness(1.06)',
    chrome: { radius: '24px', borderWidth: '2px' },
    preview: { wallA: '#155e46', wallB: '#1f8a63', floor: '#0d3d2d' },
    livelyScene: false
  },
  {
    id: 'sketch',
    name: 'Hand-drawn',
    tagline: 'Pencil, paper grain, watercolor washes.',
    palette: { primary: '#a8a29e', accent: '#b45309', glow: '#f5f5f4' },
    nameMaterial: { color: '#e7e5e4', metalness: 0.0, roughness: 1.0 },
    headingFont: "Georgia, 'Times New Roman', serif",
    sceneFilter: 'saturate(0.55) contrast(0.95) sepia(0.22)',
    chrome: { radius: '8px', borderWidth: '1px' },
    preview: { wallA: '#57534e', wallB: '#78716c', floor: '#44403c' },
    livelyScene: false
  },
  {
    id: 'animated',
    name: 'Animated',
    tagline: 'The scene itself is alive — motion baked in.',
    palette: { primary: '#c084fc', accent: '#67e8f9', glow: '#c084fc' },
    nameMaterial: { color: '#c084fc', metalness: 0.45, roughness: 0.3 },
    headingFont: "'Segoe UI', system-ui, sans-serif",
    sceneFilter: 'saturate(1.2)',
    chrome: { radius: '14px', borderWidth: '2px' },
    preview: { wallA: '#1e1b4b', wallB: '#4338ca', floor: '#12102e' },
    livelyScene: true
  }
]

export const DEFAULT_STYLE_ID = 'realistic'

export const styleById = (id: string | null): ShieldStyle =>
  STYLES.find((s) => s.id === id) ?? STYLES[0]
