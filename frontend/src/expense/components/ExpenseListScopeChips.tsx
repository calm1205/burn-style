import { type FilterScope, SCOPE_OPTIONS } from "../libs/expenseFilter"

interface ExpenseListScopeChipsProps {
  scope: FilterScope
  onChange: (scope: FilterScope) => void
}

export const ExpenseListScopeChips = ({ scope, onChange }: ExpenseListScopeChipsProps) => (
  <div className="flex shrink-0 gap-1.5 pt-2">
    {SCOPE_OPTIONS.map((s) => {
      const on = scope === s.scope
      return (
        <button
          key={s.scope}
          type="button"
          onClick={() => onChange(s.scope)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            on
              ? "bg-primary text-white"
              : "border border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400"
          }`}
        >
          {s.short}
        </button>
      )
    })}
  </div>
)
