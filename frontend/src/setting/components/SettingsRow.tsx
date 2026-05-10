import { ChevronRightIcon, RowsIcon } from "@radix-ui/react-icons"

export interface SettingsRowAction {
  label: string
  Icon: typeof RowsIcon
  onClick: () => void
  accent?: boolean
  disabled?: boolean
}

interface SettingsRowProps {
  row: SettingsRowAction
  divided: boolean
}

export const SettingsRow = ({ row, divided }: SettingsRowProps) => {
  const { Icon } = row
  return (
    <button
      type="button"
      onClick={row.onClick}
      disabled={row.disabled}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700/40 ${
        divided ? "border-t border-gray-100 dark:border-gray-700" : ""
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
          row.accent
            ? "bg-primary/10 text-primary"
            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <span className="flex-1 truncate text-sm font-semibold">{row.label}</span>
      <ChevronRightIcon className="size-4 shrink-0 text-gray-300 dark:text-gray-600" />
    </button>
  )
}
