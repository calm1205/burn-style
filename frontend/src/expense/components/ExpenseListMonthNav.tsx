import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"

import { formatMonthKey, parseMonthKey, shiftMonthKey } from "../libs/expenseFilter"

interface ExpenseListMonthNavProps {
  month: string | null
  onChange: (month: string | null) => void
}

const monthLabel = (key: string): string => {
  const parsed = parseMonthKey(key)
  if (!parsed) return key
  return `${parsed.year}/${parsed.month + 1}`
}

export const ExpenseListMonthNav = ({ month, onChange }: ExpenseListMonthNavProps) => {
  const now = new Date()
  const currentKey = formatMonthKey(now.getFullYear(), now.getMonth())
  const activeKey = month ?? currentKey

  const go = (delta: number) => {
    const next = shiftMonthKey(activeKey, delta)
    onChange(next === currentKey ? null : next)
  }

  return (
    <div className="flex shrink-0 items-center justify-between pt-2">
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous month"
        className="flex size-7 items-center justify-center rounded-full text-gray-500 dark:text-gray-400"
      >
        <ChevronLeftIcon className="size-4" />
      </button>
      <span className="text-xs font-bold tracking-widest text-gray-600 uppercase dark:text-gray-300">
        {monthLabel(activeKey)}
      </span>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next month"
        className="flex size-7 items-center justify-center rounded-full text-gray-500 dark:text-gray-400"
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  )
}
