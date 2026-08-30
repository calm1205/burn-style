import { PrimaryButton } from "../../common/components/PrimaryButton"
import { ExpenseDateTimeInput } from "../components/ExpenseDateTimeInput"
import { ExpenseFormFields } from "../components/ExpenseFormFields"
import { useExpenseCreateForm } from "../hooks/useExpenseCreateForm"

export const ExpensesPage = () => {
  const expenseForm = useExpenseCreateForm()

  return (
    <form
      onSubmit={expenseForm.submitExpense}
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
          amountRef={expenseForm.amountRef}
        />
      </div>

      <div className="shrink-0 px-5 pt-2 pb-8">
        <PrimaryButton
          type="submit"
          disabled={expenseForm.loading || !expenseForm.form.name || !expenseForm.form.amount}
        >
          {expenseForm.loading ? "Saving…" : "Save"}
        </PrimaryButton>
      </div>
    </form>
  )
}
