interface RecurringSummaryCardProps {
  totalMonthly: number
}

export const RecurringSummaryCard = ({ totalMonthly }: RecurringSummaryCardProps) => (
  <div className="p-6">
    <div className="text-xs text-gray-500 dark:text-gray-400">Every month</div>
    <div className="mt-1 text-3xl font-light tracking-tight">
      ¥{totalMonthly.toLocaleString("en-US")}
    </div>
  </div>
)
