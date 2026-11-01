import { useEffect } from "react"

interface LightboxProps {
  images: string[]
  start: number
  onClose: () => void
}

export default function Lightbox({ images, start, onClose }: LightboxProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
    >
      <div
        className="flex max-h-full max-w-3xl flex-col gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={images[start]}
          alt=""
          className="max-h-[75vh] rounded-2xl object-contain"
        />
        <button
          onClick={onClose}
          className="self-center rounded-xl bg-white/15 px-5 py-2 font-semibold text-white hover:bg-white/25"
        >
          Close
        </button>
      </div>
    </div>
  )
}
