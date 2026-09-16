import { useState } from 'react'
import { useAppStore } from '../../app/store/appStore'
import { useShieldStore } from '../../app/store/shieldStore'
import type { CharacterConfig } from '../../types/shield'
import { CharacterSetup } from './CharacterSetup'
import { IdleRig } from './idle-animation/IdleRig'
import { NameText3D } from './NameText3D'
import { YearBadge } from './YearBadge'
import { MontageBackground } from './MontageBackground'
import { PressStart } from './PressStart'

// THE LOCKED FEATURE: every shield opens on this screen.
export function CharacterSelectScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { current, updateCurrent } = useShieldStore()
  const [editing, setEditing] = useState(false)

  if (!current) {
    setScreen('home')
    return null
  }

  const handleSetupDone = (character: CharacterConfig) => {
    void updateCurrent({ character })
    setEditing(false)
  }

  const character = current.character

  return (
    <div className="relative h-full overflow-hidden">
      <MontageBackground urls={character?.montageUrls ?? []} />

      {!character || editing ? (
        <CharacterSetup shieldId={current.id} initial={character} onDone={handleSetupDone} />
      ) : (
        <div className="relative z-10 flex h-full flex-col items-center">
          {/* 3D extruded name floats in front of / above the character */}
          <div className="pointer-events-none absolute inset-x-0 top-6 z-20 h-40">
            <NameText3D name={current.studentName} />
          </div>

          {/* Character layer */}
          <div className="absolute inset-x-0 bottom-0 top-36 flex items-end justify-center">
            <IdleRig vibe={character.vibe}>
              <img
                src={character.cutoutUrl}
                alt={current.studentName}
                className="max-h-[62vh] object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]"
              />
            </IdleRig>
          </div>

          {/* Badge + start */}
          <div className="absolute inset-x-0 bottom-10 z-20 flex flex-col items-center gap-6">
            <YearBadge />
            <PressStart onStart={() => setScreen('shield')} />
          </div>

          <div className="absolute right-4 top-4 z-30 flex gap-2">
            <button
              onClick={() => setScreen('home')}
              className="rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white/60 backdrop-blur-sm transition hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white/60 backdrop-blur-sm transition hover:text-white"
            >
              Edit character
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
