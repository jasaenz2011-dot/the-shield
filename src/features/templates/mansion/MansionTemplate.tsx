import { useState } from 'react'
import type { TemplateProps } from '../types'
import { ROOMS, roomById, type RoomPreset } from './rooms'
import { ArtifactCard, EmptyState } from '../shared'

// Multi-room mansion: each subject is a themed room; doors zoom you through.
// Transitions are opacity + scale only, so they composite at 60fps on iGPU.

const TRANSITION_MS = 480

interface MansionData {
  room: string
}

export function MansionTemplate({ shield, presentMode, onDataChange }: TemplateProps) {
  const saved = (shield.templateData['mansion'] as MansionData | undefined)?.room
  const [roomId, setRoomId] = useState(saved ?? 'hall')
  const [phase, setPhase] = useState<'in' | 'out'>('in')
  const [pending, setPending] = useState<string | null>(null)

  const room = roomById(roomId)

  const goTo = (id: string) => {
    if (id === roomId || pending) return
    setPending(id)
    setPhase('out')
    window.setTimeout(() => {
      setRoomId(id)
      setPending(null)
      setPhase('in')
      onDataChange({ room: id })
    }, TRANSITION_MS)
  }

  const artifacts = room.subject
    ? shield.artifacts.filter((a) => a.subject === room.subject)
    : shield.artifacts

  return (
    <div
      className="relative h-full overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${room.wallB} 0%, ${room.wallA} 62%, ${room.floor} 62.5%, #000 130%)`,
        transition: `background ${TRANSITION_MS}ms ease`
      }}
    >
      {/* room lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(700px 340px at 50% 8%, color-mix(in srgb, ${room.accent} 22%, transparent), transparent)`
        }}
      />

      <div
        className="flex h-full flex-col"
        style={{
          transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
          opacity: phase === 'out' ? 0 : 1,
          transform: phase === 'out' ? 'scale(1.12)' : 'scale(1)'
        }}
      >
        <header className="flex items-center justify-center gap-3 pt-10">
          <span className="text-3xl" style={{ color: room.accent }}>
            {room.icon}
          </span>
          <h2 className="text-4xl font-black tracking-tight">{room.name}</h2>
        </header>

        {/* gallery wall */}
        <div className="flex-1 overflow-y-auto px-14 py-8">
          {artifacts.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                note={
                  room.subject
                    ? `Nothing on the ${room.name} walls yet.`
                    : 'Your mansion is ready. Fill its rooms with your year.'
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {artifacts.map((a) => (
                <ArtifactCard key={a.id} artifact={a} />
              ))}
            </div>
          )}
        </div>

        {/* doors */}
        <nav
          className="flex items-end justify-center gap-4 px-6 pb-6"
          aria-label="Mansion rooms"
        >
          {ROOMS.filter((r) => r.id !== roomId).map((r) => (
            <Door key={r.id} room={r} onEnter={() => goTo(r.id)} large={!presentMode} />
          ))}
        </nav>
      </div>
    </div>
  )
}

function Door({
  room,
  onEnter,
  large
}: {
  room: RoomPreset
  onEnter: () => void
  large: boolean
}) {
  return (
    <button
      onClick={onEnter}
      className="group flex flex-col items-center gap-1.5 focus:outline-none"
      aria-label={`Enter ${room.name}`}
    >
      <span
        className={`flex ${large ? 'h-24 w-16' : 'h-20 w-14'} items-end justify-center rounded-t-[2rem] border-2 pb-2 text-2xl transition duration-300 group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5`}
        style={{
          borderColor: `color-mix(in srgb, ${room.accent} 65%, transparent)`,
          background: `linear-gradient(180deg, ${room.wallB}, ${room.wallA})`,
          boxShadow: `0 0 0 0 transparent`,
          color: room.accent
        }}
      >
        {room.icon}
      </span>
      <span className="text-[11px] font-semibold tracking-wide text-white/50 transition group-hover:text-white/90">
        {room.name}
      </span>
    </button>
  )
}
