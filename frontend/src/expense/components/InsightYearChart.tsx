import { InsightYearChartSvg } from "./InsightYearChartSvg"

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
      <InsightYearChartSvg year={year} yMax={yMax} avg={avg} />
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
