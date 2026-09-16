import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../app/store/appStore'
import { useShieldStore } from '../../app/store/shieldStore'
import { SUBJECTS, type ArtifactRef } from '../../types/shield'
import { styleById } from '../styles/registry'
import { IdleRig } from '../character-select/idle-animation/IdleRig'
import { NameText3D } from '../character-select/NameText3D'
import { YearBadge } from '../character-select/YearBadge'
import { PressStart } from '../character-select/PressStart'

// Free-form layer composer: every scene element (character idle, 3D name,
// year badge, PRESS START, school logo, subject artifacts) becomes a layer
// the student can drag, resize, and reposition on a canvas. Unlocked, layers
// render as cheap static proxies with edit handles; locked, the handles
// disappear and the real animated components play. Layout is stored under
// shield.templateData.composer as canvas-relative fractions, so it rides the
// existing save/export JSON and survives window resizes and template
// switches without any schema change.

interface LayerBox {
  x: number // fraction of canvas width, 0..1
  y: number // fraction of canvas height, 0..1
  w: number
  h: number
}

interface ComposerData {
  locked: boolean
  layers: Record<string, LayerBox>
}

const COMPOSER_KEY = 'composer'

// Fixed stacking order, back to front. Artifact layers sit between the name
// and the character so the kid always stays in front of their work.
const BUILTIN_DEFAULTS: Record<string, LayerBox> = {
  logo: { x: 0.02, y: 0.02, w: 0.14, h: 0.12 },
  name3d: { x: 0.15, y: 0.02, w: 0.7, h: 0.22 },
  character: { x: 0.3, y: 0.24, w: 0.4, h: 0.56 },
  yearBadge: { x: 0.39, y: 0.82, w: 0.22, h: 0.06 },
  pressStart: { x: 0.34, y: 0.89, w: 0.32, h: 0.09 }
}

const artifactKey = (a: ArtifactRef) => `artifact:${a.id}`

const artifactDefault = (index: number): LayerBox => ({
  x: 0.02 + 0.18 * Math.floor(index / 3),
  y: 0.18 + 0.2 * (index % 3),
  w: 0.15,
  h: 0.17
})

function readComposerData(templateData: Record<string, unknown>): ComposerData {
  const raw = templateData[COMPOSER_KEY]
  if (raw && typeof raw === 'object') {
    const data = raw as Partial<ComposerData>
    return {
      locked: data.locked === true,
      layers: data.layers && typeof data.layers === 'object' ? { ...data.layers } : {}
    }
  }
  return { locked: false, layers: {} }
}

type Gesture = {
  id: string
  mode: 'move' | 'resize'
  startX: number
  startY: number
  startBox: LayerBox
}

export function Composer({ onStart }: { onStart?: () => void }) {
  const config = useAppStore((s) => s.config)
  const logoUrl = useAppStore((s) => s.logoUrl)
  const { current, updateCurrent } = useShieldStore()

  const canvasRef = useRef<HTMLDivElement>(null)
  const gestureRef = useRef<Gesture | null>(null)
  const [data, setData] = useState<ComposerData>({ locked: false, layers: {} })
  const dataRef = useRef(data)
  dataRef.current = data

  // Reload layout when a different shield is opened.
  const shieldId = current?.id ?? null
  useEffect(() => {
    if (current) setData(readComposerData(current.templateData))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shieldId])

  const persist = useCallback(
    (next: ComposerData) => {
      setData(next)
      if (!current) return
      void updateCurrent({
        templateData: { ...current.templateData, [COMPOSER_KEY]: next }
      })
    },
    [current, updateCurrent]
  )

  if (!current) return null

  const style = styleById(current.style)
  const character = current.character
  const locked = data.locked

  const boxFor = (id: string, fallback: LayerBox): LayerBox => data.layers[id] ?? fallback

  const beginGesture = (id: string, mode: Gesture['mode'], box: LayerBox) => {
    return (e: React.PointerEvent) => {
      if (locked) return
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      gestureRef.current = { id, mode, startX: e.clientX, startY: e.clientY, startBox: box }
    }
  }

  const onGestureMove = (e: React.PointerEvent) => {
    const g = gestureRef.current
    const canvas = canvasRef.current
    if (!g || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const dx = (e.clientX - g.startX) / rect.width
    const dy = (e.clientY - g.startY) / rect.height
    const b = g.startBox
    const next: LayerBox =
      g.mode === 'move'
        ? {
            ...b,
            x: Math.min(Math.max(b.x + dx, -b.w / 2), 1 - b.w / 2),
            y: Math.min(Math.max(b.y + dy, -b.h / 2), 1 - b.h / 2)
          }
        : {
            ...b,
            w: Math.min(Math.max(b.w + dx, 0.05), 1.5),
            h: Math.min(Math.max(b.h + dy, 0.04), 1.5)
          }
    setData((d) => ({ ...d, layers: { ...d.layers, [g.id]: next } }))
  }

  const onGestureEnd = (e: React.PointerEvent) => {
    const g = gestureRef.current
    if (!g) return
    gestureRef.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    // Persist once per gesture, not per pointermove, to keep disk writes rare.
    persist(dataRef.current)
  }

  const layerShell = (id: string, fallback: LayerBox, z: number, children: React.ReactNode) => {
    const box = boxFor(id, fallback)
    return (
      <div
        key={id}
        className="absolute"
        style={{
          left: `${box.x * 100}%`,
          top: `${box.y * 100}%`,
          width: `${box.w * 100}%`,
          height: `${box.h * 100}%`,
          zIndex: z,
          touchAction: 'none',
          cursor: locked ? undefined : 'grab'
        }}
        onPointerDown={beginGesture(id, 'move', box)}
        onPointerMove={onGestureMove}
        onPointerUp={onGestureEnd}
        onPointerCancel={onGestureEnd}
      >
        <div
          className="flex h-full w-full items-center justify-center"
          style={
            locked
              ? undefined
              : { outline: '1.5px dashed color-mix(in srgb, var(--shield-primary) 65%, transparent)', outlineOffset: '2px', borderRadius: '8px' }
          }
        >
          {children}
        </div>
        {!locked && (
          <div
            className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-sm border border-black/40 bg-[var(--shield-primary)]"
            style={{ cursor: 'nwse-resize', touchAction: 'none' }}
            onPointerDown={beginGesture(id, 'resize', box)}
            onPointerMove={onGestureMove}
            onPointerUp={onGestureEnd}
            onPointerCancel={onGestureEnd}
          />
        )}
      </div>
    )
  }

  const artifactContent = (a: ArtifactRef) => {
    const subject = SUBJECTS[a.subject]
    if (a.kind === 'image' && a.url) {
      return (
        <img
          src={a.url}
          alt={a.caption}
          draggable={false}
          className="pointer-events-none h-full w-full rounded-lg object-contain"
        />
      )
    }
    if (a.kind === 'video' && a.url) {
      return (
        <video
          key={locked ? 'play' : 'hold'}
          src={a.url}
          muted
          loop
          playsInline
          autoPlay={locked}
          className="pointer-events-none h-full w-full rounded-lg object-contain"
        />
      )
    }
    // Audio and text artifacts render as a subject-tinted card.
    return (
      <div
        className="pointer-events-none flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border bg-black/50 p-2 text-center backdrop-blur-sm"
        style={{ borderColor: subject.hue }}
      >
        <span className="text-2xl" style={{ color: subject.hue }}>
          {subject.icon}
        </span>
        <span className="line-clamp-2 text-xs text-white/80">{a.caption || subject.label}</span>
      </div>
    )
  }

  return (
    <div ref={canvasRef} className="relative h-full w-full select-none overflow-hidden">
      {/* School logo */}
      {layerShell(
        'logo',
        BUILTIN_DEFAULTS.logo,
        10,
        logoUrl ? (
          <img
            src={logoUrl}
            alt={config.schoolName}
            draggable={false}
            className="pointer-events-none h-full w-full object-contain"
          />
        ) : (
          <span
            className="pointer-events-none text-center font-black uppercase tracking-widest text-[var(--shield-accent)]"
            style={{ fontFamily: style.headingFont, fontSize: 'clamp(10px, 1.4vw, 20px)' }}
          >
            {config.schoolName}
          </span>
        )
      )}

      {/* 3D name — static proxy while editing keeps dragging cheap */}
      {layerShell(
        'name3d',
        BUILTIN_DEFAULTS.name3d,
        20,
        locked ? (
          <div className="pointer-events-none h-full w-full">
            <NameText3D name={current.studentName} style={style} />
          </div>
        ) : (
          <span
            className="pointer-events-none truncate font-black uppercase tracking-wider"
            style={{
              fontFamily: style.headingFont,
              color: style.nameMaterial.color,
              fontSize: 'clamp(16px, 3.5vw, 56px)'
            }}
          >
            {current.studentName.trim().toUpperCase() || 'PLAYER 1'}
          </span>
        )
      )}

      {/* Subject artifacts, ABC order by caption (then subject) so the
          default grid reads alphabetically top-to-bottom */}
      {[...current.artifacts]
        .sort((a, b) =>
          (a.caption.trim() || SUBJECTS[a.subject].label).localeCompare(
            b.caption.trim() || SUBJECTS[b.subject].label,
            undefined,
            { sensitivity: 'base' }
          )
        )
        .map((a, i) => layerShell(artifactKey(a), artifactDefault(i), 30 + i, artifactContent(a)))}

      {/* Character idle */}
      {character &&
        layerShell(
          'character',
          BUILTIN_DEFAULTS.character,
          60,
          locked ? (
            <IdleRig vibe={character.vibe}>
              <img
                src={character.cutoutUrl}
                alt={current.studentName}
                draggable={false}
                className="pointer-events-none max-h-full max-w-full object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]"
              />
            </IdleRig>
          ) : (
            <img
              src={character.cutoutUrl}
              alt={current.studentName}
              draggable={false}
              className="pointer-events-none max-h-full max-w-full object-contain"
            />
          )
        )}

      {/* Year badge */}
      {layerShell(
        'yearBadge',
        BUILTIN_DEFAULTS.yearBadge,
        70,
        <YearBadge />
      )}

      {/* PRESS START — real button only when locked, so edits never navigate */}
      {layerShell(
        'pressStart',
        BUILTIN_DEFAULTS.pressStart,
        80,
        locked ? (
          <PressStart onStart={onStart ?? (() => {})} />
        ) : (
          <span className="pointer-events-none rounded-full border-2 border-[var(--shield-primary)] bg-black/50 px-8 py-3 text-lg font-black tracking-[0.35em] text-[var(--shield-primary)]">
            PRESS START
          </span>
        )
      )}

      {/* Lock toggle */}
      <button
        onClick={() => persist({ ...data, locked: !locked })}
        className="absolute left-4 bottom-4 z-[100] flex items-center gap-2 rounded-lg border border-white/15 bg-black/50 px-4 py-2 text-sm font-bold text-white/80 backdrop-blur-sm transition hover:bg-black/70 hover:text-white"
      >
        <span aria-hidden>{locked ? '🔒' : '🔓'}</span>
        {locked ? 'Unlock layout' : 'Lock & play'}
      </button>
    </div>
  )
}
