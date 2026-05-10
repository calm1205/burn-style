import type { RecurringExpenseDueResponse } from "../../common/libs/types"

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface RecurringDueListProps {
  due: RecurringExpenseDueResponse[]
  loading: boolean
  onRecord: (uuid: string, missedCount: number) => void
}

export const RecurringDueList = ({ due, loading, onRecord }: RecurringDueListProps) => {
  if (due.length === 0) return null

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
        Coming up
      </div>
      <div className="flex flex-col gap-3">
        {due.map((d) => (
          <button
            key={d.uuid}
            type="button"
            onClick={() => onRecord(d.uuid, d.missed_count)}
            disabled={loading}
            className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-left hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <div className="flex flex-1 flex-col">
              <div className="text-sm font-medium">{d.name}</div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {d.missed_count > 1
                  ? `${d.missed_count} unrecorded · oldest ${formatDate(d.missed_dates[0])}`
                  : `due ${formatDate(d.missed_dates[0])}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">¥{d.amount.toLocaleString("en-US")}</div>
              <div className="mt-0.5 text-xs text-primary">Tap to record</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
