import { MixerHorizontalIcon } from "@radix-ui/react-icons"

interface ExpenseListFilterButtonProps {
  filterCount: number
  onClick: () => void
}

export const ExpenseListFilterButton = ({ filterCount, onClick }: ExpenseListFilterButtonProps) => (
  <button
    type="button"
    onClick={onClick}
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
)
