interface PagePlaceholderProps {
  title: string
  description: string
}

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-mute">{description}</p>

      <div className="mt-6 rounded-2xl border border-dashed border-line bg-card p-10 text-center text-mute">
        This page will be built in a later step.
      </div>
    </div>
  )
}
