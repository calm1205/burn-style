import { Cross2Icon } from "@radix-ui/react-icons"

interface FilterSheetSearchSectionProps {
  value: string
  onChange: (v: string) => void
}

export const FilterSheetSearchSection = ({ value, onChange }: FilterSheetSearchSectionProps) => (
  <section>
    <h3 className="mb-2 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
      Search
    </h3>
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Name…"
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
          aria-label="Clear"
        >
          <Cross2Icon className="size-3.5" />
        </button>
      )}
    </div>
  </section>
)
