interface TopMonthSummaryProps {
  total: number
  perDay: number
}

export const TopMonthSummary = ({ total, perDay }: TopMonthSummaryProps) => (
  <div className="mt-6 shrink-0 border-b border-gray-200 pb-4 dark:border-gray-700">
    <div className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
      Burned this month
    </div>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-4xl font-bold tracking-tight tabular-nums">
        ¥{total.toLocaleString()}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        · ¥{perDay.toLocaleString()}/day
      </span>
    </div>
  </div>
)
