import { useState } from "react"

import type { ExpenseResponse } from "../../common/libs/types"
import { useFilteredExpenses } from "../hooks/useFilteredExpenses"
import { defaultFilter, type ExpenseFilter, filterCount } from "../libs/expenseFilter"
import { ExpenseFilterChips } from "./ExpenseFilterChips"
import { ExpenseFilterSheet } from "./ExpenseFilterSheet"
import { ExpenseListDayGroup } from "./ExpenseListDayGroup"
import { ExpenseListScopeChips } from "./ExpenseListScopeChips"
import { ExpenseListSearchBar } from "./ExpenseListSearchBar"

interface ExpenseListProps {
  expenses: ExpenseResponse[]
  initialFilter?: ExpenseFilter
}

export const ExpenseList = ({ expenses, initialFilter }: ExpenseListProps) => {
  const [filter, setFilter] = useState<ExpenseFilter>(initialFilter ?? defaultFilter())
  const [sheetOpen, setSheetOpen] = useState(false)
  const { usedCategories, filtered, groups, total } = useFilteredExpenses(expenses, filter)
  const fcount = filterCount(filter)

  return (
    <>
      <div className="flex shrink-0 items-baseline justify-between pt-2">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          Total
        </span>
        <span className="text-2xl font-bold tabular-nums">¥{total.toLocaleString()}</span>
      </div>

      <ExpenseListSearchBar
        query={filter.q}
        filterCount={fcount}
        onQueryChange={(v) => setFilter({ ...filter, q: v })}
        onOpenFilter={() => setSheetOpen(true)}
      />

      <ExpenseListScopeChips
        scope={filter.scope}
        onChange={(scope) => setFilter({ ...filter, scope })}
      />

      <ExpenseFilterChips
        filter={filter}
        categories={usedCategories}
        onOpen={() => setSheetOpen(true)}
        onClear={() => setFilter(defaultFilter())}
      />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          {expenses.length === 0 ? "No expenses yet" : "No matches for this filter"}
        </p>
      ) : (
        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pt-2">
          {groups.map((g) => (
            <ExpenseListDayGroup key={g.key} label={g.label} total={g.total} items={g.items} />
          ))}
        </div>
      )}

      <ExpenseFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filter={filter}
        onApply={setFilter}
        categories={usedCategories}
      />
    </>
  )
}
