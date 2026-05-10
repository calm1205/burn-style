import { TrashIcon } from "@radix-ui/react-icons"
import { useParams } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import { ExpenseAmountInput } from "../components/ExpenseAmountInput"
import { ExpenseCategoryChips } from "../components/ExpenseCategoryChips"
import { ExpenseDateTimeInput } from "../components/ExpenseDateTimeInput"
import { ExpenseNameInput } from "../components/ExpenseNameInput"
import { VibePicker } from "../components/VibePicker"
import { useExpenseEditForm } from "../hooks/useExpenseEditForm"

export const ExpenseDetailPage = () => {
  const { uuid } = useParams<{ uuid: string }>()
  const {
    expense,
    categories,
    error,
    loading,
    form,
    update,
    dialogRef,
    openDeleteDialog,
    handleUpdate,
    handleDelete,
  } = useExpenseEditForm(uuid)

  if (!expense && !error) {
    return null
  }

  return (
    <form
      onSubmit={handleUpdate}
      className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden"
    >
      <div className="flex shrink-0 justify-center px-4 pt-8 pb-2">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          Edit expense
        </span>
      </div>

      {error && (
        <p className="mx-5 shrink-0 pb-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex-1 overflow-y-auto">
        <ExpenseNameInput value={form.name} onChange={(v) => update("name", v)} />
        <ExpenseAmountInput value={form.amount} onChange={(v) => update("amount", v)} />
        <ExpenseDateTimeInput value={form.expensedAt} onChange={(v) => update("expensedAt", v)} />
        <ExpenseCategoryChips
          categories={categories}
          selectedUuid={form.categoryUuid}
          onSelect={(v) => update("categoryUuid", v)}
        />
        <div className="px-4 pt-5 pb-4">
          <VibePicker
            social={form.vibeSocial}
            planning={form.vibePlanning}
            necessity={form.vibeNecessity}
            onSocialChange={(v) => update("vibeSocial", v)}
            onPlanningChange={(v) => update("vibePlanning", v)}
            onNecessityChange={(v) => update("vibeNecessity", v)}
          />
        </div>
      </div>

      <div className="shrink-0 px-4 pt-2 pb-3">
        <button
          type="submit"
          disabled={loading || !form.name || !form.amount}
          className="w-full rounded-2xl bg-primary px-4 py-4 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={openDeleteDialog}
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
        >
          <TrashIcon className="size-3.5" />
          Delete
        </button>
      </div>

      <ConfirmDialog
        message="Delete this expense?"
        onConfirm={handleDelete}
        loading={loading}
        dialogRef={dialogRef}
      />
    </form>
  )
}
