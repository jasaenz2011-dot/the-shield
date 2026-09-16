// The school mascot, as a single reusable SVG so every appearance — style
// previews, Easter egg, future room props — is recognizably the same animal.
export function Stingray({ color, size = 90 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 9) / 14}
      viewBox="0 0 140 90"
      aria-hidden
      style={{ display: 'block' }}
    >
      <path
        d="M10 45 Q 40 8 70 24 Q 100 8 118 40 Q 122 45 118 50 Q 100 82 70 66 Q 40 82 10 45 Z"
        fill={color}
        opacity="0.92"
      />
      <path d="M114 45 Q 138 40 139 45 Q 138 50 114 45 Z" fill={color} opacity="0.7" />
      <circle cx="52" cy="38" r="4" fill="rgba(0,0,0,0.75)" />
      <circle cx="88" cy="38" r="4" fill="rgba(0,0,0,0.75)" />
    </svg>
  )
}
