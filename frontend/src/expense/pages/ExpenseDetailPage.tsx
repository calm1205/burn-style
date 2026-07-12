import { useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { TrashIcon } from "../../common/icons"
import { ExpenseDateTimeInput } from "../components/ExpenseDateTimeInput"
import { ExpenseFormFields } from "../components/ExpenseFormFields"
import { useExpenseEditForm } from "../hooks/useExpenseEditForm"

export const ExpenseDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const f = useExpenseEditForm(uuid)

  if (!f.expense && !f.error) {
    return null
  }

  return (
    <form
      onSubmit={f.handleUpdate}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 justify-end px-5 pt-2">
        <ExpenseDateTimeInput
          value={f.form.expensedAt}
          onChange={(v) => f.update("expensedAt", v)}
        />
      </div>

      {f.error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{f.error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <ExpenseFormFields values={f.form} onChange={f.update} categories={f.categories} />
      </div>

      <div className="shrink-0 px-5 pt-2 pb-3">
        <button
          type="submit"
          disabled={f.loading || !f.form.name || !f.form.amount}
          className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
        >
          {f.loading ? "Updating…" : "Update"}
        </button>
        <button
          type="button"
          onClick={f.openDeleteDialog}
          disabled={f.loading}
          className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
        >
          <TrashIcon className="size-3.5" />
          Delete
        </button>
      </div>

      <ConfirmDialog
        message="Delete this expense?"
        onConfirm={f.handleDelete}
        loading={f.loading}
        dialogRef={f.dialogRef}
      />
    </form>
  )
}
