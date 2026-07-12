import { TrashIcon } from "../icons"

interface DeleteButtonProps {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export const DeleteButton = ({ onClick, disabled, label = "Delete" }: DeleteButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
  >
    <TrashIcon className="size-3.5" />
    {label}
  </button>
)
