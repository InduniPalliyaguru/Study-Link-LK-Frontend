import { useEffect, useState } from "react"
import { api } from "../../services/api"
import type {
  AnalyticsData,
  ApiResponse,
  DashboardStats,
} from "../../types/api"
import { getErrorMessage } from "../../utils/errors"
import { formatPrice } from "../../utils/format"
import { downloadReport } from "../../utils/report"
import MonthlyChart from "../../components/MonthlyChart"

const card = "rounded-2xl border border-line bg-card p-5 backdrop-blur"

const statusColor: Record<string, string> = {
  pending: "var(--acc)",
  accepted: "var(--b2)",
  shipped: "var(--b2)",
  completed: "var(--ok)",
  rejected: "var(--bad)",
  cancelled: "var(--mute)",
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState("")
  const [making, setMaking] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<AnalyticsData>>("/admin/analytics"),
      api.get<ApiResponse<DashboardStats>>("/admin/stats"),
    ])
      .then(([analytics, dashboard]) => {
        setData(analytics.data.data)
        setStats(dashboard.data.data)
      })
      .catch((err) => setError(getErrorMessage(err)))
  }, [])

  const makeReport = async () => {
    if (!data || !stats) {
      return
    }

    setMaking(true)

    try {
      await downloadReport(stats, data)
    } catch {
      setError("Could not create the PDF report. Please try again")
    } finally {
      setMaking(false)
    }
  }

  const districtMax = data
    ? Math.max(1, ...data.districts.map((district) => district.count))
    : 1
  const subjectMax = data
    ? Math.max(
        1,
        ...data.subjects.flatMap((subject) => [subject.supply, subject.demand]),
      )
    : 1
  const requestTotal = data
    ? data.requestStatus.reduce((sum, row) => sum + row.count, 0)
    : 0
  const topDemand = data
    ? [...data.subjects].sort((a, b) => b.demand - a.demand)[0]
    : undefined

  const tiles = data
    ? [
        { name: "Average price", value: formatPrice(data.kpis.averagePrice) },
        { name: "Free books", value: String(data.kpis.freeBooks) },
        { name: "Written with AI", value: `${data.kpis.aiShare}%` },
        { name: "Confirmed sales", value: `${data.kpis.verifiedShare}%` },
      ]
    : []

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="mt-1 text-mute">
            What students are selling and asking for
          </p>
        </div>

        <button
          onClick={makeReport}
          disabled={!data || !stats || making}
          className="rounded-xl bg-linear-to-br from-brand-1 to-brand-2 px-5 py-2.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
        >
          {making ? "Creating PDF..." : "⬇ Download PDF report"}
        </button>
      </div>

      {error && (
        <p
          className="mt-4 rounded-xl bg-bad/15 px-4 py-2.5 text-bad"
          role="alert"
        >
          {error}
        </p>
      )}

      {!data ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border border-line bg-card"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {tiles.map((tile) => (
              <div key={tile.name} className={card}>
                <p className="text-sm font-semibold text-mute">{tile.name}</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {tile.value}
                </p>
              </div>
            ))}
          </div>

          {topDemand && topDemand.demand > 0 && (
            <p className="mt-4 rounded-xl bg-brand-1/15 px-4 py-3 text-sm">
              💡 <b>{topDemand.name}</b> is the most requested subject (
              {topDemand.demand} requests) while {topDemand.supply} book(s) are
              available.
            </p>
          )}

          <section className={`${card} mt-5`}>
            <h2 className="font-display text-lg font-bold">
              Activity in the last 6 months
            </h2>
            <div className="mt-1 flex gap-4 text-xs text-mute">
              <span>
                <i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-brand-1" />
                New listings
              </span>
              <span>
                <i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-ok" />
                Books sold
              </span>
            </div>
            <div className="mt-3">
              <MonthlyChart data={data.months} />
            </div>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className={card}>
              <h2 className="font-display text-lg font-bold">
                Subjects: available books and requests
              </h2>
              <div className="mt-4 space-y-4">
                {data.subjects.map((subject) => (
                  <div key={subject.name}>
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <i
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: `var(--s${subject.colorKey})` }}
                      />
                      {subject.name}
                    </p>
                    {[
                      {
                        label: "Available",
                        value: subject.supply,
                        color: "var(--b1)",
                      },
                      {
                        label: "Requests",
                        value: subject.demand,
                        color: "var(--b2)",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="mt-1 flex items-center gap-2 text-xs text-mute"
                      >
                        <span className="w-16">{row.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg/60">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${(row.value / subjectMax) * 100}%`,
                              background: row.color,
                            }}
                          />
                        </div>
                        <span className="w-6 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-5">
              <section className={card}>
                <h2 className="font-display text-lg font-bold">
                  Top districts
                </h2>
                {data.districts.length === 0 ? (
                  <p className="mt-3 text-sm text-mute">No books yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {data.districts.map((district) => (
                      <div key={district.name}>
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold">{district.name}</span>
                          <span className="text-mute">{district.count}</span>
                        </div>
                        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-bg/60">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-brand-1 to-brand-2 transition-all duration-1000"
                            style={{
                              width: `${(district.count / districtMax) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className={card}>
                <h2 className="font-display text-lg font-bold">
                  Requests by status
                </h2>
                {requestTotal === 0 ? (
                  <p className="mt-3 text-sm text-mute">No requests yet.</p>
                ) : (
                  <>
                    <div
                      className="mt-4 flex h-5 overflow-hidden rounded-full bg-bg/60"
                      role="img"
                      aria-label="Requests by status"
                    >
                      {data.requestStatus.map((row) => (
                        <div
                          key={row.status}
                          title={`${row.status}: ${row.count}`}
                          style={{
                            width: `${(row.count / requestTotal) * 100}%`,
                            background:
                              statusColor[row.status] ?? "var(--mute)",
                          }}
                        />
                      ))}
                    </div>
                    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {data.requestStatus.map((row) => (
                        <li
                          key={row.status}
                          className="flex items-center gap-2"
                        >
                          <i
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              background:
                                statusColor[row.status] ?? "var(--mute)",
                            }}
                          />
                          <span className="capitalize">{row.status}</span>
                          <span className="ml-auto text-mute">{row.count}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
