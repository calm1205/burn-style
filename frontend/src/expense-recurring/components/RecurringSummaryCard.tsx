interface RecurringSummaryCardProps {
  totalMonthly: number
  count: number
}

export const RecurringSummaryCard = ({ totalMonthly, count }: RecurringSummaryCardProps) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
    <div className="text-xs text-gray-500 dark:text-gray-400">Every month</div>
    <div className="mt-1 text-3xl font-light tracking-tight">
      ¥{totalMonthly.toLocaleString("en-US")}
    </div>
    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      {count} {count === 1 ? "recurring" : "recurrings"}
    </div>
  </div>
)
