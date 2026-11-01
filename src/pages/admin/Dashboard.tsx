import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../../services/api"
import type { AdminListing, ApiResponse, DashboardStats } from "../../types/api"
import { formatDate, formatPrice } from "../../utils/format"
import { getErrorMessage } from "../../utils/errors"
import BookCover from "../../components/BookCover"
import CountUp from "../../components/CountUp"

const card = "rounded-2xl border border-line bg-card p-5 backdrop-blur"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pending, setPending] = useState<AdminListing[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<DashboardStats>>("/admin/stats"),
      api.get<ApiResponse<AdminListing[]>>("/admin/listings", {
        params: { status: "pending", limit: 5 },
      }),
    ])
      .then(([statsResponse, listingsResponse]) => {
        setStats(statsResponse.data.data)
        setPending(listingsResponse.data.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  const tiles = stats
    ? [
        {
          name: "Registered students",
          value: stats.students,
          note: `${stats.pendingRequests} pending requests`,
        },
        {
          name: "Active listings",
          value: stats.activeListings,
          note: "Live on the marketplace",
        },
        {
          name: "Books sold",
          value: stats.booksSold,
          note: `${stats.completedRequests} completed requests`,
        },
        {
          name: "Open reports",
          value: stats.openReports,
          note: stats.openReports > 0 ? "Needs your attention" : "All clear",
        },
      ]
    : []

  const max = stats
    ? Math.max(1, ...stats.bySubject.map((subject) => subject.count))
    : 1

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-mute">How StudyLink LK is doing</p>

      {error && (
        <p
          className="mt-4 rounded-xl bg-bad/15 px-4 py-2.5 text-bad"
          role="alert"
        >
          {error}
        </p>
      )}

      {stats && stats.pendingListings > 0 && (
        <Link
          to="/admin/listings"
          className="mt-5 flex items-center justify-between rounded-2xl bg-linear-to-br from-brand-1 to-brand-2 p-5 text-white shadow-lg transition hover:-translate-y-0.5"
        >
          <div>
            <p className="font-display text-xl font-bold">
              {stats.pendingListings} listing
              {stats.pendingListings > 1 ? "s are" : " is"} waiting for your
              review
            </p>
            <p className="text-sm opacity-85">
              Approve good listings so students can find their books.
            </p>
          </div>
          <span className="rounded-xl bg-white/20 px-4 py-2 font-semibold">
            Review now →
          </span>
        </Link>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!stats
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border border-line bg-card"
              />
            ))
          : tiles.map((tile) => (
              <div
                key={tile.name}
                className={`${card} relative overflow-hidden`}
              >
                <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-brand-1/25 blur-xl" />
                <p className="text-sm font-semibold text-mute">{tile.name}</p>
                <p className="mt-1 font-display text-3xl font-bold">
                  <CountUp value={tile.value} />
                </p>
                <p className="text-xs font-semibold text-ok">{tile.note}</p>
              </div>
            ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              Waiting for review
            </h2>
            <Link
              to="/admin/listings"
              className="text-sm font-semibold text-brand-2 hover:underline"
            >
              See all
            </Link>
          </div>

          {pending.length === 0 ? (
            <p className="mt-4 text-sm text-mute">
              Nothing to review right now. 🎉
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {pending.map((listing) => (
                <li key={listing._id} className="flex items-center gap-3 py-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-brand-1/15">
                    {listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BookCover
                        colorKey={listing.subject.colorKey}
                        width={28}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{listing.title}</p>
                    <p className="truncate text-xs text-mute">
                      {listing.seller.name} · {listing.district} ·{" "}
                      {formatDate(listing.createdAt)}
                    </p>
                  </div>
                  <span className="font-display font-bold">
                    {formatPrice(listing.price)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="font-display text-lg font-bold">Books by subject</h2>
          <p className="text-sm text-mute">
            Where students are selling the most
          </p>

          <div className="mt-4 space-y-3">
            {stats?.bySubject.map((subject) => (
              <div key={subject.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{subject.name}</span>
                  <span className="text-mute">{subject.count}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-bg/60">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(subject.count / max) * 100}%`,
                      background: `var(--s${subject.colorKey})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
