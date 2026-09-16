import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, Html, OrbitControls } from '@react-three/drei'
import type { TemplateProps } from '../types'
import { SUBJECTS, type Subject } from '../../../types/shield'
import { ArtifactCard, EmptyState } from '../shared'

// Free-roam 3D world stub: one floating island per subject. Deliberately
// light — low-poly primitives, capped dpr, no shadows — so it orbits at 60fps
// on integrated graphics. Splat environments plug in here in Phase 5.

const ISLAND_SUBJECTS = Object.keys(SUBJECTS) as Subject[]

export function WorldTemplate({ shield }: TemplateProps) {
  const [open, setOpen] = useState<Subject | null>(null)

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

        {/* ground disc */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
          <circleGeometry args={[26, 48]} />
          <meshStandardMaterial color="#0b1322" roughness={1} />
        </mesh>

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
