interface FilterSheetDateSectionProps {
  date: string | null
  onChange: (date: string | null) => void
}

export const FilterSheetDateSection = ({ date, onChange }: FilterSheetDateSectionProps) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Date
      </h3>
      {date && (
        <button type="button" onClick={() => onChange(null)} className="text-[11px] text-gray-400">
          clear
        </button>
      )}
    </div>
    <input
      type="date"
      value={date ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
    />
    <p className="mt-1.5 text-[11px] text-gray-400">Pinning a date overrides the period above.</p>
  </section>
)
