import { useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { DeleteButton } from "../../common/components/DeleteButton"
import { PrimaryButton } from "../../common/components/PrimaryButton"
import { ExpenseDateTimeInput } from "../components/ExpenseDateTimeInput"
import { ExpenseFormFields } from "../components/ExpenseFormFields"
import { useExpenseEditForm } from "../hooks/useExpenseEditForm"

export const ExpenseDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const expenseForm = useExpenseEditForm(uuid)

  if (!expenseForm.expense && !expenseForm.error) {
    return null
  }

  return (
    <form
      onSubmit={expenseForm.updateExpense}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 justify-end px-5 pt-2">
        <ExpenseDateTimeInput
          value={expenseForm.form.expensedAt}
          onChange={(v) => expenseForm.updateDraftField("expensedAt", v)}
        />
      </div>

      {expenseForm.error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">
          {expenseForm.error}
        </p>
      )}

      <div className="flex-1 overflow-y-auto">
        <ExpenseFormFields
          values={expenseForm.form}
          onChange={expenseForm.updateDraftField}
          categories={expenseForm.categories}
        />
      </div>

      <div className="shrink-0 px-5 pt-2 pb-3">
        <PrimaryButton
          type="submit"
          disabled={expenseForm.loading || !expenseForm.form.name || !expenseForm.form.amount}
        >
          {expenseForm.loading ? "Updating…" : "Update"}
        </PrimaryButton>
        <DeleteButton onClick={expenseForm.openDeleteDialog} disabled={expenseForm.loading} />
      </div>

      <ConfirmDialog
        message="Delete this expense?"
        onConfirm={expenseForm.deleteExpense}
        loading={expenseForm.loading}
        dialogRef={expenseForm.dialogRef}
      />
    </form>
  )
}
