import { useCallback, useEffect, useState } from "react"
import { api } from "../../services/api"
import type { AdminReport, ApiResponse, Meta } from "../../types/api"
import { REPORT_REASONS } from "../../utils/constants"
import { formatDate } from "../../utils/format"
import { getErrorMessage } from "../../utils/errors"
import BookCover from "../../components/BookCover"
import Pagination from "../../components/Pagination"

const tabs = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
]

const actionText: Record<string, string> = {
  dismissed: "Dismissed (no problem found)",
  listing_removed: "Listing removed",
  seller_blocked: "Seller blocked and listing removed",
}

const reasonText = (value: string) =>
  REPORT_REASONS.find((item) => item.value === value)?.label ?? value

export default function Reports() {
  const [status, setStatus] = useState("open")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminReport[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [busyId, setBusyId] = useState("")

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const response = await api.get<ApiResponse<AdminReport[]>>(
        "/admin/reports",
        {
          params: { status, page, limit: 8 },
        },
      )

      setItems(response.data.data)
      setMeta(response.data.meta ?? null)
      setError("")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => {
    load()
  }, [load])

  const changeTab = (value: string) => {
    setStatus(value)
    setPage(1)
    setNotice("")
  }

  const resolve = async (
    report: AdminReport,
    action: "dismiss" | "remove_listing" | "block_seller",
  ) => {
    const messages = {
      dismiss: "Dismiss this report? The listing stays online.",
      remove_listing: `Remove "${report.listing?.title}"? It is hidden from students and its waiting requests are cancelled.`,
      block_seller: `Block ${report.listing?.seller?.name} and remove this listing? They will not be able to log in.`,
    }

    if (!window.confirm(messages[action])) {
      return
    }

    setBusyId(report._id)
    setNotice("")
    setError("")

    try {
      await api.patch(`/admin/reports/${report._id}`, { action })
      setNotice(
        action === "dismiss"
          ? "Report dismissed"
          : action === "remove_listing"
            ? "Listing removed. Other open reports about it were resolved too"
            : "Seller blocked and listing removed",
      )
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Reports</h1>
      <p className="mt-1 text-mute">Listings that students reported</p>

      <div className="mt-5 flex gap-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => changeTab(tab.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              status === tab.value
                ? "border-transparent bg-linear-to-br from-brand-1 to-brand-2 text-white"
                : "border-line bg-card text-mute hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
        className={`mt-4 space-y-3 transition ${loading && items.length > 0 ? "opacity-50" : ""}`}
      >
        {loading &&
          items.length === 0 &&
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-line bg-card"
            />
          ))}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
            {status === "open"
              ? "No open reports. All clear! 🎉"
              : "Nothing here yet."}
          </div>
        )}

        {items.map((report) => {
          const listing = report.listing
          const seller = listing?.seller

          return (
            <article
              key={report._id}
              className="rounded-2xl border border-line bg-card p-4 backdrop-blur"
            >
              <div className="flex flex-wrap gap-4">
                <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-1/15">
                  {listing?.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BookCover colorKey={0} width={38} />
                  )}
                </div>

                <div className="min-w-56 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold leading-snug">
                      {listing?.title ?? "Listing not found"}
                    </h2>
                    {listing?.isDeleted && (
                      <span className="rounded-full bg-bad/20 px-2.5 py-0.5 text-[11px] font-bold text-bad">
                        Removed
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm">
                    <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-accent">
                      {reasonText(report.reason)}
                    </span>
                  </p>
                  {report.details && (
                    <p className="mt-1.5 text-sm text-mute">
                      “{report.details}”
                    </p>
                  )}

                  <p className="mt-2 text-xs text-mute">
                    Reported by{" "}
                    <b className="text-ink">
                      {report.reporter?.name ?? "a student"}
                    </b>{" "}
                    · {formatDate(report.createdAt)}
                  </p>
                  {seller && (
                    <p className="text-xs text-mute">
                      Seller: <b className="text-ink">{seller.name}</b> (
                      {seller.email}, {seller.district})
                      {seller.isBlocked && (
                        <span className="ml-1 font-bold text-bad">
                          · blocked
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {report.status === "open" && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => resolve(report, "dismiss")}
                      disabled={busyId === report._id}
                      className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-bg disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => resolve(report, "remove_listing")}
                      disabled={busyId === report._id}
                      className="rounded-xl border border-bad/60 px-4 py-2 text-sm font-semibold text-bad hover:bg-bad/10 disabled:opacity-50"
                    >
                      Remove listing
                    </button>
                    <button
                      onClick={() => resolve(report, "block_seller")}
                      disabled={busyId === report._id}
                      className="rounded-xl bg-bad px-4 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
                    >
                      Block seller
                    </button>
                  </div>
                )}
              </div>

              {report.status !== "open" && (
                <p className="mt-3 rounded-xl bg-bg/60 px-4 py-2 text-xs text-mute">
                  <b className="text-ink">
                    {report.action ? actionText[report.action] : "Closed"}
                  </b>
                  {report.resolvedBy ? ` by ${report.resolvedBy.name}` : ""}
                  {report.resolvedAt
                    ? ` · ${formatDate(report.resolvedAt)}`
                    : ""}
                </p>
              )}
            </article>
          )
        })}
      </div>

      {meta && <Pagination meta={meta} onChange={setPage} />}
    </div>
  )
}
