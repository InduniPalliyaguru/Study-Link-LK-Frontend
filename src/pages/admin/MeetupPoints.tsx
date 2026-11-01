import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { api } from "../../services/api"
import type { ApiResponse, MeetupPoint } from "../../types/api"
import { DISTRICTS } from "../../utils/constants"
import { getErrorMessage } from "../../utils/errors"
import { inputClass } from "../../utils/styles"

const empty = { name: "", district: "", address: "", description: "" }

export default function MeetupPoints() {
  const [points, setPoints] = useState<MeetupPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [districtFilter, setDistrictFilter] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState("")

  const load = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<MeetupPoint[]>>(
        "/admin/meetup-points",
        {
          params: { district: districtFilter || undefined },
        },
      )

      setPoints(response.data.data)
      setError("")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [districtFilter])

  useEffect(() => {
    load()
  }, [load])

  const update = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const reset = () => {
    setForm(empty)
    setEditingId("")
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setNotice("")

    const body = {
      name: form.name.trim(),
      district: form.district,
      address: form.address.trim(),
      description: form.description.trim(),
    }

    try {
      if (editingId) {
        await api.put(`/admin/meetup-points/${editingId}`, body)
        setNotice("Meet-up point updated")
      } else {
        await api.post("/admin/meetup-points", {
          ...body,
          address: body.address || undefined,
          description: body.description || undefined,
        })
        setNotice("Meet-up point added")
      }

      reset()
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const startEdit = (point: MeetupPoint) => {
    setEditingId(point._id)
    setForm({
      name: point.name,
      district: point.district,
      address: point.address ?? "",
      description: point.description ?? "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggle = async (point: MeetupPoint) => {
    setError("")
    setNotice("")

    try {
      await api.put(`/admin/meetup-points/${point._id}`, {
        isActive: !point.isActive,
      })
      setNotice(
        point.isActive
          ? `${point.name} was deactivated`
          : `${point.name} is active again`,
      )
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const label = "mt-3 mb-1.5 block text-sm font-bold"

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Safe meet-up points</h1>
      <p className="mt-1 text-mute">
        Public places where students can safely hand over books
      </p>

      {notice && (
        <p
          className="mt-4 rounded-xl bg-ok/15 px-4 py-2.5 text-sm font-semibold text-ok"
          role="status"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          className="mt-4 rounded-xl bg-bad/15 px-4 py-2.5 text-sm font-semibold text-bad"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <form
          onSubmit={submit}
          className="h-fit rounded-2xl border border-line bg-card p-5 backdrop-blur md:p-6"
        >
          <h2 className="font-display text-lg font-bold">
            {editingId ? "Edit meet-up point" : "Add a meet-up point"}
          </h2>

          <label htmlFor="mp-name" className={label}>
            Name
          </label>
          <input
            id="mp-name"
            className={inputClass}
            placeholder="Galle Public Library"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            minLength={3}
            maxLength={80}
            required
          />

          <label htmlFor="mp-district" className={label}>
            District
          </label>
          <select
            id="mp-district"
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

          <label htmlFor="mp-address" className={label}>
            Address (optional)
          </label>
          <input
            id="mp-address"
            className={inputClass}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            maxLength={150}
          />

          <label htmlFor="mp-description" className={label}>
            Why is it safe? (optional)
          </label>
          <input
            id="mp-description"
            className={inputClass}
            placeholder="Busy public place, easy to find"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            maxLength={200}
          />

          <div className="mt-5 flex gap-2">
            <button className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-6 py-2.5 font-bold text-white transition hover:-translate-y-0.5 active:scale-95">
              {editingId ? "Save changes" : "Add point"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-line px-5 py-2.5 font-semibold hover:bg-bg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm text-mute">
              {points.length} meet-up point(s)
            </p>
            <select
              className="rounded-xl border border-line bg-card px-3 py-2 text-sm text-ink"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              aria-label="Filter by district"
            >
              <option value="">All districts</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {loading && (
              <div className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
            )}

            {!loading && points.length === 0 && (
              <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
                No meet-up points yet. Add the first one.
              </div>
            )}

            {points.map((point) => (
              <article
                key={point._id}
                className={`flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-4 backdrop-blur ${point.isActive ? "" : "opacity-55"}`}
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-xl bg-ok/15 text-xl"
                  aria-hidden="true"
                >
                  📍
                </span>

                <div className="min-w-48 flex-1">
                  <p className="font-bold">
                    {point.name}
                    {!point.isActive && (
                      <span className="ml-2 text-xs font-bold text-bad">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-mute">
                    {point.district}
                    {point.address ? ` · ${point.address}` : ""}
                  </p>
                  {point.description && (
                    <p className="mt-0.5 text-xs text-mute">
                      {point.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(point)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-bg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggle(point)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      point.isActive
                        ? "border-bad/60 text-bad hover:bg-bad/10"
                        : "border-ok/60 text-ok hover:bg-ok/10"
                    }`}
                  >
                    {point.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
