import type { CategoryResponse } from "../../common/libs/types"
import { type ExpenseFilter, parseDateKey } from "../libs/expenseFilter"

interface ExpenseFilterChipsProps {
  filter: ExpenseFilter
  categories: CategoryResponse[]
  onOpen: () => void
  onClear: () => void
}

const formatDay = (key: string): string => {
  const d = parseDateKey(key)
  if (!d) return key
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const formatDateRangeChip = (start: string | null, end: string | null): string | null => {
  if (start && end)
    return start === end ? formatDay(start) : `${formatDay(start)} – ${formatDay(end)}`
  if (start) return `From ${formatDay(start)}`
  if (end) return `Until ${formatDay(end)}`
  return null
}

export const ExpenseFilterChips = ({
  filter,
  categories,
  onOpen,
  onClear,
}: ExpenseFilterChipsProps) => {
  const labels: string[] = []
  if (filter.searchQuery) labels.push(`"${filter.searchQuery}"`)
  const dateChip = formatDateRangeChip(filter.dateStart, filter.dateEnd)
  if (dateChip) labels.push(dateChip)
  for (const uuid of filter.categoryUuids) {
    const c = categories.find((x) => x.uuid === uuid)
    if (c) labels.push(c.name)
  }
  if (filter.amountMin > 0 || filter.amountMax > 0) {
    labels.push(
      filter.amountMax
        ? `¥${filter.amountMin.toLocaleString()}–${filter.amountMax.toLocaleString()}`
        : `¥${filter.amountMin.toLocaleString()}+`,
    )
  }
  if (filter.recurringMode === "exclude") labels.push("No recurring")
  if (filter.recurringMode === "only") labels.push("Recurring only")

  if (labels.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-2">
      {labels.map((l, i) => (
        <button
          key={i}
          type="button"
          onClick={onOpen}
          className="rounded-xl bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
        >
          {l}
        </button>
      ))}
      <button type="button" onClick={onClear} className="px-1.5 py-1 text-[11px] text-gray-400">
        clear all
      </button>
    </div>
  )
}
