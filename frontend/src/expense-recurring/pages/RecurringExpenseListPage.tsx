import { RecurringList } from "../components/RecurringList"
import { RecurringSummaryCard } from "../components/RecurringSummaryCard"
import { useRecurringList } from "../hooks/useRecurringList"

export const RecurringExpenseListPage = () => {
  const { items, error, totalMonthly } = useRecurringList()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <RecurringSummaryCard totalMonthly={totalMonthly} count={items.length} />

      <RecurringList items={items} />
    </div>
  )
}
