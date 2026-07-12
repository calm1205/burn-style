import { useNavigate, useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { ArrowLeftIcon } from "../../common/icons"
import { RecurringExpenseFields } from "../components/RecurringExpenseFields"
import { RecurringExpenseFormFooter } from "../components/RecurringExpenseFormFooter"
import { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"

export const RecurringExpenseEditPage = () => {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const f = useRecurringExpenseForm(uuid)

  return (
    <form
      onSubmit={f.handleSubmit}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 items-center px-5 pt-2">
        <button
          type="button"
          onClick={() => navigate("/expense/recurring")}
          aria-label="Back"
          className="-ml-1 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeftIcon className="size-4" />
        </button>
      </div>

      {f.error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{f.error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <RecurringExpenseFields form={f} />
      </div>

      <RecurringExpenseFormFooter form={f} />

      <ConfirmDialog
        message={`Stop "${f.name}"? Past records remain unchanged.`}
        onConfirm={f.handleDelete}
        confirmText="Stop"
        loading={f.loading}
        dialogRef={f.dialogRef}
      />
    </form>
  )
}
