import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useParams } from "react-router-dom"
import { api } from "../services/api"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { fetchListing } from "../features/listings/listingsSlice"
import { resetSend, sendRequest } from "../features/requests/requestsSlice"
import type { ApiResponse, PublicProfile } from "../types/api"
import { formatPrice } from "../utils/format"
import { inputClass } from "../utils/styles"
import BookCover from "../components/BookCover"
import SaveButton from "../components/SaveButton"
import ReportDialog from "../components/ReportDialog"

const deliveryText = {
  meetup: "Meet-up only",
  courier: "Courier only",
  both: "Meet-up or courier",
}

export default function ListingDetail() {
  const { id } = useParams()
  const dispatch = useAppDispatch()

  const user = useAppSelector((state) => state.auth.user)
  const {
    current: listing,
    currentStatus,
    currentError,
  } = useAppSelector((state) => state.listings)
  const { sendStatus, sendError } = useAppSelector((state) => state.requests)

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [photo, setPhoto] = useState(0)
  const [message, setMessage] = useState("")
  const [method, setMethod] = useState<"meetup" | "courier">("meetup")
  const [address, setAddress] = useState("")
  const [sent, setSent] = useState(false)
  const [reporting, setReporting] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchListing(id))
      dispatch(resetSend())
      setSent(false)
      setPhoto(0)
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!listing) {
      return
    }

    setMethod(listing.deliveryOptions === "courier" ? "courier" : "meetup")

    api
      .get<ApiResponse<PublicProfile>>(`/users/${listing.seller._id}/public`)
      .then((response) => setProfile(response.data.data))
      .catch(() => setProfile(null))
  }, [listing])

  if (currentStatus === "loading" || (!listing && currentStatus === "idle")) {
    return (
      <div className="h-96 animate-pulse rounded-3xl border border-line bg-card" />
    )
  }

  if (currentStatus === "failed" || !listing) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-bad">{currentError}</p>
        <Link
          to="/browse"
          className="mt-3 inline-block font-semibold text-brand-2 hover:underline"
        >
          Back to browse
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === listing.seller._id
  const canCourier = listing.deliveryOptions !== "meetup"
  const canMeetup = listing.deliveryOptions !== "courier"

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const result = await dispatch(
      sendRequest({
        listing: listing._id,
        message: message.trim() || undefined,
        deliveryMethod: method,
        deliveryAddress: method === "courier" ? address.trim() : undefined,
      }),
    )

    if (sendRequest.fulfilled.match(result)) {
      setSent(true)
    }
  }

  const radio = (active: boolean) =>
    `flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition ${
      active ? "border-brand-1 bg-brand-1/20" : "border-line hover:bg-bg"
    }`

  return (
    <div>
      <Link
        to="/browse"
        className="text-sm font-semibold text-mute hover:text-ink"
      >
        ← Back to browse
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="relative grid h-80 place-items-center overflow-hidden rounded-3xl border border-line bg-card md:h-96">
            {listing.images[photo] ? (
              <img
                src={listing.images[photo]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <BookCover colorKey={listing.subject.colorKey} width={150} />
            )}
            <SaveButton
              listingId={listing._id}
              className="absolute right-4 top-4"
            />
          </div>

          {listing.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setPhoto(index)}
                  aria-label={`Show photo ${index + 1}`}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                    index === photo
                      ? "border-brand-1"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-line bg-card p-5">
            <h2 className="font-display text-lg font-bold">About this book</h2>
            <p className="mt-2 whitespace-pre-line text-mute">
              {listing.description}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-card p-5">
            <span className="rounded-full bg-ok/20 px-3 py-0.5 text-xs font-bold text-ok">
              {listing.status}
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold leading-snug">
              {listing.title}
            </h1>
            <p className="mt-1 font-display text-3xl font-bold">
              {formatPrice(listing.price)}
            </p>

            <dl className="mt-4 grid grid-cols-[110px_1fr] gap-y-1.5 text-sm">
              <dt className="text-mute">Subject</dt>
              <dd className="font-semibold">{listing.subject.name}</dd>
              <dt className="text-mute">Level</dt>
              <dd className="font-semibold">{listing.gradeLevel.name}</dd>
              <dt className="text-mute">Condition</dt>
              <dd className="font-semibold">{listing.condition}</dd>
              <dt className="text-mute">District</dt>
              <dd className="font-semibold">{listing.district}</dd>
              <dt className="text-mute">Delivery</dt>
              <dd className="font-semibold">
                {deliveryText[listing.deliveryOptions]}
              </dd>
            </dl>
            {!isOwner && (
              <button
                onClick={() => setReporting(true)}
                className="mt-4 text-xs font-semibold text-mute underline-offset-2 hover:text-bad hover:underline"
              >
                🚩 Report this listing
              </button>
            )}
            {reporting && (
              <ReportDialog
                listingId={listing._id}
                title={listing.title}
                onClose={() => setReporting(false)}
              />
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-linear-to-br from-brand-1 to-brand-2 font-extrabold text-white">
                {listing.seller.name[0]}
              </span>
              <div>
                <p className="font-bold">{listing.seller.name}</p>
                <p className="text-xs text-mute">{listing.seller.district}</p>
              </div>
            </div>

            {profile && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-bg/60 p-3">
                  <p className="font-display text-xl font-bold">
                    {profile.rating.count > 0
                      ? `${profile.rating.average} ★`
                      : "New"}
                  </p>
                  <p className="text-xs text-mute">
                    {profile.rating.count} reviews
                  </p>
                </div>
                <div className="rounded-xl bg-bg/60 p-3">
                  <p className="font-display text-xl font-bold">
                    {profile.booksSold}
                  </p>
                  <p className="text-xs text-mute">Books sold</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-card p-5">
            <h2 className="font-display text-lg font-bold">
              Request this book
            </h2>

            {isOwner ? (
              <p className="mt-2 text-mute">This is your own listing.</p>
            ) : listing.status !== "available" ? (
              <p className="mt-2 text-mute">
                This book is not available right now.
              </p>
            ) : sent ? (
              <p
                className="mt-3 rounded-xl bg-ok/15 p-4 text-sm font-semibold text-ok"
                role="status"
              >
                Request sent! The seller will respond soon. Contact details are
                shared only after the seller accepts.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-3">
                <div className="flex gap-2">
                  {canMeetup && (
                    <label className={radio(method === "meetup")}>
                      <input
                        type="radio"
                        className="sr-only"
                        checked={method === "meetup"}
                        onChange={() => setMethod("meetup")}
                      />
                      Meet in person
                    </label>
                  )}
                  {canCourier && (
                    <label className={radio(method === "courier")}>
                      <input
                        type="radio"
                        className="sr-only"
                        checked={method === "courier"}
                        onChange={() => setMethod("courier")}
                      />
                      Courier
                    </label>
                  )}
                </div>

                {method === "courier" && (
                  <>
                    <label
                      htmlFor="address"
                      className="mt-3 mb-1.5 block text-sm font-bold"
                    >
                      Delivery address
                    </label>
                    <textarea
                      id="address"
                      className={`${inputClass} min-h-20`}
                      placeholder="House no, street, town"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      minLength={10}
                    />
                    <p className="mt-1 text-xs text-mute">
                      The seller sees your address only after accepting. You pay
                      the courier charges.
                    </p>
                  </>
                )}

                <label
                  htmlFor="message"
                  className="mt-3 mb-1.5 block text-sm font-bold"
                >
                  Message (optional)
                </label>
                <input
                  id="message"
                  className={inputClass}
                  placeholder="Can I collect it on Saturday?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={300}
                />

                <p className="mt-2 min-h-5 text-sm text-bad" role="alert">
                  {sendError}
                </p>

                <button
                  disabled={sendStatus === "loading"}
                  className="mt-1 w-full rounded-xl bg-linear-to-br from-brand-1 to-brand-2 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                >
                  {sendStatus === "loading" ? "Sending..." : "Send request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
