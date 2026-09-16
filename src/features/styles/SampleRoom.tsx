import type { ShieldStyle } from './registry'
import { Stingray } from './Stingray'

// The same generic room rendered per style — the gallery's "looping preview".
// Everything animates via CSS only, so seven of these on screen stay cheap.
export function SampleRoom({ style }: { style: ShieldStyle }) {
  const p = style.preview
  const lively = style.livelyScene
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${p.wallB} 0%, ${p.wallA} 64%, ${p.floor} 64.5%, #000 140%)`,
        filter: style.sceneFilter
      }}
    >
      {/* room glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, ${style.palette.glow} 18%, transparent), transparent)`
        }}
      />
      {/* two framed artworks on the wall */}
      {[22, 58].map((left, i) => (
        <div
          key={left}
          className="absolute"
          style={{
            left: `${left}%`,
            top: '18%',
            width: '20%',
            height: '26%',
            borderRadius: style.chrome.radius,
            border: `${style.chrome.borderWidth} solid ${style.palette.accent}`,
            background: `linear-gradient(135deg, ${style.palette.primary}44, ${style.palette.accent}33)`,
            animation: lively ? `sample-bob 3.2s ease-in-out ${i * 0.6}s infinite` : undefined
          }}
        />
      ))}
      {/* retro scanlines */}
      {style.id === 'retro' && (
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,.55) 2px 4px)'
          }}
        />
      )}
      {/* paper grain for hand-drawn */}
      {style.id === 'sketch' && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'repeating-conic-gradient(rgba(255,255,255,.12) 0% .002%, transparent .004% .01%)'
          }}
        />
      )}
      {/* the mascot glides through every style */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: '52%',
          animation: `sample-swim ${lively ? 5 : 9}s ease-in-out infinite`,
          filter: `drop-shadow(0 0 8px ${style.palette.glow})`
        }}
      >
        <Stingray color={style.palette.primary} size={64} />
      </div>
      <style>{`
        @keyframes sample-swim {
          0% { left: -22%; transform: translateY(0) rotate(-4deg); }
          49.999% { left: 92%; transform: translateY(-12px) rotate(4deg); }
          50% { left: 92%; transform: translateY(-12px) rotate(-4deg) scaleX(-1); }
          100% { left: -22%; transform: translateY(0) rotate(4deg) scaleX(-1); }
        }
        @keyframes sample-bob {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="sample-swim"], [style*="sample-bob"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
