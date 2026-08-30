import type { RefObject } from "react"

import type { CategoryResponse } from "../../common/libs/types"
import type { ExpenseFormDraft } from "../libs/expenseFormDraft"
import { ExpenseAmountInput } from "./ExpenseAmountInput"
import { ExpenseCategoryChips } from "./ExpenseCategoryChips"
import { ExpenseNameInput } from "./ExpenseNameInput"
import { ExpenseVibeSection } from "./ExpenseVibeSection"

interface ExpenseFormFieldsProps {
  values: ExpenseFormDraft
  onChange: <K extends keyof ExpenseFormDraft>(key: K, value: ExpenseFormDraft[K]) => void
  categories: CategoryResponse[]
  amountRef?: RefObject<HTMLInputElement | null>
}

export const ExpenseFormFields = ({
  values,
  onChange,
  categories,
  amountRef,
}: ExpenseFormFieldsProps) => {
  return (
    <div className="flex min-h-full flex-col justify-center py-8">
      <ExpenseAmountInput
        value={values.amount}
        onChange={(v) => onChange("amount", v)}
        inputRef={amountRef}
      />
      <ExpenseNameInput value={values.name} onChange={(v) => onChange("name", v)} />
      <ExpenseCategoryChips
        categories={categories}
        selectedUuid={values.categoryUuid}
        onSelect={(v) => onChange("categoryUuid", v)}
      />
      <ExpenseVibeSection
        social={values.vibeSocial}
        planning={values.vibePlanning}
        necessity={values.vibeNecessity}
        onSocialChange={(v) => onChange("vibeSocial", v)}
        onPlanningChange={(v) => onChange("vibePlanning", v)}
        onNecessityChange={(v) => onChange("vibeNecessity", v)}
      />
    </div>
  )
}
