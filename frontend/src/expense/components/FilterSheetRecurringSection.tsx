import type { RecurringMode } from "../libs/expenseFilter"

interface FilterSheetRecurringSectionProps {
  mode: RecurringMode
  onChange: (mode: RecurringMode) => void
}

const OPTIONS: { k: RecurringMode; label: string }[] = [
  { k: "all", label: "All" },
  { k: "exclude", label: "Exclude" },
  { k: "only", label: "Only" },
]

export const FilterSheetRecurringSection = ({
  mode,
  onChange,
}: FilterSheetRecurringSectionProps) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Recurring
      </h3>
      {mode !== "all" && (
        <button type="button" onClick={() => onChange("all")} className="text-[11px] text-gray-400">
          clear
        </button>
      )}
    </div>
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const on = mode === o.k
        return (
          <button
            key={o.k}
            type="button"
            onClick={() => onChange(o.k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              on
                ? "border-primary bg-primary text-white"
                : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  </section>
)
