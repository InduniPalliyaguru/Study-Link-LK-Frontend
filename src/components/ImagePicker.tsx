import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent } from "react"

const MAX_FILES = 4
const MAX_SIZE = 5 * 1024 * 1024
const TYPES = ["image/jpeg", "image/png", "image/webp"]

interface ImagePickerProps {
  files: File[]
  onChange: (files: File[]) => void
}

export default function ImagePicker({ files, onChange }: ImagePickerProps) {
  const [message, setMessage] = useState("")

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  )

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? [])
    event.target.value = ""

    const valid: File[] = []
    let problem = ""

    for (const file of chosen) {
      if (!TYPES.includes(file.type)) {
        problem = "Only JPG, PNG or WEBP images are allowed"
      } else if (file.size > MAX_SIZE) {
        problem = "Each image must be 5MB or smaller"
      } else {
        valid.push(file)
      }
    }

    const next = [...files, ...valid]

    if (next.length > MAX_FILES) {
      problem = `You can add at most ${MAX_FILES} photos`
    }

    setMessage(problem)
    onChange(next.slice(0, MAX_FILES))
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
              <span className="block text-2xl">＋</span>
              Add photo
            </span>
            <input
              type="file"
              accept={TYPES.join(",")}
              multiple
              className="sr-only"
              onChange={handleSelect}
            />
          </label>
        )}
      </div>

      <p className="mt-2 text-xs text-mute">
        Up to {MAX_FILES} photos, JPG, PNG or WEBP, 5MB each.
      </p>
      {message && (
        <p className="mt-1 text-sm text-bad" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
