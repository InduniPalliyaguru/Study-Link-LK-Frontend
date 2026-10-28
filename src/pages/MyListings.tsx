import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import type { ApiResponse, ListingStatus, MyListing } from "../types/api"
import { formatDate, formatPrice } from "../utils/format"
import { getErrorMessage } from "../utils/errors"
import BookCover from "../components/BookCover"
import EditListingModal from "../components/EditListingModal"
import StatusTag from "../components/StatusTag"

const tabs: { value: "all" | ListingStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "rejected", label: "Rejected" },
]

export default function MyListings() {
  const [items, setItems] = useState<MyListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tab, setTab] = useState<"all" | ListingStatus>("all")
  const [editing, setEditing] = useState<MyListing | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    api
      .get<ApiResponse<MyListing[]>>("/listings/mine")
      .then((response) => setItems(response.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const visible =
    tab === "all" ? items : items.filter((item) => item.status === tab)

  const countFor = (value: "all" | ListingStatus) =>
    value === "all"
      ? items.length
      : items.filter((item) => item.status === value).length

  const handleDelete = async (item: MyListing) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/listings/${item._id}`)
      setItems((current) => current.filter((entry) => entry._id !== item._id))
      setMessage("Listing deleted")
    } catch (err) {
      setMessage(getErrorMessage(err))
    }
  }

  const handleSaved = (updated: MyListing) => {
    setItems((current) =>
      current.map((entry) =>
        entry._id === updated._id
          ? {
              ...entry,
              title: updated.title,
              description: updated.description,
              price: updated.price,
              status: updated.status,
              rejectionReason: updated.rejectionReason,
            }
          : entry,
      ),
    )
    setEditing(null)
    setMessage("Saved. Your listing was sent for approval again")
  }

  const isPublic = (status: ListingStatus) =>
    status === "available" || status === "reserved" || status === "sold"
  const canEdit = (status: ListingStatus) =>
    status === "pending" || status === "available" || status === "rejected"

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">My listings</h1>
          <p className="mt-1 text-mute">Books you are selling</p>
        </div>
        <Link
          to="/sell"
          className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-5 py-2.5 font-bold text-white"
        >
          ＋ List a book
        </Link>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist">
        {tabs.map((entry) => (
          <button
            key={entry.value}
            role="tab"
            aria-selected={tab === entry.value}
            onClick={() => setTab(entry.value)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              tab === entry.value
                ? "border-transparent bg-linear-to-br from-brand-1 to-brand-2 text-white"
                : "border-line bg-card text-mute hover:text-ink"
            }`}
          >
            {entry.label} ({countFor(entry.value)})
          </button>
        ))}
      </div>

      {message && (
        <p
          className="mt-4 rounded-xl bg-brand-1/15 px-4 py-2 text-sm font-semibold"
          role="status"
        >
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 text-bad" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-line bg-card"
            />
          ))}

        {!loading && visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
            {items.length === 0 ? (
              <>
                You have not listed any books yet.{" "}
                <Link
                  to="/sell"
                  className="font-semibold text-brand-2 hover:underline"
                >
                  List your first book
                </Link>
              </>
            ) : (
              "No listings in this group."
            )}
          </div>
        )}

        {visible.map((item) => (
          <article
            key={item._id}
            className="rounded-2xl border border-line bg-card p-4 backdrop-blur"
          >
            <div className="flex flex-wrap gap-4">
              <div
                className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl"
                style={{
                  background: `color-mix(in srgb, var(--s${item.subject.colorKey}) 25%, transparent)`,
                }}
              >
                {item.images[0] ? (
                  <img
                    src={item.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookCover colorKey={item.subject.colorKey} width={44} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold leading-snug">{item.title}</h2>
                  <StatusTag status={item.status} />
                </div>
                <p className="mt-0.5 text-sm text-mute">
                  {item.subject.name} · {item.gradeLevel.name} · {item.district}
                </p>
                <p className="mt-1 font-display text-lg font-bold">
                  {formatPrice(item.price)}
                </p>
                <p className="text-xs text-mute">
                  Added {formatDate(item.createdAt)}
                </p>
              </div>

              <div className="flex flex-wrap items-start gap-2">
                {isPublic(item.status) && (
                  <Link
                    to={`/listings/${item._id}`}
                    className="rounded-xl border border-line px-3 py-1.5 text-sm font-semibold hover:bg-bg"
                  >
                    View
                  </Link>
                )}
                {canEdit(item.status) && (
                  <button
                    onClick={() => setEditing(item)}
                    className="rounded-xl border border-line px-3 py-1.5 text-sm font-semibold hover:bg-bg"
                  >
                    Edit
                  </button>
                )}
                {item.status !== "reserved" && (
                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded-xl border border-bad/60 px-3 py-1.5 text-sm font-semibold text-bad hover:bg-bad/10"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {item.status === "rejected" && item.rejectionReason && (
              <p className="mt-3 rounded-xl bg-bad/10 px-4 py-2.5 text-sm text-bad">
                <b>Why it was rejected:</b> {item.rejectionReason}. Edit the
                listing and it will be reviewed again.
              </p>
            )}
            {item.status === "pending" && (
              <p className="mt-3 text-xs text-mute">
                Waiting for an admin to approve this listing.
              </p>
            )}
            {item.status === "reserved" && (
              <p className="mt-3 text-xs text-mute">
                A buyer request was accepted. Finish it from the Requests page.
              </p>
            )}
          </article>
        ))}
      </div>

      {editing && (
        <EditListingModal
          listing={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
