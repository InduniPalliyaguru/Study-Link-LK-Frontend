export default function BookArt() {
  return (
    <svg
      viewBox="0 0 220 150"
      aria-hidden="true"
      className="animate-float w-full max-w-60"
    >
      <rect x="24" y="100" width="170" height="28" rx="6" fill="var(--s0)" />
      <rect x="38" y="70" width="146" height="28" rx="6" fill="var(--s1)" />
      <rect x="28" y="40" width="160" height="28" rx="6" fill="var(--s2)" />
      <g transform="rotate(-12 150 26)">
        <rect x="128" y="0" width="46" height="62" rx="5" fill="var(--s4)" />
      </g>
      <path d="M186 40v28l7-7 7 7V40z" fill="var(--acc)" />
    </svg>
  )
}
