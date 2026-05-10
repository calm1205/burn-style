import { useNavigate, useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { RecurringCategoryPicker } from "../components/RecurringCategoryPicker"
import { RecurringFormActions } from "../components/RecurringFormActions"
import { RecurringFrequencyPicker } from "../components/RecurringFrequencyPicker"
import { RecurringNameAmountFields } from "../components/RecurringNameAmountFields"
import { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"

export const RecurringExpenseEditPage = () => {
  const navigate = useNavigate()
  const { uuid } = useParams<{ uuid: string }>()
  const form = useRecurringExpenseForm(uuid)

  return (
    <form onSubmit={form.handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      {form.error && <p className="text-sm text-red-600 dark:text-red-400">{form.error}</p>}

      <RecurringNameAmountFields
        name={form.name}
        amount={form.amount}
        onNameChange={form.setName}
        onAmountChange={form.setAmount}
      />

      <RecurringFrequencyPicker selectedKey={form.frequencyKey} onChange={form.setFrequencyKey} />

      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <label className="text-xs text-gray-500 dark:text-gray-400" htmlFor="recurring-start">
          Start date
        </label>
        <input
          id="recurring-start"
          type="date"
          value={form.startDate}
          onChange={(e) => form.setStartDate(e.target.value)}
          required
          className="mt-1 w-full border-x-0 border-t-0 border-b border-gray-200 bg-transparent py-2 outline-none focus:border-primary dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      <RecurringCategoryPicker
        categories={form.categories}
        selectedUuid={form.categoryUuid}
        onChange={form.setCategoryUuid}
      />

      <RecurringFormActions
        isEdit={form.isEdit}
        loading={form.loading}
        canSubmit={Boolean(form.categoryUuid)}
        onCancel={() => navigate("/expense/recurring")}
        onOpenDelete={form.openDeleteDialog}
      />

      <ConfirmDialog
        message={`Stop "${form.name}"? Past records remain unchanged.`}
        onConfirm={form.handleDelete}
        confirmText="Stop"
        loading={form.loading}
        dialogRef={form.dialogRef}
      />
    </form>
  )
}
