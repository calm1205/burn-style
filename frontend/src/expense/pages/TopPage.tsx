import { useNavigate } from "react-router"

import { TopHeatmap } from "../components/TopHeatmap"
import { TopMomentsList } from "../components/TopMomentsList"
import { TopMonthSummary } from "../components/TopMonthSummary"
import { useTopMonth } from "../hooks/useTopMonth"

const pad = (n: number) => String(n).padStart(2, "0")

const monthLabel = (year: number, month: number): string =>
  new Date(year, month - 1, 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase()

export const TopPage = () => {
  const navigate = useNavigate()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const today = now.getDate()
  const daysInMonth = new Date(year, month, 0).getDate()

  const { error, totals, total, perDay, monthExpenses } = useTopMonth(
    year,
    month,
    today,
    daysInMonth,
  )

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden px-6">
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="shrink-0 pt-1">
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          {monthLabel(year, month)}
        </span>
      </div>

      <div className="shrink-0 pt-4">
        <TopHeatmap
          year={year}
          month={month}
          today={today}
          totals={totals}
          onSelectDay={(day) => navigate(`/expense/monthly?date=${year}-${pad(month)}-${pad(day)}`)}
        />
      </div>

      <TopMonthSummary total={total} perDay={perDay} />

      <div className="mt-5 mb-1.5 flex shrink-0 items-baseline justify-between">
        <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Latest moments
        </span>
        <button
          type="button"
          onClick={() => navigate("/expense/monthly")}
          className="text-xs font-semibold text-primary"
        >
          All →
        </button>
      </div>

      <TopMomentsList expenses={monthExpenses} />
    </div>
  )
}
