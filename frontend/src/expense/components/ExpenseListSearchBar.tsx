import { Cross2Icon, MagnifyingGlassIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"

interface ExpenseListSearchBarProps {
  query: string
  filterCount: number
  onQueryChange: (v: string) => void
  onOpenFilter: () => void
}

export const ExpenseListSearchBar = ({
  query,
  filterCount,
  onQueryChange,
  onOpenFilter,
}: ExpenseListSearchBarProps) => (
  <div className="flex shrink-0 items-center gap-2 pt-3">
    <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
      <MagnifyingGlassIcon className="size-4 shrink-0 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search expenses…"
        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-100"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
          className="shrink-0 text-gray-400"
        >
          <Cross2Icon className="size-3.5" />
        </button>
      )}
    </div>
    <button
      type="button"
      onClick={onOpenFilter}
      aria-label="Filter"
      className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl border ${
        filterCount > 0
          ? "border-primary bg-primary text-white"
          : "border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      <MixerHorizontalIcon className="size-4" />
      {filterCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-gray-50 dark:ring-gray-900">
          {filterCount}
        </span>
      )}
    </button>
  </div>
)
