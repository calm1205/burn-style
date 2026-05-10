export interface YearMonth {
  key: string
  label: string
  year: number
  month: number
  amount: number
  current: boolean
}

interface InsightYearChartProps {
  year: YearMonth[]
}

export const InsightYearChart = ({ year }: InsightYearChartProps) => {
  const yMax = Math.max(...year.map((d) => d.amount), 1) * 1.05
  const total = year.reduce((s, d) => s + d.amount, 0)
  const avg = Math.round(total / year.length)
  const peak = year.reduce((max, d) => (d.amount > max.amount ? d : max), year[0])
  const W = 340
  const H = 160
  const pad = 24
  const xAt = (i: number) => pad + (i / (year.length - 1)) * (W - pad * 2)
  const yAt = (v: number) => H - 26 - (v / yMax) * (H - 50)
  const linePath = year.map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(d.amount)}`).join(" ")
  const areaPath = `${linePath} L ${xAt(year.length - 1)} ${H - 26} L ${pad} ${H - 26} Z`

  return (
    <div>
      <div className="flex items-baseline gap-2 px-2 pb-1">
        <span className="text-xl font-bold tracking-tight tabular-nums">
          {`¥${(total / 1000).toFixed(1)}k`}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          total · ¥{avg.toLocaleString()}/mo avg
        </span>
      </div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-1.5 block"
      >
        <line
          x1={pad}
          x2={W - pad}
          y1={yAt(avg)}
          y2={yAt(avg)}
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="3 3"
          opacity="0.3"
        />
        <path d={areaPath} fill="var(--color-primary)" fillOpacity="0.14" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {year.map((d, i) => {
          const cw = ((W - pad * 2) / year.length) * 0.55
          const x = xAt(i) - cw / 2
          const y = yAt(d.amount)
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={cw}
              height={H - 26 - y}
              fill="var(--color-primary)"
              fillOpacity={d.current ? 0.85 : 0.28}
              rx="2"
            />
          )
        })}
        {year.map((d, i) => (
          <circle
            key={`p${i}`}
            cx={xAt(i)}
            cy={yAt(d.amount)}
            r={d.current ? 3.5 : 2}
            fill={d.current ? "var(--color-primary)" : "#ffffff"}
            stroke="var(--color-primary)"
            strokeWidth="1.2"
          />
        ))}
        {year.map((d, i) => (
          <text
            key={`l${i}`}
            x={xAt(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="9"
            fill="currentColor"
            opacity={d.current ? 1 : 0.5}
            fontWeight={d.current ? 700 : 500}
            fontFamily="inherit"
          >
            {d.label}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3.5 bg-primary opacity-50" />
          monthly avg ¥{avg.toLocaleString()}
        </span>
        <span className="tabular-nums">
          peak ¥{Math.round(peak.amount).toLocaleString()} · {peak.label}
        </span>
      </div>
    </div>
  )
}
