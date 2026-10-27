import type { Meta } from "../types/api"

interface PaginationProps {
  meta: Meta
  onChange: (page: number) => void
}

export default function Pagination({ meta, onChange }: PaginationProps) {
  if (meta.totalPages <= 1) {
    return null
  }

  const button =
    "rounded-xl border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:bg-brand-1/20 disabled:cursor-not-allowed disabled:opacity-40"

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      <button
        className={button}
        disabled={!meta.hasPrev}
        onClick={() => onChange(meta.page - 1)}
      >
        ← Previous
      </button>
      <span className="text-sm text-mute">
        Page <b className="text-ink">{meta.page}</b> of {meta.totalPages}
      </span>
      <button
        className={button}
        disabled={!meta.hasNext}
        onClick={() => onChange(meta.page + 1)}
      >
        Next →
      </button>
    </nav>
  )
}
