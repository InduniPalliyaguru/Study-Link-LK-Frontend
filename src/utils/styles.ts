export const inputClass =
  "w-full rounded-xl border border-line bg-card px-4 py-3 text-ink outline-none transition focus:border-brand-1 focus:ring-4 focus:ring-brand-1/25"

export const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-linear-to-br from-brand-1 to-brand-2 text-white shadow-lg"
      : "text-mute hover:bg-card hover:text-ink"
  }`
