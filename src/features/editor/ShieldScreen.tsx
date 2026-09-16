import { useEffect, useState } from 'react'
import { useAppStore } from '../../app/store/appStore'
import { useShieldStore } from '../../app/store/shieldStore'
import { templateById } from '../templates/registry'
import { TemplateChooser } from './TemplateChooser'
import { IngestPanel } from '../ingest/IngestPanel'
import { OrganizeDrawer } from '../ingest/OrganizeDrawer'
import { exportShield } from '../export/exporter'
import { MuteButton } from '../sound/MuteButton'

// Post-PRESS-START surface: template chooser when none is set; otherwise the
// active template inside editor chrome. Present mode hides all chrome.
export function ShieldScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const { current, updateCurrent } = useShieldStore()
  const [choosing, setChoosing] = useState(false)
  const [presentMode, setPresentMode] = useState(false)
  const [organizing, setOrganizing] = useState(false)
  const [exportNote, setExportNote] = useState<string | null>(null)
  const config = useAppStore((s) => s.config)

  // Leaving OS fullscreen (Esc) also leaves present mode.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setPresentMode(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  if (!current) {
    setScreen('home')
    return null
  }

  const template = templateById(current.template)

  if (!template || choosing) {
    return (
      <TemplateChooser
        switching={choosing && template !== null}
        onPick={(id) => {
          void updateCurrent({ template: id })
          setChoosing(false)
        }}
      />
    )
  }

  const handleDataChange = (data: unknown) => {
    void updateCurrent({ templateData: { ...current.templateData, [template.id]: data } })
  }

  const exitPresent = () => {
    setPresentMode(false)
    if (document.fullscreenElement) void document.exitFullscreen()
  }

  return (
    <div className="flex h-full flex-col">
      {!presentMode && (
        <header className="z-30 flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-2 backdrop-blur-sm">
          <button
            onClick={() => setScreen('character')}
            className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            &larr; Title screen
          </button>
          <span className="ml-2 text-sm font-bold text-white/80">
            {template.icon} {template.name}
          </span>
          <span className="ml-3 text-xs text-white/30" title="Every change writes straight to disk">
            All changes saved
          </span>
          <span className="flex-1" />
          <button
            onClick={() => document.getElementById('ingest-file-input')?.click()}
            className="rounded-lg border border-[var(--shield-primary)]/50 px-3 py-1.5 text-sm font-semibold text-[var(--shield-primary)] transition hover:bg-[var(--shield-primary)]/10"
          >
            + Add work
          </button>
          <button
            onClick={() => setOrganizing(true)}
            className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Organize
          </button>
          <button
            onClick={() => setChoosing(true)}
            className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Change template
          </button>
          <button
            onClick={() => {
              setExportNote('Exporting…')
              void exportShield(current, config).then((r) => {
                setExportNote(
                  r.ok ? `Exported to ${r.dir}` : r.canceled ? null : `Export failed: ${r.error ?? 'unknown error'}`
                )
              })
            }}
            className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Export
          </button>
          <MuteButton />
          <button
            onClick={() => {
              setPresentMode(true)
              void document.documentElement.requestFullscreen().catch(() => {
                // fullscreen can be denied; present mode still hides chrome
              })
            }}
            className="rounded-lg bg-[var(--shield-primary)] px-4 py-1.5 text-sm font-bold text-black transition hover:brightness-110"
          >
            Present
          </button>
        </header>
      )}

      {presentMode && (
        <button
          onClick={exitPresent}
          className="absolute right-3 top-3 z-40 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white/40 backdrop-blur-sm transition hover:text-white"
        >
          Exit (Esc)
        </button>
      )}

      {exportNote && (
        <div className="absolute left-1/2 top-14 z-50 -translate-x-1/2 rounded-full bg-black/80 px-5 py-2 text-sm text-white/90 backdrop-blur-sm">
          {exportNote}
          <button onClick={() => setExportNote(null)} className="ml-3 text-white/40 hover:text-white">
            &times;
          </button>
        </div>
      )}

      <main className="relative min-h-0 flex-1">
        <IngestPanel
          shieldId={current.id}
          onCommit={(added) =>
            void updateCurrent({ artifacts: [...current.artifacts, ...added] })
          }
        >
          <template.Component
            shield={current}
            presentMode={presentMode}
            onDataChange={handleDataChange}
          />
        </IngestPanel>

        {organizing && !presentMode && (
          <OrganizeDrawer
            artifacts={current.artifacts}
            onClose={() => setOrganizing(false)}
            onSave={(artifacts) => {
              void updateCurrent({ artifacts })
              setOrganizing(false)
            }}
          />
        )}
      </main>
    </div>
  )
}
