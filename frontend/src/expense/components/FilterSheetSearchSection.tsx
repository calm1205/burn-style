interface FilterSheetSearchSectionProps {
  value: string
  onChange: (v: string) => void
}

export const FilterSheetSearchSection = ({ value, onChange }: FilterSheetSearchSectionProps) => (
  <section>
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Search
      </h3>
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-[11px] text-gray-400">
          clear
        </button>
      )}
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Name…"
      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
    />
  </section>
)
