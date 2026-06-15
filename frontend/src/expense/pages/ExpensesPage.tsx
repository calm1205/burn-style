import { ExpenseAmountInput } from "../components/ExpenseAmountInput"
import { ExpenseCategoryChips } from "../components/ExpenseCategoryChips"
import { ExpenseDateTimeInput } from "../components/ExpenseDateTimeInput"
import { ExpenseNameInput } from "../components/ExpenseNameInput"
import { VibePicker } from "../components/VibePicker"
import { useExpenseCreateForm } from "../hooks/useExpenseCreateForm"

export const ExpensesPage = () => {
  const f = useExpenseCreateForm()

  return (
    <form
      onSubmit={f.handleSubmit}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 justify-center px-5 pt-5 pb-1">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          New expense
        </span>
      </div>

      {f.error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{f.error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center py-8">
          <div className="flex justify-end pr-2">
            <ExpenseDateTimeInput value={f.expensedAt} onChange={f.setExpensedAt} />
          </div>
          <ExpenseNameInput value={f.name} onChange={f.setName} inputRef={f.nameRef} />
          <ExpenseAmountInput value={f.amount} onChange={f.setAmount} />
          <ExpenseCategoryChips
            categories={f.categories}
            selectedUuid={f.categoryUuid}
            onSelect={f.setCategoryUuid}
          />
          <div className="px-5 pt-5">
            <VibePicker
              social={f.vibeSocial}
              planning={f.vibePlanning}
              necessity={f.vibeNecessity}
              onSocialChange={f.setVibeSocial}
              onPlanningChange={f.setVibePlanning}
              onNecessityChange={f.setVibeNecessity}
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 px-5 pt-2 pb-3">
        <button
          type="submit"
          disabled={f.loading || !f.name || !f.amount}
          className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
        >
          {f.loading ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  )
}
