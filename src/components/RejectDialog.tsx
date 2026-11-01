import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { inputClass } from "../utils/styles"

interface RejectDialogProps {
  title: string
  onCancel: () => void
  onConfirm: (reason: string) => void
}

const quickReasons = [
  "The photos are not clear",
  "The price looks wrong",
  "The subject or grade is wrong",
  "The description is not enough",
]

export default function RejectDialog({
  title,
  onCancel,
  onConfirm,
}: RejectDialogProps) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onCancel])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onConfirm(reason.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Reject listing"
      onClick={onCancel}
    >
      <form
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-line bg-bg p-6 shadow-2xl"
      >
        <h2 className="font-display text-xl font-bold">Reject this listing?</h2>
        <p className="mt-1 text-sm text-mute">
          “{title}”. The seller will see your reason and can edit and resubmit.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickReasons.map((text) => (
            <button
              type="button"
              key={text}
              onClick={() => setReason(text)}
              className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:bg-card"
            >
              {text}
            </button>
          ))}
        </div>

        <label htmlFor="reason" className="mt-4 mb-1.5 block text-sm font-bold">
          Reason
        </label>
        <textarea
          id="reason"
          className={`${inputClass} min-h-24`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          minLength={5}
          maxLength={200}
          required
          autoFocus
        />

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-5 py-2.5 font-semibold hover:bg-card"
          >
            Cancel
          </button>
          <button className="rounded-xl bg-bad px-6 py-2.5 font-bold text-white hover:brightness-110">
            Reject listing
          </button>
        </div>
      </form>
    </div>
  )
}
