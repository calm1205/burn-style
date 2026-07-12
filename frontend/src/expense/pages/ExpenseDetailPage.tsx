import { useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { DeleteButton } from "../../common/components/DeleteButton"
import { PrimaryButton } from "../../common/components/PrimaryButton"
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
        <PrimaryButton type="submit" disabled={f.loading || !f.form.name || !f.form.amount}>
          {f.loading ? "Updating…" : "Update"}
        </PrimaryButton>
        <DeleteButton onClick={f.openDeleteDialog} disabled={f.loading} />
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
