import type { MouseEvent } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { toggleSaved } from "../features/saved/savedSlice"

interface SaveButtonProps {
  listingId: string
  className?: string
}

export default function SaveButton({
  listingId,
  className = "",
}: SaveButtonProps) {
  const dispatch = useAppDispatch()
  const saved = useAppSelector((state) => state.saved.ids.includes(listingId))

  const handleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    dispatch(toggleSaved(listingId))
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved books" : "Save this book"}
      className={`grid h-9 w-9 place-items-center rounded-full bg-bg/80 text-lg shadow backdrop-blur transition hover:scale-110 ${
        saved ? "text-pink-500" : "text-mute"
      } ${className}`}
    >
      {saved ? "♥" : "♡"}
    </button>
  )
}
