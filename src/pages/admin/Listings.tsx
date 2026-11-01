import { useCallback, useEffect, useState } from "react"
import { api } from "../../services/api"
import type { AdminListing, ApiResponse, Meta } from "../../types/api"
import { formatDate, formatPrice } from "../../utils/format"
import { getErrorMessage } from "../../utils/errors"
import BookCover from "../../components/BookCover"
import Lightbox from "../../components/Lightbox"
import Pagination from "../../components/Pagination"
import RejectDialog from "../../components/RejectDialog"
import StatusTag from "../../components/StatusTag"

const tabs = [
  { value: "pending", label: "Pending" },
  { value: "available", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
]

export default function Listings() {
  const [status, setStatus] = useState("pending")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminListing[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [rejecting, setRejecting] = useState<AdminListing | null>(null)
  const [viewer, setViewer] = useState<{
    images: string[]
    start: number
  } | null>(null)
  const [busyId, setBusyId] = useState("")

  const load = useCallback(async () => {
    setLoading(true)

    try {
      const response = await api.get<ApiResponse<AdminListing[]>>(
        "/admin/listings",
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

  const approve = async (item: AdminListing) => {
    setBusyId(item._id)
    setNotice("")

    try {
      await api.patch(`/admin/listings/${item._id}/approve`)
      setNotice(`“${item.title}” was approved and is now live`)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  const reject = async (item: AdminListing, reason: string) => {
    setBusyId(item._id)
    setNotice("")

    try {
      await api.patch(`/admin/listings/${item._id}/reject`, { reason })
      setNotice(`“${item.title}” was rejected. The seller can see your reason`)
      setRejecting(null)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Listings</h1>
      <p className="mt-1 text-mute">Review the books students want to sell</p>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => changeTab(tab.value)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
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
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-line bg-card"
            />
          ))}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
            No {tabs.find((tab) => tab.value === status)?.label.toLowerCase()}{" "}
            listings.
          </div>
        )}

        {items.map((item) => (
          <article
            key={item._id}
            className="rounded-2xl border border-line bg-card p-4 backdrop-blur"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex shrink-0 gap-2">
                {item.images.length === 0 ? (
                  <div className="grid h-24 w-24 place-items-center rounded-xl bg-brand-1/15">
                    <BookCover colorKey={item.subject.colorKey} width={44} />
                  </div>
                ) : (
                  item.images.map((image, index) => (
                    <button
                      key={image}
                      onClick={() =>
                        setViewer({ images: item.images, start: index })
                      }
                      aria-label={`View photo ${index + 1} of ${item.title}`}
                      className="h-24 w-24 overflow-hidden rounded-xl border border-line transition hover:scale-105"
                    >
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))
                )}
              </div>

              <div className="min-w-56 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold leading-snug">{item.title}</h2>
                  <StatusTag status={item.status} />
                </div>
                <p className="mt-0.5 text-sm text-mute">
                  {item.subject.name} · {item.gradeLevel.name} ·{" "}
                  {item.condition} · {item.district}
                </p>
                <p className="mt-1 font-display text-lg font-bold">
                  {formatPrice(item.price)}
                </p>
                <p className="mt-1 text-xs text-mute">
                  Seller: <b className="text-ink">{item.seller.name}</b> (
                  {item.seller.email}
                  {item.seller.phone ? `, ${item.seller.phone}` : ""}) ·{" "}
                  {formatDate(item.createdAt)}
                </p>
              </div>

              {item.status === "pending" && (
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => approve(item)}
                    disabled={busyId === item._id}
                    className="rounded-xl bg-ok px-5 py-2 text-sm font-bold text-black/80 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                  >
                    {busyId === item._id ? "Working..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejecting(item)}
                    disabled={busyId === item._id}
                    className="rounded-xl border border-bad/60 px-5 py-2 text-sm font-bold text-bad transition hover:bg-bad/10 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {meta && <Pagination meta={meta} onChange={setPage} />}

      {rejecting && (
        <RejectDialog
          title={rejecting.title}
          onCancel={() => setRejecting(null)}
          onConfirm={(reason) => reject(rejecting, reason)}
        />
      )}
      {viewer && (
        <Lightbox
          images={viewer.images}
          start={viewer.start}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  )
}
