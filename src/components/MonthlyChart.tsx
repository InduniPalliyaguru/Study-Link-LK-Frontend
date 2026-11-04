import type { AnalyticsData } from "../types/api"

interface MonthlyChartProps {
  data: AnalyticsData["months"]
}

const W = 600
const H = 240
const PAD = { left: 34, right: 8, top: 12, bottom: 28 }

export default function MonthlyChart({ data }: MonthlyChartProps) {
  const max = Math.max(
    4,
    ...data.flatMap((month) => [month.listings, month.sold]),
  )
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const group = innerW / data.length
  const bar = Math.min(24, group / 3)

  const y = (value: number) => PAD.top + innerH - (value / max) * innerH
  const ticks = [
    ...new Set([0, 0.25, 0.5, 0.75, 1].map((step) => Math.round(max * step))),
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="New listings and books sold in the last 6 months"
      className="w-full"
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--line)"
          />
          <text
            x={PAD.left - 6}
            y={y(tick) + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--mute)"
          >
            {tick}
          </text>
        </g>
      ))}

      {data.map((month, index) => {
        const center = PAD.left + index * group + group / 2

        return (
          <g key={month.label}>
            <rect
              x={center - bar - 2}
              y={y(month.listings)}
              width={bar}
              height={PAD.top + innerH - y(month.listings)}
              rx="4"
              fill="var(--b1)"
              className="bar-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <title>{`${month.label}: ${month.listings} new listings`}</title>
            </rect>
            <rect
              x={center + 2}
              y={y(month.sold)}
              width={bar}
              height={PAD.top + innerH - y(month.sold)}
              rx="4"
              fill="var(--ok)"
              className="bar-up"
              style={{ animationDelay: `${index * 80 + 40}ms` }}
            >
              <title>{`${month.label}: ${month.sold} books sold`}</title>
            </rect>
            <text
              x={center}
              y={H - 8}
              textAnchor="middle"
              fontSize="12"
              fill="var(--mute)"
            >
              {month.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
