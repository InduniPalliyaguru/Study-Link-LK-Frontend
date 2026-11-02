import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { loadCatalog } from "../features/catalog/catalogSlice"
import ImagePicker from "../components/ImagePicker"
import { DISTRICTS } from "../utils/constants"
import { getErrorMessage } from "../utils/errors"
import { inputClass } from "../utils/styles"
import type { ApiResponse, AssistResult, CoverScanResult } from "../types/api"
import { formatPrice } from "../utils/format"
import { typeText } from "../utils/typing"

const emptyForm = {
  title: "",
  description: "",
  price: "",
  isFree: false,
  condition: "",
  district: "",
  subject: "",
  gradeLevel: "",
  deliveryOptions: "both",
}

const deliveryChoices = [
  { value: "both", label: "Meet-up or courier" },
  { value: "meetup", label: "Meet-up only" },
  { value: "courier", label: "Courier only" },
]

export default function Sell() {
  const dispatch = useAppDispatch()
  const { subjects, gradeLevels, loaded } = useAppSelector(
    (state) => state.catalog,
  )

  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [notes, setNotes] = useState("")
  const [assisting, setAssisting] = useState(false)
  const [assist, setAssist] = useState<AssistResult | null>(null)
  const [assistError, setAssistError] = useState("")
  const [aiUsed, setAiUsed] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState({ text: "", ok: true })

  const canAssist =
    form.title.trim().length >= 3 &&
    !!form.subject &&
    !!form.gradeLevel &&
    !!form.condition

  useEffect(() => {
    if (!loaded) {
      dispatch(loadCatalog())
    }
  }, [dispatch, loaded])

  const update = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const runAssist = async () => {
    setAssistError("")
    setAssist(null)
    setAssisting(true)

    try {
      const response = await api.post<ApiResponse<AssistResult>>(
        "/ai/listing-assist",
        {
          name: form.title.trim(),
          subject: form.subject,
          gradeLevel: form.gradeLevel,
          condition: form.condition,
          notes: notes.trim() || undefined,
        },
      )

      const result = response.data.data

      setAssist(result)
      setAiUsed(true)
      setAssisting(false)

      await typeText(result.title, (value) => update("title", value))
      await typeText(result.description, (value) =>
        update("description", value),
      )
    } catch (err) {
      setAssistError(getErrorMessage(err))
      setAssisting(false)
    }
  }

  const scanCover = async () => {
    if (files.length === 0) {
      return
    }

    setScanMessage({ text: "", ok: true })
    setScanning(true)

    try {
      const body = new FormData()
      body.append("image", files[0])

      const response = await api.post<ApiResponse<CoverScanResult>>(
        "/ai/scan-cover",
        body,
      )
      const result = response.data.data

      setAiUsed(true)
      setScanning(false)

      if (result.subject) update("subject", result.subject)
      if (result.gradeLevel) update("gradeLevel", result.gradeLevel)
      if (result.title) {
        await typeText(result.title, (value) => update("title", value))
      }

      const found = [
        result.title && "title",
        result.subject && "subject",
        result.gradeLevel && "grade level",
      ].filter(Boolean)

      setScanMessage({
        text: found.length
          ? `Found the ${found.join(", ")}. Please check them and choose the condition.`
          : "I could not read much from this photo. Please fill in the details yourself.",
        ok: found.length > 0,
      })
    } catch (err) {
      setScanMessage({ text: getErrorMessage(err), ok: false })
      setScanning(false)
    }
  }

  const usePrice = () => {
    if (assist?.priceRange) {
      const middle =
        Math.round((assist.priceRange.min + assist.priceRange.max) / 2 / 50) *
        50
      update("isFree", false)
      update("price", String(middle))
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")

    if (files.length === 0) {
      setError("Please add at least one photo of the book")
      return
    }

    const body = new FormData()
    body.append("title", form.title.trim())
    body.append("description", form.description.trim())
    body.append("price", form.isFree ? "0" : form.price)
    body.append("condition", form.condition)
    body.append("district", form.district)
    body.append("subject", form.subject)
    body.append("gradeLevel", form.gradeLevel)
    body.append("deliveryOptions", form.deliveryOptions)
    body.append("aiGenerated", aiUsed ? "true" : "false")
    files.forEach((file) => body.append("images", file))

    setSending(true)

    try {
      await api.post("/listings", body)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const startAgain = () => {
    setForm(emptyForm)
    setFiles([])
    setError("")
    setDone(false)
    setNotes("")
    setAssist(null)
    setAssistError("")
    setAiUsed(false)
    setScanMessage({ text: "", ok: true })
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-line bg-card p-8 text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-3 font-display text-2xl font-bold">
          Listing submitted!
        </h1>
        <p className="mt-2 text-mute">
          An admin will review it soon. Once approved, your book appears on the
          Browse page for other students.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={startAgain}
            className="rounded-xl border border-line px-5 py-2.5 font-semibold hover:bg-bg"
          >
            List another book
          </button>
          <Link
            to="/my-listings"
            className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-5 py-2.5 font-bold text-white"
          >
            My listings
          </Link>
        </div>
      </div>
    )
  }

  const label = "mt-4 mb-1.5 block text-sm font-bold"

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">List a book</h1>
      <p className="mt-1 text-mute">
        Add the details and photos. An admin approves it before it goes live.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-card p-5 backdrop-blur md:p-6"
        >
          <label htmlFor="title" className="mb-1.5 block text-sm font-bold">
            Title
          </label>
          <input
            id="title"
            className={inputClass}
            placeholder="Combined Maths Part I - A/L"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            minLength={5}
            maxLength={120}
            required
          />

          <label htmlFor="description" className={label}>
            Description
          </label>
          <textarea
            id="description"
            className={`${inputClass} min-h-28`}
            placeholder="Condition, what is included, any notes or marks..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            minLength={10}
            maxLength={1500}
            required
          />

          <div className="grid gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="subject" className={label}>
                Subject
              </label>
              <select
                id="subject"
                className={inputClass}
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                required
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="grade" className={label}>
                Grade level
              </label>
              <select
                id="grade"
                className={inputClass}
                value={form.gradeLevel}
                onChange={(e) => update("gradeLevel", e.target.value)}
                required
              >
                <option value="">Select level</option>
                {gradeLevels.map((level) => (
                  <option key={level._id} value={level._id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="condition" className={label}>
                Condition
              </label>
              <select
                id="condition"
                className={inputClass}
                value={form.condition}
                onChange={(e) => update("condition", e.target.value)}
                required
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            <div>
              <label htmlFor="district" className={label}>
                District
              </label>
              <select
                id="district"
                className={inputClass}
                value={form.district}
                onChange={(e) => update("district", e.target.value)}
                required
              >
                <option value="">Select district</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label htmlFor="price" className={label}>
            Price (Rs.)
          </label>
          <div className="flex items-center gap-4">
            <input
              id="price"
              type="number"
              min="0"
              className={`${inputClass} max-w-44 disabled:opacity-50`}
              placeholder="1800"
              value={form.isFree ? "0" : form.price}
              onChange={(e) => update("price", e.target.value)}
              disabled={form.isFree}
              required
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.isFree}
                onChange={(e) => update("isFree", e.target.checked)}
              />
              Give it away for free
            </label>
          </div>

          <span className={label}>How can the buyer get it?</span>
          <div className="flex flex-wrap gap-2">
            {deliveryChoices.map((choice) => (
              <label
                key={choice.value}
                className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  form.deliveryOptions === choice.value
                    ? "border-brand-1 bg-brand-1/20"
                    : "border-line hover:bg-bg"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  className="sr-only"
                  checked={form.deliveryOptions === choice.value}
                  onChange={() => update("deliveryOptions", choice.value)}
                />
                {choice.label}
              </label>
            ))}
          </div>

          <span className={label}>Photos</span>
          <ImagePicker files={files} onChange={setFiles} />

          <p className="mt-3 min-h-5 text-sm text-bad" role="alert">
            {error}
          </p>

          <button
            disabled={sending}
            className="mt-1 rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          >
            {sending ? "Publishing..." : "Publish listing"}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-dashed border-brand-1 bg-brand-1/10 p-5">
            <p className="font-display text-lg font-bold">
              <span className={assisting ? "inline-block animate-spin" : ""}>
                ✦
              </span>{" "}
              AI assistant
            </p>
            <p className="mt-1 text-sm text-mute">
              Type the book name, then choose the subject, grade level and
              condition. The AI writes the title and description and suggests a
              fair price.
            </p>

            <button
              type="button"
              onClick={scanCover}
              disabled={files.length === 0 || scanning}
              className="mt-3 w-full rounded-xl border border-brand-1 py-2.5 font-bold transition hover:bg-brand-1/15 active:scale-95 disabled:opacity-50"
            >
              {scanning ? "Reading the cover..." : "📷 Scan the cover photo"}
            </button>
            {files.length === 0 && (
              <p className="mt-1 text-xs text-mute">
                Add a photo of the cover first, then scan it.
              </p>
            )}
            {scanMessage.text && (
              <p
                className={`mt-2 text-sm ${scanMessage.ok ? "text-ok" : "text-bad"}`}
                role={scanMessage.ok ? "status" : "alert"}
              >
                {scanMessage.text}
              </p>
            )}

            <label
              htmlFor="notes"
              className="mt-3 mb-1.5 block text-sm font-bold"
            >
              Anything special? (optional)
            </label>
            <input
              id="notes"
              className={inputClass}
              placeholder="Has my handwritten notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
            />

            <button
              type="button"
              onClick={runAssist}
              disabled={!canAssist || assisting}
              className="mt-3 w-full rounded-xl bg-linear-to-br from-brand-1 to-brand-2 py-2.5 font-bold text-white transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
            >
              {assisting
                ? "Thinking..."
                : assist
                  ? "Generate again"
                  : "Generate with AI"}
            </button>
            {!canAssist && (
              <p className="mt-2 text-xs text-mute">
                Fill in the title, subject, grade level and condition first.
              </p>
            )}

            {assistError && (
              <p className="mt-2 text-sm text-bad" role="alert">
                {assistError}
              </p>
            )}

            {assist && (
              <div
                className="mt-3 rounded-xl bg-bg/60 p-3 text-sm"
                role="status"
              >
                <p className="font-semibold">
                  {assist.source === "ai"
                    ? "✨ Written by AI. Please check it."
                    : "AI is busy, so a simple template was used. Please edit it."}
                </p>

                {assist.priceRange ? (
                  <>
                    <p className="mt-2">
                      Suggested price:{" "}
                      <b>
                        {formatPrice(assist.priceRange.min)} –{" "}
                        {formatPrice(assist.priceRange.max)}
                      </b>
                    </p>
                    <p className="text-xs text-mute">
                      Based on {assist.basedOn} similar book(s) on StudyLink.
                    </p>
                    <button
                      type="button"
                      onClick={usePrice}
                      className="mt-2 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-card"
                    >
                      Use this price
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-mute">
                    No similar books yet, so please set your own price.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 text-sm text-mute">
            <p className="font-display text-base font-bold text-ink">
              Tips for a quick sale
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Take clear photos of the cover and a few pages.</li>
              <li>Be honest about the condition.</li>
              <li>
                Price it fairly. Used books usually sell for about half the new
                price.
              </li>
              <li>
                Your phone number stays private until you accept a request.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
