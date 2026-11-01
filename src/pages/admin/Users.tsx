import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { api } from "../../services/api"
import { useAppSelector } from "../../app/hooks"
import type { AdminUser, ApiResponse, Meta } from "../../types/api"
import { formatDate } from "../../utils/format"
import { getErrorMessage } from "../../utils/errors"
import { inputClass } from "../../utils/styles"
import Pagination from "../../components/Pagination"

const tabs = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
]

export default function Users() {
  const me = useAppSelector((state) => state.auth.user)

  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busyId, setBusyId] = useState("")

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const response = await api.get<ApiResponse<AdminUser[]>>("/admin/users", {
        params: {
          q: query || undefined,
          blocked:
            filter === "blocked"
              ? "true"
              : filter === "active"
                ? "false"
                : undefined,
          page,
          limit: 10,
        },
      })

      setItems(response.data.data)
      setMeta(response.data.meta ?? null)
      setError("")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filter, query, page])

  useEffect(() => {
    load()
  }, [load])

  const changeFilter = (value: string) => {
    setFilter(value)
    setPage(1)
    setNotice("")
  }

  const submitSearch = (event: FormEvent) => {
    event.preventDefault()
    setQuery(search.trim())
    setPage(1)
  }

  const clearSearch = () => {
    setSearch("")
    setQuery("")
    setPage(1)
  }

  const toggleBlock = async (user: AdminUser) => {
    if (
      !user.isBlocked &&
      !window.confirm(`Block ${user.name}? They will not be able to log in.`)
    ) {
      return
    }

    setBusyId(user._id)
    setNotice("")

    try {
      await api.patch(`/admin/users/${user._id}/block`, {
        blocked: !user.isBlocked,
      })
      setNotice(
        user.isBlocked
          ? `${user.name} was unblocked`
          : `${user.name} was blocked`,
      )
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  const remove = async (user: AdminUser) => {
    const ok = window.confirm(
      `Delete ${user.name}? Their account is removed and their unsold listings are hidden. This is meant for fake or harmful accounts.`,
    )

    if (!ok) {
      return
    }

    setBusyId(user._id)
    setNotice("")

    try {
      await api.delete(`/admin/users/${user._id}`)
      setNotice(`${user.name} was deleted`)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Users</h1>
      <p className="mt-1 text-mute">Students and admins on StudyLink LK</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={filter === tab.value}
              onClick={() => changeFilter(tab.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                filter === tab.value
                  ? "border-transparent bg-linear-to-br from-brand-1 to-brand-2 text-white"
                  : "border-line bg-card text-mute hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="flex gap-2">
          <input
            className={`${inputClass} w-60 py-2`}
            placeholder="Search name or email"
            aria-label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-4 font-bold text-white">
            Search
          </button>
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-xl border border-line px-4 text-sm font-semibold hover:bg-card"
            >
              Clear
            </button>
          )}
        </form>
      </div>

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

      <div
        className={`mt-4 overflow-x-auto rounded-2xl border border-line bg-card backdrop-blur transition ${loading && items.length > 0 ? "opacity-50" : ""}`}
      >
        <table className="w-full min-w-170 text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs text-mute">
              <th className="px-4 py-3 font-semibold">Student</th>
              <th className="px-4 py-3 font-semibold">District</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              items.length === 0 &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-line">
                  <td colSpan={5} className="px-4 py-4">
                    <div className="h-6 animate-pulse rounded bg-bg/60" />
                  </td>
                </tr>
              ))}

            {items.map((user) => {
              const protectedAccount =
                user.role === "ADMIN" || user._id === me?.id

              return (
                <tr
                  key={user._id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-1 to-brand-2 font-bold text-white">
                        {user.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {user.name}
                          {user.role === "ADMIN" && (
                            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold text-black/80">
                              ADMIN
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-mute">
                          {user.email}
                          {user.phone ? ` · ${user.phone}` : ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.district}</td>
                  <td className="px-4 py-3 text-mute">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        user.isBlocked
                          ? "bg-bad/20 text-bad"
                          : "bg-ok/20 text-ok"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {protectedAccount ? (
                        <span className="text-xs text-mute">
                          {user._id === me?.id ? "This is you" : "Protected"}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => toggleBlock(user)}
                            disabled={busyId === user._id}
                            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-bg disabled:opacity-50"
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </button>
                          <button
                            onClick={() => remove(user)}
                            disabled={busyId === user._id}
                            className="rounded-lg border border-bad/60 px-3 py-1.5 text-xs font-semibold text-bad hover:bg-bad/10 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!loading && items.length === 0 && (
          <p className="p-8 text-center text-mute">No users found.</p>
        )}
      </div>

      {meta && <Pagination meta={meta} onChange={setPage} />}
    </div>
  )
}
