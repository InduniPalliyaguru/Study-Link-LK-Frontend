import { useCallback, useEffect, useState } from "react"
import { api } from "../services/api"
import type { ApiResponse, RequestItem } from "../types/api"
import { getErrorMessage } from "../utils/errors"
import { BuyerCard, SellerCard } from "../components/RequestCards"
import type { RequestActions } from "../components/RequestCards"

type Tab = "received" | "sent"

export default function Requests() {
  const [tab, setTab] = useState<Tab>("received")
  const [received, setReceived] = useState<RequestItem[]>([])
  const [sent, setSent] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [codes, setCodes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
        api.get<ApiResponse<RequestItem[]>>("/requests/received"),
        api.get<ApiResponse<RequestItem[]>>("/requests/sent"),
      ])

      setReceived(receivedResponse.data.data)
      setSent(sentResponse.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const run = async (task: () => Promise<void>, success: string) => {
    setError("")
    setNotice("")

    try {
      await task()
      setNotice(success)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const rememberCode = (id: string, code?: string) => {
    if (code) {
      setCodes((current) => ({ ...current, [id]: code }))
    }
  }

  const actions: RequestActions = {
    respond: (id, decision) =>
      run(
        async () => {
          const response = await api.patch<
            ApiResponse<{ handoverCode?: string }>
          >(`/requests/${id}/respond`, { decision })
          rememberCode(id, response.data.data.handoverCode)
        },
        decision === "accept"
          ? "Request accepted. The buyer can now see your contact details"
          : "Request rejected",
      ),

    cancel: (id) =>
      run(async () => {
        await api.patch(`/requests/${id}/cancel`)
      }, "Request cancelled"),

    ship: (id, trackingNumber) =>
      run(async () => {
        await api.patch(
          `/requests/${id}/ship`,
          trackingNumber ? { trackingNumber } : {},
        )
      }, "Marked as shipped. The buyer will confirm when it arrives"),

    confirm: (id, code) =>
      run(async () => {
        await api.patch(`/requests/${id}/confirm`, code ? { code } : {})
      }, "Receipt confirmed. The sale is complete"),

    regenerate: (id) =>
      run(async () => {
        const response = await api.post<ApiResponse<{ handoverCode?: string }>>(
          `/requests/${id}/regenerate-code`,
        )
        rememberCode(id, response.data.data.handoverCode)
      }, "New handover code generated. The old one no longer works"),

    completeManually: (id) =>
      run(async () => {
        await api.patch(`/requests/${id}/complete`)
      }, "Marked as sold"),
  }

  const pendingCount = received.filter(
    (item) => item.status === "pending",
  ).length
  const list = tab === "received" ? received : sent

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Requests</h1>
      <p className="mt-1 text-mute">
        Books you asked for, and requests on your books
      </p>

      <div
        className="mt-5 inline-flex gap-1 rounded-full border border-line bg-card p-1 text-sm font-semibold"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={tab === "received"}
          onClick={() => setTab("received")}
          className={`rounded-full px-5 py-2 transition ${
            tab === "received"
              ? "bg-linear-to-br from-brand-1 to-brand-2 text-white"
              : "text-mute hover:text-ink"
          }`}
        >
          On my books ({received.length})
          {pendingCount > 0 && (
            <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-black/80">
              {pendingCount} new
            </span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={tab === "sent"}
          onClick={() => setTab("sent")}
          className={`rounded-full px-5 py-2 transition ${
            tab === "sent"
              ? "bg-linear-to-br from-brand-1 to-brand-2 text-white"
              : "text-mute hover:text-ink"
          }`}
        >
          I sent ({sent.length})
        </button>
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

      <div className="mt-4 space-y-3">
        {loading &&
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-line bg-card"
            />
          ))}

        {!loading && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">
            {tab === "received"
              ? "No one has requested your books yet."
              : "You have not requested any books yet."}
          </div>
        )}

        {tab === "received"
          ? received.map((item) => (
              <SellerCard
                key={item._id}
                item={item}
                code={codes[item._id]}
                actions={actions}
              />
            ))
          : sent.map((item) => (
              <BuyerCard key={item._id} item={item} actions={actions} />
            ))}
      </div>
    </div>
  )
}
