interface FilterSheetDateSectionProps {
  start: string | null
  end: string | null
  onStartChange: (v: string | null) => void
  onEndChange: (v: string | null) => void
}

const inputClass =
  "min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"

export const FilterSheetDateSection = ({
  start,
  end,
  onStartChange,
  onEndChange,
}: FilterSheetDateSectionProps) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Date range
      </h3>
      {(start || end) && (
        <button
          type="button"
          onClick={() => {
            onStartChange(null)
            onEndChange(null)
          }}
          className="text-[11px] text-gray-400"
        >
          clear
        </button>
      )}
    </div>
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={start ?? ""}
        max={end ?? undefined}
        onChange={(e) => onStartChange(e.target.value || null)}
        className={inputClass}
      />
      <span className="shrink-0 text-gray-400">—</span>
      <input
        type="date"
        value={end ?? ""}
        min={start ?? undefined}
        onChange={(e) => onEndChange(e.target.value || null)}
        className={inputClass}
      />
    </div>
    <p className="mt-1.5 text-[11px] text-gray-400">Setting a range overrides the period above.</p>
  </section>
)
