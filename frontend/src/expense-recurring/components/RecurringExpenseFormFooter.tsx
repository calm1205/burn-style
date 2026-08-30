import { DeleteButton } from "../../common/components/DeleteButton"
import { PrimaryButton } from "../../common/components/PrimaryButton"
import type { useRecurringExpenseForm } from "../hooks/useRecurringExpenseForm"

interface RecurringExpenseFormFooterProps {
  form: ReturnType<typeof useRecurringExpenseForm>
}

export const RecurringExpenseFormFooter = ({ form }: RecurringExpenseFormFooterProps) => {
  return (
    <div className="shrink-0 px-5 pt-2 pb-3">
      <PrimaryButton
        type="submit"
        disabled={form.loading || !form.name || !form.amount || !form.categoryUuid}
      >
        {form.loading ? "Saving…" : form.isEdit ? "Update" : "Save"}
      </PrimaryButton>
      {form.isEdit && <DeleteButton onClick={form.openDeleteDialog} disabled={form.loading} />}
    </div>
  )
}
