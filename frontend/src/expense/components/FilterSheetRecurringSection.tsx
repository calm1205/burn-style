interface FilterSheetRecurringSectionProps {
  includeRecurring: boolean
  onChange: (include: boolean) => void
}

const OPTIONS: { include: boolean; label: string }[] = [
  { include: true, label: "Include" },
  { include: false, label: "Exclude" },
]

export const FilterSheetRecurringSection = ({
  includeRecurring,
  onChange,
}: FilterSheetRecurringSectionProps) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Recurring
      </h3>
      {!includeRecurring && (
        <button type="button" onClick={() => onChange(true)} className="text-[11px] text-gray-400">
          clear
        </button>
      )}
    </div>
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const on = includeRecurring === o.include
        return (
          <button
            key={String(o.include)}
            type="button"
            onClick={() => onChange(o.include)}
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
