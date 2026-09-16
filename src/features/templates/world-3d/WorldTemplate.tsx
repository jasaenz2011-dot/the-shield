import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, Html, OrbitControls } from '@react-three/drei'
import type { TemplateProps } from '../types'
import { SUBJECTS, type Subject } from '../../../types/shield'
import { ArtifactCard, EmptyState } from '../shared'
import { SplatScene } from '../../splats/SplatScene'

// Free-roam 3D world: one floating island per subject, optionally set inside
// a Gaussian-splat environment (.ply/.splat/.ksplat — photoreal scans).
// Deliberately light — low-poly primitives, capped dpr, CPU splat sort — so
// it stays smooth on integrated graphics.

const ISLAND_SUBJECTS = Object.keys(SUBJECTS) as Subject[]
const MAX_SPLAT_BYTES = 100 * 1024 * 1024
const SAMPLE_WORLD_URL = 'samples/sample-world.splat'

interface WorldData {
  splatUrl?: string | null
}

export function WorldTemplate({ shield, presentMode, onDataChange }: TemplateProps) {
  const [open, setOpen] = useState<Subject | null>(null)
  const data = (shield.templateData['world'] as WorldData | undefined) ?? {}
  const [splatError, setSplatError] = useState<string | null>(null)
  const [loadingWorld, setLoadingWorld] = useState(false)
  const splatUrl = data.splatUrl ?? null

  const setSplat = (url: string | null) => {
    setSplatError(null)
    onDataChange({ ...data, splatUrl: url })
  }

  const importWorldFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['ply', 'splat', 'ksplat'].includes(ext)) {
      setSplatError('Worlds are .ply, .splat, or .ksplat files.')
      return
    }
    if (file.size > MAX_SPLAT_BYTES) {
      setSplatError('That world is over 100MB — compress it to .ksplat first.')
      return
    }
    setLoadingWorld(true)
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { url } = await window.shieldAPI.saveAsset(shield.id, `world-${Date.now()}.${ext}`, bytes)
      setSplat(url)
    } catch (e) {
      setSplatError(e instanceof Error ? e.message : 'Could not import that world')
    } finally {
      setLoadingWorld(false)
    }
  }

  return (
    <div className="relative h-full">
      <Canvas
        camera={{ position: [0, 4, 14], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'low-power', antialias: true }}
      >
        <color attach="background" args={['#070b14']} />
        <fog attach="fog" args={['#070b14', 18, 34]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[6, 10, 4]} intensity={1.6} />

        {/* splat environment replaces the plain ground disc when set */}
        {splatUrl ? (
          <SplatScene url={splatUrl} onError={setSplatError} />
        ) : (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
            <circleGeometry args={[26, 48]} />
            <meshStandardMaterial color="#0b1322" roughness={1} />
          </mesh>
        )}

        {ISLAND_SUBJECTS.map((subject, i) => {
          const angle = (i / ISLAND_SUBJECTS.length) * Math.PI * 2
          const radius = 7
          const meta = SUBJECTS[subject]
          const count = shield.artifacts.filter((a) => a.subject === subject).length
          return (
            <Float key={subject} speed={1 + i * 0.13} floatIntensity={0.7} rotationIntensity={0.25}>
              <group position={[Math.cos(angle) * radius, Math.sin(i * 1.7) * 0.8, Math.sin(angle) * radius]}>
                <mesh onClick={() => setOpen(subject)}>
                  <icosahedronGeometry args={[1.15, 0]} />
                  <meshStandardMaterial color={meta.hue} roughness={0.35} metalness={0.15} />
                </mesh>
                <Html center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                  <div className="whitespace-nowrap rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">
                    {meta.label}
                    {count > 0 && <span className="ml-1.5 opacity-60">{count}</span>}
                  </div>
                </Html>
              </group>
            </Float>
          )
        })}

        <OrbitControls
          enablePan={false}
          minDistance={7}
          maxDistance={22}
          maxPolarAngle={Math.PI * 0.52}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/35">
        Drag to look around &middot; click an island to open it
      </p>

      {!presentMode && (
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <label
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                ;(e.currentTarget.querySelector('input') as HTMLInputElement | null)?.click()
              }
            }}
            className="cursor-pointer rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition hover:text-white"
          >
            {loadingWorld ? 'Loading world…' : 'Load photoreal world'}
            <input
              type="file"
              accept=".ply,.splat,.ksplat"
              className="hidden"
              disabled={loadingWorld}
              onChange={(e) => e.target.files?.[0] && void importWorldFile(e.target.files[0])}
            />
          </label>
          {!splatUrl && (
            <button
              onClick={() => setSplat(SAMPLE_WORLD_URL)}
              className="rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition hover:text-white"
            >
              Try the sample world
            </button>
          )}
          {splatUrl && (
            <button
              onClick={() => setSplat(null)}
              className="rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition hover:text-white"
            >
              Remove world
            </button>
          )}
          {splatError && <span className="text-xs text-[var(--shield-accent)]">{splatError}</span>}
        </div>
      )}

      {open && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-10 backdrop-blur-sm">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[var(--shield-bg)] p-8">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-black" style={{ color: SUBJECTS[open].hue }}>
                {SUBJECTS[open].icon} {SUBJECTS[open].label}
              </h3>
              <button
                onClick={() => setOpen(null)}
                className="rounded-lg border border-white/20 px-3 py-1 text-sm text-white/70 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            {(() => {
              const items = shield.artifacts.filter((a) => a.subject === open)
              return items.length === 0 ? (
                <EmptyState note={`Nothing on the ${SUBJECTS[open].label} island yet.`} />
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {items.map((a) => (
                    <ArtifactCard key={a.id} artifact={a} />
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
