import { useState } from "react"

import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { useFilteredExpenses } from "../hooks/useFilteredExpenses"
import {
  applyPeriodPreset,
  calendarMonthDateRange,
  type ExpenseFilter,
  filterCount,
} from "../libs/expenseFilter"
import { createDefaultMonthExpenseFilter } from "../libs/expenseFilterQuery"
import { ExpenseFilterChips } from "./ExpenseFilterChips"
import { ExpenseFilterSheet } from "./ExpenseFilterSheet"
import { ExpenseFlatList } from "./ExpenseFlatList"
import { ExpenseListFilterButton } from "./ExpenseListFilterButton"
import { ExpenseListMonthNav } from "./ExpenseListMonthNav"
import { ExpenseListScopeChips } from "./ExpenseListScopeChips"

interface ExpenseListProps {
  expenses: ExpenseResponse[]
  categories?: CategoryResponse[]
  filter: ExpenseFilter
  onFilterChange: (filter: ExpenseFilter) => void
}

export const ExpenseList = ({
  expenses,
  categories = [],
  filter,
  onFilterChange,
}: ExpenseListProps) => {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { usedCategories, filtered, total } = useFilteredExpenses(expenses, filter, categories)
  const activeFilterCount = filterCount(filter)

  const onMonthChange = (month: string | null) => {
    const range = calendarMonthDateRange(month)
    onFilterChange({
      ...filter,
      scope: "month",
      month,
      dateStart: range.start,
      dateEnd: range.end,
    })
  }

  return (
    <>
      <div className="flex shrink-0 items-center pt-2">
        <span className="text-2xl font-bold tabular-nums">¥{total.toLocaleString()}</span>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2">
        <ExpenseListScopeChips
          scope={filter.scope}
          onChange={(scope) => onFilterChange(applyPeriodPreset(filter, scope))}
        />
        <ExpenseListFilterButton
          filterCount={activeFilterCount}
          onClick={() => setSheetOpen(true)}
        />
      </div>

      {filter.scope === "month" && (
        <ExpenseListMonthNav month={filter.month} onChange={onMonthChange} />
      )}

      <ExpenseFilterChips
        filter={filter}
        categories={usedCategories}
        onOpen={() => setSheetOpen(true)}
        onClear={() => onFilterChange(createDefaultMonthExpenseFilter())}
      />

      <ExpenseFlatList
        expenses={filtered}
        categories={categories}
        emptyLabel={expenses.length === 0 ? "No expenses yet" : "No matches for this filter"}
      />

      <ExpenseFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filter={filter}
        onApply={onFilterChange}
        categories={usedCategories}
      />
    </>
  )
}
