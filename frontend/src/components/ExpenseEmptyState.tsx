import { FileTextIcon, PlusIcon } from "@radix-ui/react-icons"
import { useNavigate } from "react-router"

interface ExpenseEmptyStateProps {
  period: string
}

export const ExpenseEmptyState = ({ period }: ExpenseEmptyStateProps) => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
        <FileTextIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          No expenses for {period}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Start tracking your spending</p>
      </div>
      <button
        type="button"
        onClick={() => navigate("/expense/new")}
        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm text-white hover:bg-primary-hover"
      >
        <PlusIcon />
        Add expense
      </button>
    </div>
  )
}
