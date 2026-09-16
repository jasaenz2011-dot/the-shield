import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../app/store/appStore'

const SPLASH_SEEN_KEY = 'shield.splashSeen'

// School branding splash. The slot is blank until an admin drops a video into
// school-config/ and points config.json at it — with no video we go straight home.
export function SplashScreen() {
  const { config, splashVideoUrl, setScreen } = useAppStore()
  const [fading, setFading] = useState(false)
  const doneRef = useRef(false)

  const seenBefore = (() => {
    try {
      return localStorage.getItem(SPLASH_SEEN_KEY) === '1'
    } catch {
      return false
    }
  })()

  const shouldPlay = Boolean(splashVideoUrl) && !(config.splash.skipAfterFirstRun && seenBefore)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    try {
      localStorage.setItem(SPLASH_SEEN_KEY, '1')
    } catch {
      // localStorage unavailable: splash just replays next launch
    }
    setFading(true)
    window.setTimeout(() => setScreen('home'), config.splash.fadeOutMs)
  }

  useEffect(() => {
    if (!shouldPlay) {
      setScreen('home')
      return
    }
    const cap = window.setTimeout(finish, config.splash.maxSeconds * 1000)
    return () => window.clearTimeout(cap)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay])

  if (!shouldPlay) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity"
      style={{ opacity: fading ? 0 : 1, transitionDuration: `${config.splash.fadeOutMs}ms` }}
    >
      <video
        src={splashVideoUrl ?? undefined}
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
        className="h-full w-full object-contain"
      />
      {seenBefore && (
        <button
          onClick={finish}
          className="absolute bottom-8 right-8 rounded-full border border-white/30 px-5 py-2 text-sm text-white/70 transition hover:bg-white/10"
        >
          Skip
        </button>
      )}
    </div>
  )
}
