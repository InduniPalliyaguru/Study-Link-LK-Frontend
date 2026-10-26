const books = [
  { left: "6%", size: 46, delay: "0s", duration: "22s", color: "var(--s0)" },
  { left: "18%", size: 30, delay: "6s", duration: "26s", color: "var(--s1)" },
  { left: "30%", size: 56, delay: "12s", duration: "30s", color: "var(--s2)" },
  { left: "46%", size: 34, delay: "3s", duration: "24s", color: "var(--s4)" },
  { left: "60%", size: 50, delay: "9s", duration: "28s", color: "var(--s5)" },
  { left: "74%", size: 32, delay: "15s", duration: "25s", color: "var(--s3)" },
  { left: "86%", size: 44, delay: "5s", duration: "27s", color: "var(--s6)" },
  { left: "94%", size: 28, delay: "11s", duration: "23s", color: "var(--s1)" },
]

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="blob -left-[15vmax] -top-[18vmax]"
        style={{
          background: "radial-gradient(circle, var(--b1), transparent 65%)",
        }}
      />
      <div
        className="blob -bottom-[18vmax] -right-[16vmax]"
        style={{
          background: "radial-gradient(circle, var(--b2), transparent 65%)",
        }}
      />
      <div className="grid-dots absolute inset-0" />

      {books.map((book, index) => (
        <svg
          key={index}
          viewBox="0 0 44 60"
          className="float-book"
          style={{
            left: book.left,
            width: book.size,
            animationDelay: book.delay,
            animationDuration: book.duration,
          }}
        >
          <rect width="44" height="60" rx="4" fill={book.color} />
          <rect width="7" height="60" rx="3" fill="#000" opacity="0.2" />
          <rect
            x="14"
            y="10"
            width="22"
            height="3"
            rx="1.5"
            fill="#fff"
            opacity="0.8"
          />
          <rect
            x="14"
            y="17"
            width="15"
            height="3"
            rx="1.5"
            fill="#fff"
            opacity="0.5"
          />
        </svg>
      ))}
    </div>
  )
}
