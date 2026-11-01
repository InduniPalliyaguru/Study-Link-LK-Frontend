import { useCallback, useEffect, useState } from "react"
import { api } from "../../services/api"
import type { AdminRequest, ApiResponse, Meta } from "../../types/api"
import { formatDate } from "../../utils/format"
import { getErrorMessage } from "../../utils/errors"
import Pagination from "../../components/Pagination"
import StatusTag from "../../components/StatusTag"

const tabs = [
  "all",
  "pending",
  "accepted",
  "shipped",
  "completed",
  "rejected",
  "cancelled",
]

export default function Requests() {
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminRequest[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const response = await api.get<ApiResponse<AdminRequest[]>>(
        "/admin/requests",
        {
          params: {
            status: status === "all" ? undefined : status,
            page,
            limit: 10,
          },
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
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Requests</h1>
      <p className="mt-1 text-mute">Every purchase request between students</p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={status === tab}
            onClick={() => changeTab(tab)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition ${
              status === tab
                ? "border-transparent bg-linear-to-br from-brand-1 to-brand-2 text-white"
                : "border-line bg-card text-mute hover:text-ink"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-line bg-card"
            />
          ))}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
            No requests here.
          </div>
        )}

        {items.map((item) => (
          <article
            key={item._id}
            className="rounded-2xl border border-line bg-card p-4 backdrop-blur"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-1/15 text-2xl">
                {item.listing?.images[0] ? (
                  <img
                    src={item.listing.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "📘"
                )}
              </div>

              <div className="min-w-56 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold leading-snug">
                    {item.listing?.title ?? "Removed listing"}
                  </h2>
                  <StatusTag status={item.status} />
                  {item.verified && (
                    <span className="text-xs font-semibold text-ok">
                      ✓ verified
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-mute">
                  <b className="text-ink">{item.buyer?.name ?? "A student"}</b>{" "}
                  asked{" "}
                  <b className="text-ink">{item.seller?.name ?? "a seller"}</b>
                </p>
                <p className="text-xs text-mute">
                  {item.deliveryMethod === "courier"
                    ? "Courier"
                    : "Meet in person"}
                  {item.trackingNumber
                    ? ` · tracking ${item.trackingNumber}`
                    : ""}{" "}
                  · {formatDate(item.createdAt)}
                </p>
              </div>

              <div className="text-right text-xs text-mute">
                <p>{item.buyer?.email}</p>
                <p>{item.seller?.email}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {meta && <Pagination meta={meta} onChange={setPage} />}
    </div>
  )
}
