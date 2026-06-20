import { TrashIcon } from "@radix-ui/react-icons"
import { useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { ExpenseAmountInput } from "../../expense/components/ExpenseAmountInput"
import { ExpenseCategoryChips } from "../../expense/components/ExpenseCategoryChips"
import { ExpenseNameInput } from "../../expense/components/ExpenseNameInput"
import { RecurringFrequencyPicker } from "../components/RecurringFrequencyPicker"
import { RecurringStartDateInput } from "../components/RecurringStartDateInput"
import { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"

export const RecurringExpenseEditPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const f = useRecurringExpenseForm(uuid)

  return (
    <form
      onSubmit={f.handleSubmit}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 justify-end px-5 pt-2">
        <RecurringStartDateInput value={f.startDate} onChange={f.setStartDate} />
      </div>

      {f.error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{f.error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-center py-8">
          <ExpenseAmountInput value={f.amount} onChange={f.setAmount} />
          <ExpenseNameInput value={f.name} onChange={f.setName} />
          <ExpenseCategoryChips
            categories={f.categories}
            selectedUuid={f.categoryUuid || null}
            onSelect={(v) => f.setCategoryUuid(v ?? "")}
          />
          <RecurringFrequencyPicker selectedKey={f.frequencyKey} onChange={f.setFrequencyKey} />
        </div>
      </div>

      <div className="shrink-0 px-5 pt-2 pb-3">
        <button
          type="submit"
          disabled={f.loading || !f.name || !f.amount || !f.categoryUuid}
          className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
        >
          {f.loading ? "Saving…" : f.isEdit ? "Update" : "Save"}
        </button>
        {f.isEdit && (
          <button
            type="button"
            onClick={f.openDeleteDialog}
            disabled={f.loading}
            className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
          >
            <TrashIcon className="size-3.5" />
            Delete
          </button>
        )}
      </div>

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
