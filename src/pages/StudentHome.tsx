import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { loadCatalog } from "../features/catalog/catalogSlice"
import { fetchLatest } from "../features/listings/listingsSlice"
import BookArt from "../components/BookArt"
import ListingCard from "../components/ListingCard"

export default function StudentHome() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const user = useAppSelector((state) => state.auth.user)
  const { subjects, loaded } = useAppSelector((state) => state.catalog)
  const { latest, latestStatus } = useAppSelector((state) => state.listings)

  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!loaded) {
      dispatch(loadCatalog())
    }
    dispatch(fetchLatest())
  }, [dispatch, loaded])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div>
      <section className="grid items-center gap-6 overflow-hidden rounded-3xl border border-line bg-linear-to-br from-brand-1/30 to-brand-2/15 p-7 md:grid-cols-[1.1fr_0.9fr] md:p-10">
        <div>
          <p className="text-sm font-semibold text-mute">
            Hello, {user?.name.split(" ")[0]} 👋
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight md:text-5xl">
            Pass your books on.
            <br />
            <span className="bg-linear-to-r from-brand-1 to-brand-2 bg-clip-text text-transparent">
              Find the next one.
            </span>
          </h1>
          <p className="mt-3 max-w-md text-mute">
            Buy and sell used textbooks, notes and past papers with students
            across Sri Lanka.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-5 flex max-w-lg gap-2 rounded-2xl border border-line bg-card p-1.5 backdrop-blur"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a book, subject or grade"
              aria-label="Search books"
              className="min-w-0 flex-1 bg-transparent px-3 outline-none"
            />
            <button className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-5 py-2.5 font-bold text-white transition hover:-translate-y-0.5 active:scale-95">
              Search
            </button>
          </form>
        </div>

        <div className="hidden justify-self-center md:block">
          <BookArt />
        </div>
      </section>

      <div className="mt-5 flex gap-2.5 overflow-x-auto pb-1">
        {subjects.map((subject) => (
          <Link
            key={subject._id}
            to={`/browse?subject=${subject._id}`}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand-1"
          >
            <i
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: `var(--s${subject.colorKey})` }}
            />
            {subject.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold">Fresh on StudyLink</h2>
        <Link
          to="/browse"
          className="text-sm font-semibold text-brand-2 hover:underline"
        >
          See all
        </Link>
      </div>

      {latestStatus === "failed" && (
        <p className="mt-4 text-bad" role="alert">
          Could not load the books. Please check the server and try again.
        </p>
      )}

      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {latestStatus === "loading" && latest.length === 0
          ? Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl border border-line bg-card"
              />
            ))
          : latest.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
      </div>

      {latestStatus === "idle" && latest.length === 0 && (
        <p className="mt-4 text-mute">
          No books yet. Be the first to list one!
        </p>
      )}
    </div>
  )
}
