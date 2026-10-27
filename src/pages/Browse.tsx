import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { loadCatalog } from "../features/catalog/catalogSlice"
import { fetchBrowse } from "../features/listings/listingsSlice"
import ListingCard from "../components/ListingCard"
import Pagination from "../components/Pagination"
import { DISTRICTS } from "../utils/constants"
import { inputClass } from "../utils/styles"

const emptyFilters = {
  q: "",
  subject: "",
  gradeLevel: "",
  condition: "",
  district: "",
  minPrice: "",
  maxPrice: "",
  free: false,
}

const readFilters = (params: URLSearchParams) => ({
  q: params.get("q") ?? "",
  subject: params.get("subject") ?? "",
  gradeLevel: params.get("gradeLevel") ?? "",
  condition: params.get("condition") ?? "",
  district: params.get("district") ?? "",
  minPrice: params.get("minPrice") ?? "",
  maxPrice: params.get("maxPrice") ?? "",
  free: params.get("free") === "true",
})

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
]

export default function Browse() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  const { subjects, gradeLevels, loaded } = useAppSelector(
    (state) => state.catalog,
  )
  const { browse, browseMeta, browseStatus } = useAppSelector(
    (state) => state.listings,
  )

  const [filters, setFilters] = useState(() => readFilters(searchParams))

  useEffect(() => {
    if (!loaded) {
      dispatch(loadCatalog())
    }
  }, [dispatch, loaded])

  useEffect(() => {
    setFilters(readFilters(searchParams))
  }, [searchParams])

  useEffect(() => {
    dispatch(
      fetchBrowse({
        ...Object.fromEntries(searchParams.entries()),
        limit: "12",
      }),
    )
  }, [dispatch, searchParams])

  const update = (field: string, value: string | boolean) => {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  const apply = (event: FormEvent) => {
    event.preventDefault()

    const next = new URLSearchParams()
    const sort = searchParams.get("sort")

    if (sort) next.set("sort", sort)

    Object.entries(filters).forEach(([key, value]) => {
      if (key === "free") {
        if (value) next.set("free", "true")
      } else if (typeof value === "string" && value.trim()) {
        next.set(key, value.trim())
      }
    })

    setSearchParams(next)
  }

  const clear = () => {
    setFilters(emptyFilters)
    setSearchParams({})
  }

  const changeSort = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set("sort", value)
    next.delete("page")
    setSearchParams(next)
  }

  const changePage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    next.set("page", String(page))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const label = "mt-4 mb-1.5 block text-sm font-bold"

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Browse books</h1>
      <p className="mt-1 text-mute">
        {browseMeta ? `${browseMeta.total} books found` : "Searching..."}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-[250px_1fr]">
        <form
          onSubmit={apply}
          className="h-fit rounded-2xl border border-line bg-card p-5 backdrop-blur md:sticky md:top-20"
        >
          <label htmlFor="q" className="mb-1.5 block text-sm font-bold">
            Search
          </label>
          <input
            id="q"
            className={inputClass}
            placeholder="Book or subject"
            value={filters.q}
            onChange={(e) => update("q", e.target.value)}
          />

          <label htmlFor="subject" className={label}>
            Subject
          </label>
          <select
            id="subject"
            className={inputClass}
            value={filters.subject}
            onChange={(e) => update("subject", e.target.value)}
          >
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>

          <label htmlFor="grade" className={label}>
            Grade level
          </label>
          <select
            id="grade"
            className={inputClass}
            value={filters.gradeLevel}
            onChange={(e) => update("gradeLevel", e.target.value)}
          >
            <option value="">All levels</option>
            {gradeLevels.map((level) => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))}
          </select>

          <label htmlFor="condition" className={label}>
            Condition
          </label>
          <select
            id="condition"
            className={inputClass}
            value={filters.condition}
            onChange={(e) => update("condition", e.target.value)}
          >
            <option value="">Any</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>

          <label htmlFor="district" className={label}>
            District
          </label>
          <select
            id="district"
            className={inputClass}
            value={filters.district}
            onChange={(e) => update("district", e.target.value)}
          >
            <option value="">All Sri Lanka</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <span className={label}>Price (Rs.)</span>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="Min"
              aria-label="Minimum price"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
            />
            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="Max"
              aria-label="Maximum price"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
            />
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={filters.free}
              onChange={(e) => update("free", e.target.checked)}
              className="h-4 w-4"
            />
            Free books only
          </label>

          <button className="mt-5 w-full rounded-xl bg-linear-to-br from-brand-1 to-brand-2 py-2.5 font-bold text-white transition hover:-translate-y-0.5 active:scale-95">
            Apply filters
          </button>
          <button
            type="button"
            onClick={clear}
            className="mt-2 w-full rounded-xl border border-line py-2.5 text-sm font-semibold hover:bg-bg"
          >
            Clear all
          </button>
        </form>

        <section>
          <div className="mb-4 flex justify-end">
            <label className="flex items-center gap-2 text-sm text-mute">
              Sort by
              <select
                className="rounded-xl border border-line bg-card px-3 py-2 text-ink"
                value={searchParams.get("sort") ?? "newest"}
                onChange={(e) => changeSort(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {browseStatus === "failed" && (
            <p className="rounded-xl bg-bad/15 p-4 text-bad" role="alert">
              Could not load the books. Please check your filters (for example
              the price range) and try again.
            </p>
          )}

          {browseStatus === "loading" && browse.length === 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl border border-line bg-card"
                />
              ))}
            </div>
          ) : (
            <div
              className={`grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 transition ${
                browseStatus === "loading" ? "opacity-50" : ""
              }`}
            >
              {browse.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}

          {browseStatus === "idle" && browse.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
              No books match your search. Try fewer filters.
            </div>
          )}

          {browseMeta && <Pagination meta={browseMeta} onChange={changePage} />}
        </section>
      </div>
    </div>
  )
}
