import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { api } from "../services/api"
import type { ApiResponse, MyListing } from "../types/api"
import { getErrorMessage } from "../utils/errors"
import { inputClass } from "../utils/styles"

interface EditListingModalProps {
  listing: MyListing
  onClose: () => void
  onSaved: (updated: MyListing) => void
}

export default function EditListingModal({
  listing,
  onClose,
  onSaved,
}: EditListingModalProps) {
  const [title, setTitle] = useState(listing.title)
  const [description, setDescription] = useState(listing.description)
  const [price, setPrice] = useState(String(listing.price))
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setSaving(true)

    try {
      const response = await api.put<ApiResponse<MyListing>>(
        `/listings/${listing._id}`,
        {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
        },
      )

      onSaved(response.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Edit listing"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-line bg-bg p-6 shadow-2xl"
      >
        <h2 className="font-display text-xl font-bold">Edit listing</h2>
        <p className="mt-1 text-sm text-mute">
          After you save, an admin reviews the listing again before it is
          public.
        </p>

        <label
          htmlFor="edit-title"
          className="mt-4 mb-1.5 block text-sm font-bold"
        >
          Title
        </label>
        <input
          id="edit-title"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          minLength={5}
          maxLength={120}
          required
        />

        <label
          htmlFor="edit-description"
          className="mt-4 mb-1.5 block text-sm font-bold"
        >
          Description
        </label>
        <textarea
          id="edit-description"
          className={`${inputClass} min-h-28`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minLength={10}
          maxLength={1500}
          required
        />

        <label
          htmlFor="edit-price"
          className="mt-4 mb-1.5 block text-sm font-bold"
        >
          Price (Rs.)
        </label>
        <input
          id="edit-price"
          type="number"
          min="0"
          className={`${inputClass} max-w-44`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <p className="mt-3 min-h-5 text-sm text-bad" role="alert">
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
            disabled={saving}
            className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-6 py-2.5 font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
