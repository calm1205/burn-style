import { ChevronRightIcon } from "@radix-ui/react-icons"
import { useNavigate } from "react-router"

import { categoryGlyph } from "../../common/libs/category"
import type { RecurringExpenseDueResponse, RecurringExpenseResponse } from "../../common/libs/types"
import { matchFrequency, PERIOD_LABEL } from "../libs/recurringFrequency"

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const nextDueOf = (
  r: RecurringExpenseResponse,
  due: RecurringExpenseDueResponse[],
): string | null => {
  const d = due.find((x) => x.uuid === r.uuid)
  return d && d.missed_dates.length > 0 ? d.missed_dates[0] : null
}

interface RecurringListProps {
  items: RecurringExpenseResponse[]
  due: RecurringExpenseDueResponse[]
}

export const RecurringList = ({ items, due }: RecurringListProps) => {
  const navigate = useNavigate()
  if (items.length === 0) return null

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {items.map((r) => {
          const next = nextDueOf(r, due)
          const periodKey = matchFrequency(r.interval_unit, r.interval_count)
          return (
            <button
              key={r.uuid}
              type="button"
              onClick={() => navigate(`/expense/recurring/${r.uuid}`)}
              className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>{categoryGlyph(r.category)}</span>
                  <span>{r.name}</span>
                </div>
                {next && (
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    next {formatDate(next)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">¥{r.amount.toLocaleString("en-US")}</div>
                <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {PERIOD_LABEL[periodKey]}
                </div>
              </div>
              <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
