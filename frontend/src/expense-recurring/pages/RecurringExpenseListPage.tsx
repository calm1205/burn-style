import { PlusIcon } from "@radix-ui/react-icons"
import { Link } from "react-router"

import { RecurringDueList } from "../components/RecurringDueList"
import { RecurringFrequencyGroup } from "../components/RecurringFrequencyGroup"
import { RecurringSummaryCard } from "../components/RecurringSummaryCard"
import { useRecurringList } from "../hooks/useRecurringList"
import { FREQUENCY_OPTIONS } from "../libs/recurringFrequency"

export const RecurringExpenseListPage = () => {
  const { items, due, error, loading, totalMonthly, grouped, handleRecord } = useRecurringList()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <RecurringSummaryCard totalMonthly={totalMonthly} count={items.length} />

      <RecurringDueList due={due} loading={loading} onRecord={handleRecord} />

      <Link
        to="/expense/recurring/new"
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover"
      >
        <PlusIcon className="size-4" />
        Add recurring
      </Link>

      {FREQUENCY_OPTIONS.map((g) => (
        <RecurringFrequencyGroup key={g.key} group={g} items={grouped.get(g.key) ?? []} due={due} />
      ))}

      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No recurrings yet
        </p>
      )}
    </div>
  )
}
