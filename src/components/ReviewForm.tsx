import { useState } from "react"
import type { FormEvent } from "react"
import { api } from "../services/api"
import { getErrorMessage } from "../utils/errors"
import { inputClass } from "../utils/styles"

interface ReviewFormProps {
  requestId: string
}

export default function ReviewForm({ requestId }: ReviewFormProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [message, setMessage] = useState("")
  const [done, setDone] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage("")

    try {
      await api.post("/reviews", {
        request: requestId,
        rating,
        comment: comment.trim() || undefined,
      })
      setDone(true)
    } catch (err) {
      setMessage(getErrorMessage(err))
    }
  }

  if (done) {
    return (
      <p className="mt-3 text-sm font-semibold text-ok">
        Thank you for your review!
      </p>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-bg"
      >
        ★ Rate the seller
      </button>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 rounded-xl border border-line bg-bg/60 p-4"
    >
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => setRating(star)}
            className={`text-2xl transition hover:scale-125 ${star <= rating ? "text-accent" : "text-mute"}`}
          >
            ★
          </button>
        ))}
      </div>

      <input
        className={`${inputClass} mt-2`}
        placeholder="Say something about the seller (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={300}
        aria-label="Comment"
      />

      <p className="mt-2 min-h-5 text-sm text-bad" role="alert">
        {message}
      </p>

      <button className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-5 py-2 text-sm font-bold text-white">
        Submit review
      </button>
    </form>
  )
}
