import { Link } from "react-router-dom"
import type { ListingSummary } from "../types/api"
import { formatPrice } from "../utils/format"
import BookCover from "./BookCover"
import SaveButton from "./SaveButton"

interface ListingCardProps {
  listing: ListingSummary
}

export default function ListingCard({ listing }: ListingCardProps) {
  const color = `var(--s${listing.subject.colorKey})`

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-card backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div
        className="relative grid h-40 place-items-center overflow-hidden"
        style={{
          background: `linear-gradient(160deg, color-mix(in srgb, ${color} 28%, transparent), transparent)`,
        }}
      >
        {listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <BookCover colorKey={listing.subject.colorKey} width={70} />
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-ok/20 px-2.5 py-0.5 text-[11px] font-bold text-ok backdrop-blur">
          {listing.condition}
        </span>
        <SaveButton
          listingId={listing._id}
          className="absolute right-2.5 top-2.5"
        />
      </div>

      <div className="p-3.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">
          {listing.title}
        </h3>
        <p className="mt-0.5 text-xs text-mute">
          {listing.subject.name} · {listing.district}
        </p>
        <p className="mt-2 font-display text-lg font-bold">
          {formatPrice(listing.price)}
        </p>
      </div>
    </Link>
  )
}
