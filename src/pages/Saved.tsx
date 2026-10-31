import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { loadSavedIds } from "../features/saved/savedSlice"
import type { ApiResponse, ListingSummary } from "../types/api"
import { getErrorMessage } from "../utils/errors"
import ListingCard from "../components/ListingCard"

interface SavedItem {
  savedAt: string
  listing: ListingSummary
}

export default function Saved() {
  const dispatch = useAppDispatch()
  const ids = useAppSelector((state) => state.saved.ids)

  const [items, setItems] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [idsReady, setIdsReady] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    dispatch(loadSavedIds()).finally(() => setIdsReady(true))

    api
      .get<ApiResponse<SavedItem[]>>("/saved")
      .then((response) => setItems(response.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [dispatch])

  const visible = idsReady
    ? items.filter((item) => ids.includes(item.listing._id))
    : items

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Saved books</h1>
      <p className="mt-1 text-mute">Books you saved with the ♥ button</p>

      {error && (
        <p className="mt-4 text-bad" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl border border-line bg-card"
              />
            ))
          : visible.map((item) => (
              <ListingCard key={item.listing._id} listing={item.listing} />
            ))}
      </div>

      {!loading && visible.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-10 text-center text-mute">
          You have not saved any books yet.{" "}
          <Link
            to="/browse"
            className="font-semibold text-brand-2 hover:underline"
          >
            Browse books
          </Link>
        </div>
      )}
    </div>
  )
}
