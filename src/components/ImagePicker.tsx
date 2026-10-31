import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import { compressImage } from "../utils/image"

const MAX_FILES = 4
const MAX_ORIGINAL_SIZE = 15 * 1024 * 1024
const MAX_TOTAL_SIZE = 4 * 1024 * 1024
const TYPES = ["image/jpeg", "image/png", "image/webp"]

interface ImagePickerProps {
  files: File[]
  onChange: (files: File[]) => void
}

export default function ImagePicker({ files, onChange }: ImagePickerProps) {
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  )

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = ""

    const valid: File[] = []
    let problem = ""

    for (const file of chosen) {
      if (!TYPES.includes(file.type)) {
        problem = "Only JPG, PNG or WEBP images are allowed"
      } else if (file.size > MAX_ORIGINAL_SIZE) {
        problem = "Each photo must be 15MB or smaller"
      } else {
        valid.push(file)
      }
    }

    if (files.length + valid.length > MAX_FILES) {
      problem = `You can add at most ${MAX_FILES} photos`
    }

    setBusy(true)

    try {
      const room = valid.slice(0, MAX_FILES - files.length)
      const compressed = await Promise.all(
        room.map((file) => compressImage(file)),
      )
      const next = [...files, ...compressed]
      const total = next.reduce((sum, file) => sum + file.size, 0)

      if (total > MAX_TOTAL_SIZE) {
        setMessage(
          "These photos are too large together. Please choose fewer or smaller photos",
        )
        return
      }

      setMessage(problem)
      onChange(next)
    } catch {
      setMessage("Could not read that photo. Please try another one")
    } finally {
      setBusy(false)
    }
  }

  const remove = (index: number) => {
    setMessage("")
    onChange(files.filter((_, position) => position !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {previews.map((url, index) => (
          <div
            key={url}
            className="relative h-24 w-24 overflow-hidden rounded-xl border border-line"
          >
            <img
              src={url}
              alt={`Selected photo ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-white hover:bg-bad"
            >
              ✕
            </button>
          </div>
        ))}

        {files.length < MAX_FILES && (
          <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-center text-xs text-mute transition hover:border-brand-1 hover:text-ink">
            <span>
              <span className="block text-2xl">{busy ? "…" : "＋"}</span>
              {busy ? "Preparing" : "Add photo"}
            </span>
            <input
              type="file"
              accept={TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={handleSelect}
              disabled={busy}
            />
          </label>
        )}
      </div>

      <p className="mt-2 text-xs text-mute">
        Up to {MAX_FILES} photos (JPG, PNG or WEBP). Large photos are made
        smaller automatically.
      </p>
      {message && (
        <p className="mt-1 text-sm text-bad" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
