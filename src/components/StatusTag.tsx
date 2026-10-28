const styles: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  available: "bg-ok/20 text-ok",
  reserved: "bg-brand-2/20 text-brand-2",
  sold: "bg-brand-1/25 text-brand-1",
  rejected: "bg-bad/20 text-bad",
  removed: "bg-bad/20 text-bad",
  accepted: "bg-brand-2/20 text-brand-2",
  shipped: "bg-brand-2/20 text-brand-2",
  completed: "bg-ok/20 text-ok",
  cancelled: "bg-mute/20 text-mute",
}

interface StatusTagProps {
  status: string
}

export default function StatusTag({ status }: StatusTagProps) {
  const style = styles[status] ?? "bg-mute/20 text-mute"

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${style}`}
    >
      {status}
    </span>
  )
}
