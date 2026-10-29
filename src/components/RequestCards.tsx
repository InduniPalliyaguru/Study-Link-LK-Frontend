import { useState } from "react"
import { Link } from "react-router-dom"
import type { Person, RequestItem } from "../types/api"
import { formatDate, formatPrice } from "../utils/format"
import { inputClass } from "../utils/styles"
import BookCover from "./BookCover"
import ReviewForm from "./ReviewForm"
import StatusTag from "./StatusTag"

export interface RequestActions {
  respond: (id: string, decision: "accept" | "reject") => void
  cancel: (id: string) => void
  ship: (id: string, trackingNumber: string) => void
  confirm: (id: string, code?: string) => void
  regenerate: (id: string) => void
  completeManually: (id: string) => void
}

const base = "rounded-xl px-4 py-2 text-sm font-semibold transition"
const primary = `${base} bg-linear-to-br from-brand-1 to-brand-2 text-white hover:-translate-y-0.5 active:scale-95`
const ghost = `${base} border border-line hover:bg-bg`
const danger = `${base} border border-bad/60 text-bad hover:bg-bad/10`

function Header({ item, who }: { item: RequestItem; who: string }) {
  const listing = item.listing
  const isPublic =
    listing && ["available", "reserved", "sold"].includes(listing.status)

  return (
    <div className="flex flex-wrap gap-4">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-brand-1/15">
        {listing?.images[0] ? (
          <img
            src={listing.images[0]}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <BookCover colorKey={2} width={38} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {listing && isPublic ? (
            <Link
              to={`/listings/${listing._id}`}
              className="font-bold leading-snug hover:underline"
            >
              {listing.title}
            </Link>
          ) : (
            <span className="font-bold leading-snug">
              {listing?.title ?? "This listing is no longer available"}
            </span>
          )}
          <StatusTag status={item.status} />
        </div>
        <p className="mt-0.5 text-sm text-mute">
          {who} ·{" "}
          {item.deliveryMethod === "courier" ? "Courier" : "Meet in person"} ·{" "}
          {formatDate(item.createdAt)}
        </p>
        {listing && (
          <p className="font-display text-lg font-bold">
            {formatPrice(listing.price)}
          </p>
        )}
        {item.message && (
          <p className="mt-1 text-sm italic text-mute">“{item.message}”</p>
        )}
      </div>
    </div>
  )
}

function Contact({
  title,
  person,
  address,
}: {
  title: string
  person?: Person
  address?: string
}) {
  if (!person?.phone && !person?.email && !address) {
    return null
  }

  return (
    <div className="mt-3 rounded-xl border border-ok/40 bg-ok/10 p-3.5 text-sm">
      <p className="font-bold text-ok">{title}</p>
      <p className="mt-1">{person?.name}</p>
      {person?.phone && <p>📞 {person.phone}</p>}
      {person?.email && <p>✉ {person.email}</p>}
      {address && <p className="mt-1">📦 Deliver to: {address}</p>}
    </div>
  )
}

interface SellerCardProps {
  item: RequestItem
  code?: string
  actions: RequestActions
}

export function SellerCard({ item, code, actions }: SellerCardProps) {
  const [tracking, setTracking] = useState("")
  const codeExpired =
    !!item.handoverCodeExpires &&
    new Date(item.handoverCodeExpires) < new Date()

  return (
    <article className="rounded-2xl border border-line bg-card p-4 backdrop-blur">
      <Header item={item} who={`From ${item.buyer?.name ?? "a student"}`} />

      {item.status === "pending" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className={primary}
            onClick={() => actions.respond(item._id, "accept")}
          >
            Accept
          </button>
          <button
            className={danger}
            onClick={() => actions.respond(item._id, "reject")}
          >
            Reject
          </button>
        </div>
      )}

      {["accepted", "shipped", "completed"].includes(item.status) && (
        <Contact
          title="Buyer contact"
          person={item.buyer}
          address={item.deliveryAddress}
        />
      )}

      {item.status === "accepted" && item.deliveryMethod === "meetup" && (
        <div className="mt-3 rounded-xl border border-dashed border-brand-1 bg-brand-1/10 p-4">
          <p className="text-sm font-bold">Handover code</p>
          {code ? (
            <>
              <p className="mt-1 font-display text-4xl font-bold tracking-[0.3em]">
                {code}
              </p>
              <p className="mt-1 text-xs text-mute">
                Share this code with the buyer ONLY after you hand over the
                book. The buyer enters it to complete the sale. You will not be
                able to see it again.
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs text-mute">
              The code is shown only once, right after you accept. Lost it?
              Generate a new one (the old one stops working).
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className={ghost}
              onClick={() => actions.regenerate(item._id)}
            >
              Generate new code
            </button>
            {codeExpired && (
              <button
                className={ghost}
                onClick={() => actions.completeManually(item._id)}
              >
                Mark as sold (code expired)
              </button>
            )}
          </div>
        </div>
      )}

      {item.status === "accepted" && item.deliveryMethod === "courier" && (
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            actions.ship(item._id, tracking.trim())
          }}
        >
          <input
            className={`${inputClass} max-w-64`}
            placeholder="Tracking number (optional)"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            maxLength={50}
            aria-label="Tracking number"
          />
          <button className={primary}>Mark as shipped</button>
        </form>
      )}

      {item.status === "shipped" && (
        <p className="mt-3 text-sm text-mute">
          Shipped
          {item.trackingNumber ? ` (tracking: ${item.trackingNumber})` : ""}.
          Waiting for the buyer to confirm. It completes automatically after 10
          days.
        </p>
      )}

      {item.status === "completed" && (
        <p className="mt-3 text-sm font-semibold text-ok">
          Sale completed
          {item.verified ? " ✓ verified" : " (not confirmed by the buyer)"}
        </p>
      )}
    </article>
  )
}

interface BuyerCardProps {
  item: RequestItem
  actions: RequestActions
}

export function BuyerCard({ item, actions }: BuyerCardProps) {
  const [code, setCode] = useState("")

  return (
    <article className="rounded-2xl border border-line bg-card p-4 backdrop-blur">
      <Header item={item} who={`To ${item.seller?.name ?? "a seller"}`} />

      {["accepted", "shipped", "completed"].includes(item.status) && (
        <Contact title="Seller contact" person={item.seller} />
      )}

      {item.status === "pending" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-mute">
            Waiting for the seller to respond.
          </span>
          <button className={danger} onClick={() => actions.cancel(item._id)}>
            Cancel request
          </button>
        </div>
      )}

      {item.status === "accepted" && item.deliveryMethod === "meetup" && (
        <div className="mt-3">
          <p className="text-sm text-mute">
            Arrange the meet-up with the seller. When you have the book, ask the
            seller for the 6-digit code and enter it here.
          </p>
          <form
            className="mt-2 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              actions.confirm(item._id, code)
            }}
          >
            <input
              className={`${inputClass} max-w-44 text-center font-display text-xl tracking-[0.3em]`}
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              aria-label="6-digit handover code"
            />
            <button
              disabled={code.length !== 6}
              className={`${primary} disabled:opacity-50`}
            >
              Confirm receipt
            </button>
            <button
              type="button"
              className={danger}
              onClick={() => actions.cancel(item._id)}
            >
              Cancel request
            </button>
          </form>
        </div>
      )}

      {item.status === "accepted" && item.deliveryMethod === "courier" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-mute">
            The seller will post the book to your address and mark it as
            shipped.
          </span>
          <button className={danger} onClick={() => actions.cancel(item._id)}>
            Cancel request
          </button>
        </div>
      )}

      {item.status === "shipped" && (
        <div className="mt-3">
          <p className="text-sm text-mute">
            On its way
            {item.trackingNumber ? ` (tracking: ${item.trackingNumber})` : ""}.
            Tap the button when it arrives.
          </p>
          <button
            className={`${primary} mt-2`}
            onClick={() => actions.confirm(item._id)}
          >
            I received the book
          </button>
        </div>
      )}

      {item.status === "completed" && (
        <>
          <p className="mt-3 text-sm font-semibold text-ok">
            Completed. Enjoy your book!
          </p>
          <ReviewForm requestId={item._id} />
        </>
      )}

      {item.status === "rejected" && (
        <p className="mt-3 text-sm text-mute">
          The seller could not accept this request.
        </p>
      )}
    </article>
  )
}
