import { useState } from "react"

import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import { useFilteredExpenses } from "../hooks/useFilteredExpenses"
import { createDefaultExpenseFilter, type ExpenseFilter, filterCount } from "../libs/expenseFilter"
import { ExpenseFilterChips } from "./ExpenseFilterChips"
import { ExpenseFilterSheet } from "./ExpenseFilterSheet"
import { ExpenseFlatList } from "./ExpenseFlatList"
import { ExpenseListFilterButton } from "./ExpenseListFilterButton"
import { ExpenseListMonthNav } from "./ExpenseListMonthNav"
import { ExpenseListScopeChips } from "./ExpenseListScopeChips"

interface ExpenseListProps {
  expenses: ExpenseResponse[]
  categories?: CategoryResponse[]
  initialFilter?: ExpenseFilter
}

export const ExpenseList = ({ expenses, categories = [], initialFilter }: ExpenseListProps) => {
  const [filter, setFilter] = useState<ExpenseFilter>(initialFilter ?? createDefaultExpenseFilter())
  const [sheetOpen, setSheetOpen] = useState(false)
  const { usedCategories, filtered, total } = useFilteredExpenses(expenses, filter, categories)
  const activeFilterCount = filterCount(filter)

  return (
    <>
      <div className="flex shrink-0 items-center pt-2">
        <span className="text-2xl font-bold tabular-nums">¥{total.toLocaleString()}</span>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2">
        <ExpenseListScopeChips
          scope={filter.scope}
          onChange={(scope) => setFilter({ ...filter, scope, month: null })}
        />
        <ExpenseListFilterButton
          filterCount={activeFilterCount}
          onClick={() => setSheetOpen(true)}
        />
      </div>

      {filter.scope === "month" && (
        <ExpenseListMonthNav
          month={filter.month}
          onChange={(month) => setFilter({ ...filter, month })}
        />
      )}

      <ExpenseFilterChips
        filter={filter}
        categories={usedCategories}
        onOpen={() => setSheetOpen(true)}
        onClear={() => setFilter(createDefaultExpenseFilter())}
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
        onApply={setFilter}
        categories={usedCategories}
      />
    </>
  )
}
