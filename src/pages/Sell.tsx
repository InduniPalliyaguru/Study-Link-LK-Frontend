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

  useEffect(() => {
    if (!loaded) {
      dispatch(loadCatalog())
    }
  }, [dispatch, loaded])

  const update = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
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
            <p className="font-display text-lg font-bold">✦ AI assistant</p>
            <p className="mt-1 text-sm text-mute">
              Soon it will write your title and description, and suggest a fair
              price from the book details.
            </p>
            <button
              disabled
              className="mt-3 rounded-xl border border-line px-4 py-2 text-sm font-semibold opacity-60"
            >
              Coming soon
            </button>
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
