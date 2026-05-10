import type { CategoryResponse } from "../../common/libs/types"
import { type ExpenseFilter, parseDateKey } from "../libs/expenseFilter"

interface ExpenseFilterChipsProps {
  filter: ExpenseFilter
  categories: CategoryResponse[]
  onOpen: () => void
  onClear: () => void
}

const formatDateChip = (key: string): string => {
  const d = parseDateKey(key)
  if (!d) return key
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const ExpenseFilterChips = ({
  filter,
  categories,
  onOpen,
  onClear,
}: ExpenseFilterChipsProps) => {
  const labels: string[] = []
  if (filter.q) labels.push(`"${filter.q}"`)
  if (filter.date) labels.push(formatDateChip(filter.date))
  for (const uuid of filter.categoryUuids) {
    const c = categories.find((x) => x.uuid === uuid)
    if (c) labels.push(c.name)
  }
  if (filter.min > 0 || filter.max > 0) {
    labels.push(
      filter.max
        ? `¥${filter.min.toLocaleString()}–${filter.max.toLocaleString()}`
        : `¥${filter.min.toLocaleString()}+`,
    )
  }

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
