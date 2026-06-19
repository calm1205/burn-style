import { type FilterScope, SCOPE_OPTIONS } from "../libs/expenseFilter"

interface FilterSheetScopeSectionProps {
  scope: FilterScope
  onChange: (scope: FilterScope) => void
}

export const FilterSheetScopeSection = ({ scope, onChange }: FilterSheetScopeSectionProps) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Period
      </h3>
      {scope !== "month" && (
        <button
          type="button"
          onClick={() => onChange("month")}
          className="text-[11px] text-gray-400"
        >
          clear
        </button>
      )}
    </div>
    <div className="flex flex-wrap gap-2">
      {SCOPE_OPTIONS.map((s) => {
        const on = scope === s.k
        return (
          <button
            key={s.k}
            type="button"
            onClick={() => onChange(s.k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              on
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  </section>
)
