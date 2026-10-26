interface BookCoverProps {
  colorKey: number
  width?: number
}

export default function BookCover({ colorKey, width = 60 }: BookCoverProps) {
  const color = `var(--s${colorKey})`
  const id = `cover-${colorKey}`

  return (
    <svg
      viewBox="0 0 44 60"
      width={width}
      height={(width * 60) / 44}
      aria-hidden="true"
      className="drop-shadow-xl transition duration-500 group-hover:-rotate-3 group-hover:scale-110"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      <rect width="44" height="60" rx="4" fill={`url(#${id})`} />
      <rect width="7" height="60" rx="3" fill="#000" opacity="0.2" />
      <rect
        x="14"
        y="10"
        width="22"
        height="3"
        rx="1.5"
        fill="#fff"
        opacity="0.9"
      />
      <rect
        x="14"
        y="17"
        width="15"
        height="3"
        rx="1.5"
        fill="#fff"
        opacity="0.6"
      />
      <circle cx="27" cy="42" r="9" fill="#fff" opacity="0.2" />
      <path
        d="M27 35v14M20 42h14"
        stroke="#fff"
        strokeWidth="2"
        opacity="0.8"
      />
    </svg>
  )
}
