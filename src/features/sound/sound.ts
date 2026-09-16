// Sound design with zero audio assets: every cue is synthesized through the
// Web Audio API at play time, so it works offline, adds no bytes to the
// install, and stays consistent. A single global toggle persists per machine.

const MUTE_KEY = 'shield.soundMuted'

let ctx: AudioContext | null = null
let muted = false
try {
  muted = localStorage.getItem(MUTE_KEY) === '1'
} catch {
  // storage unavailable: default to sound on
}

function audio(): AudioContext | null {
  if (muted) return null
  try {
    ctx = ctx ?? new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    // non-fatal
  }
}

function tone(
  freq: number,
  durationMs: number,
  opts: { type?: OscillatorType; gain?: number; sweepTo?: number; delayMs?: number } = {}
): void {
  const ac = audio()
  if (!ac) return
  const start = ac.currentTime + (opts.delayMs ?? 0) / 1000
  const end = start + durationMs / 1000
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = opts.type ?? 'sine'
  osc.frequency.setValueAtTime(freq, start)
  if (opts.sweepTo) osc.frequency.exponentialRampToValueAtTime(opts.sweepTo, end)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(opts.gain ?? 0.08, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(end + 0.02)
}

// UI vocabulary — small, soft, game-y but not childish.
export const sfx = {
  tick(): void {
    tone(2200, 40, { type: 'triangle', gain: 0.04 })
  },
  door(): void {
    tone(180, 350, { type: 'sine', gain: 0.07, sweepTo: 70 })
    tone(900, 200, { type: 'triangle', gain: 0.025, sweepTo: 1500, delayMs: 120 })
  },
  start(): void {
    // rising three-note chime
    tone(523, 120, { type: 'triangle', gain: 0.07 })
    tone(659, 120, { type: 'triangle', gain: 0.07, delayMs: 110 })
    tone(784, 260, { type: 'triangle', gain: 0.08, delayMs: 220 })
  },
  saved(): void {
    tone(880, 90, { type: 'sine', gain: 0.045 })
    tone(1318, 140, { type: 'sine', gain: 0.045, delayMs: 80 })
  }
}
