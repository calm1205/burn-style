import { PrimaryButton } from "../../common/components/PrimaryButton"
import { ExpenseDateTimeInput } from "../components/ExpenseDateTimeInput"
import { ExpenseFormFields } from "../components/ExpenseFormFields"
import { useExpenseCreateForm } from "../hooks/useExpenseCreateForm"

export const ExpensesPage = () => {
  const f = useExpenseCreateForm()

  return (
    <form
      onSubmit={f.submitExpense}
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
        <ExpenseFormFields
          values={f.form}
          onChange={f.update}
          categories={f.categories}
          amountRef={f.amountRef}
        />
      </div>

      <div className="shrink-0 px-5 pt-2 pb-8">
        <PrimaryButton type="submit" disabled={f.loading || !f.form.name || !f.form.amount}>
          {f.loading ? "Saving…" : "Save"}
        </PrimaryButton>
      </div>
    </form>
  )
}
