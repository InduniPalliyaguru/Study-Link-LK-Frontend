import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { api } from "../services/api"
import { REPORT_REASONS } from "../utils/constants"
import { getErrorMessage } from "../utils/errors"
import { inputClass } from "../utils/styles"

interface ReportDialogProps {
  listingId: string
  title: string
  onClose: () => void
}

export default function ReportDialog({
  listingId,
  title,
  onClose,
}: ReportDialogProps) {
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setSending(true)

    try {
      await api.post("/reports", {
        listing: listingId,
        reason,
        details: details.trim() || undefined,
      })
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Report listing"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-line bg-bg p-6 shadow-2xl"
      >
        {done ? (
          <div className="text-center">
            <p className="text-4xl">🛡️</p>
            <h2 className="mt-2 font-display text-xl font-bold">Thank you!</h2>
            <p className="mt-1 text-sm text-mute">
              An admin will look at this listing. You help keep StudyLink safe.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-6 py-2.5 font-bold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 className="font-display text-xl font-bold">
              Report this listing
            </h2>
            <p className="mt-1 text-sm text-mute">“{title}”</p>

            <label
              htmlFor="reason"
              className="mt-4 mb-1.5 block text-sm font-bold"
            >
              What is wrong?
            </label>
            <select
              id="reason"
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <label
              htmlFor="details"
              className="mt-4 mb-1.5 block text-sm font-bold"
            >
              More details (optional)
            </label>
            <textarea
              id="details"
              className={`${inputClass} min-h-24`}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={300}
            />

            <p className="mt-2 min-h-5 text-sm text-bad" role="alert">
              {error}
            </p>

            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line px-5 py-2.5 font-semibold hover:bg-card"
              >
                Cancel
              </button>
              <button
                disabled={sending}
                className="rounded-xl bg-bad px-6 py-2.5 font-bold text-white hover:brightness-110 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
