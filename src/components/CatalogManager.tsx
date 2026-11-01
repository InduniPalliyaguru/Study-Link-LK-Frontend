import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { api } from "../services/api"
import type { ApiResponse } from "../types/api"
import { getErrorMessage } from "../utils/errors"
import { inputClass } from "../utils/styles"

interface CatalogItem {
  _id: string
  name: string
  isActive: boolean
  colorKey?: number
  description?: string
}

interface CatalogManagerProps {
  title: string
  hint: string
  endpoint: "subjects" | "grade-levels"
}

const COLORS = [0, 1, 2, 3, 4, 5, 6]

export default function CatalogManager({
  title,
  hint,
  endpoint,
}: CatalogManagerProps) {
  const isSubject = endpoint === "subjects"

  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const [name, setName] = useState("")
  const [extra, setExtra] = useState("")
  const [color, setColor] = useState(0)

  const [editingId, setEditingId] = useState("")
  const [editName, setEditName] = useState("")
  const [editExtra, setEditExtra] = useState("")
  const [editColor, setEditColor] = useState(0)

  const load = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<CatalogItem[]>>(
        `/admin/${endpoint}`,
      )
      setItems(response.data.data)
      setError("")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    load()
  }, [load])

  const run = async (task: () => Promise<void>, success: string) => {
    setError("")
    setNotice("")

    try {
      await task()
      setNotice(success)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const create = async (event: FormEvent) => {
    event.preventDefault()

    await run(async () => {
      const body = isSubject
        ? { name: name.trim(), colorKey: color }
        : {
            name: name.trim(),
            ...(extra.trim() && { description: extra.trim() }),
          }

      await api.post(`/admin/${endpoint}`, body)
      setName("")
      setExtra("")
    }, `${name.trim()} was added`)
  }

  const startEdit = (item: CatalogItem) => {
    setEditingId(item._id)
    setEditName(item.name)
    setEditExtra(item.description ?? "")
    setEditColor(item.colorKey ?? 0)
  }

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault()

    await run(async () => {
      const body = isSubject
        ? { name: editName.trim(), colorKey: editColor }
        : { name: editName.trim(), description: editExtra.trim() }

      await api.put(`/admin/${endpoint}/${editingId}`, body)
      setEditingId("")
    }, "Saved")
  }

  const toggle = (item: CatalogItem) =>
    run(
      async () => {
        await api.put(`/admin/${endpoint}/${item._id}`, {
          isActive: !item.isActive,
        })
      },
      item.isActive
        ? `${item.name} was deactivated and is hidden from students`
        : `${item.name} is active again`,
    )

  return (
    <section className="rounded-2xl border border-line bg-card p-5 backdrop-blur md:p-6">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <p className="text-sm text-mute">{hint}</p>

      {notice && (
        <p
          className="mt-3 rounded-xl bg-ok/15 px-4 py-2 text-sm font-semibold text-ok"
          role="status"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          className="mt-3 rounded-xl bg-bad/15 px-4 py-2 text-sm font-semibold text-bad"
          role="alert"
        >
          {error}
        </p>
      )}

      <ul className="mt-4 divide-y divide-line">
        {loading && <li className="h-12 animate-pulse rounded bg-bg/60" />}

        {items.map((item) =>
          editingId === item._id ? (
            <li key={item._id} className="py-3">
              <form onSubmit={saveEdit} className="space-y-2">
                <input
                  className={inputClass}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  minLength={2}
                  maxLength={isSubject ? 50 : 30}
                  aria-label="Name"
                  required
                />
                {isSubject ? (
                  <ColorPicker value={editColor} onChange={setEditColor} />
                ) : (
                  <input
                    className={inputClass}
                    value={editExtra}
                    onChange={(e) => setEditExtra(e.target.value)}
                    maxLength={100}
                    placeholder="Description (for example Grade 12-13)"
                    aria-label="Description"
                  />
                )}
                <div className="flex gap-2">
                  <button className="rounded-lg bg-linear-to-br from-brand-1 to-brand-2 px-4 py-1.5 text-sm font-bold text-white">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId("")}
                    className="rounded-lg border border-line px-4 py-1.5 text-sm font-semibold hover:bg-bg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </li>
          ) : (
            <li
              key={item._id}
              className={`flex items-center gap-3 py-3 ${item.isActive ? "" : "opacity-55"}`}
            >
              {isSubject ? (
                <span
                  className="h-5 w-5 shrink-0 rounded-md"
                  style={{ background: `var(--s${item.colorKey ?? 0})` }}
                />
              ) : (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-1/20 text-sm font-bold">
                  {item.name[0]}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {item.name}
                  {!item.isActive && (
                    <span className="ml-2 text-xs font-bold text-bad">
                      Inactive
                    </span>
                  )}
                </p>
                {item.description && (
                  <p className="truncate text-xs text-mute">
                    {item.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => startEdit(item)}
                className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-bg"
              >
                Edit
              </button>
              <button
                onClick={() => toggle(item)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  item.isActive
                    ? "border-bad/60 text-bad hover:bg-bad/10"
                    : "border-ok/60 text-ok hover:bg-ok/10"
                }`}
              >
                {item.isActive ? "Deactivate" : "Activate"}
              </button>
            </li>
          ),
        )}
      </ul>

      <form
        onSubmit={create}
        className="mt-4 space-y-2 border-t border-line pt-4"
      >
        <p className="text-sm font-bold">Add new</p>
        <input
          className={inputClass}
          placeholder={isSubject ? "Subject name" : "Grade level name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={isSubject ? 50 : 30}
          aria-label="New name"
          required
        />
        {isSubject ? (
          <ColorPicker value={color} onChange={setColor} />
        ) : (
          <input
            className={inputClass}
            placeholder="Description (optional)"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            maxLength={100}
            aria-label="New description"
          />
        )}
        <button className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-6 py-2 font-bold text-white transition hover:-translate-y-0.5 active:scale-95">
          Add
        </button>
      </form>
    </section>
  )
}

interface ColorPickerProps {
  value: number
  onChange: (value: number) => void
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="radiogroup"
      aria-label="Book colour"
    >
      <span className="text-xs text-mute">Colour</span>
      {COLORS.map((index) => (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={value === index}
          aria-label={`Colour ${index + 1}`}
          onClick={() => onChange(index)}
          className={`h-7 w-7 rounded-lg transition hover:scale-110 ${value === index ? "ring-2 ring-ink ring-offset-2 ring-offset-bg" : ""}`}
          style={{ background: `var(--s${index})` }}
        />
      ))}
    </div>
  )
}
