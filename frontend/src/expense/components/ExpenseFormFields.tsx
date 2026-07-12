import type { RefObject } from "react"

import type {
  CategoryResponse,
  VibeNecessity,
  VibePlanning,
  VibeSocial,
} from "../../common/libs/types"
import { ExpenseAmountInput } from "./ExpenseAmountInput"
import { ExpenseCategoryChips } from "./ExpenseCategoryChips"
import { ExpenseNameInput } from "./ExpenseNameInput"
import { ExpenseVibeSection } from "./ExpenseVibeSection"

interface ExpenseFormValues {
  name: string
  amount: string
  categoryUuid: string | null
  vibeSocial: VibeSocial | null
  vibePlanning: VibePlanning | null
  vibeNecessity: VibeNecessity | null
}

interface ExpenseFormFieldsProps<T extends ExpenseFormValues> {
  values: T
  onChange: <K extends keyof T>(key: K, value: T[K]) => void
  categories: CategoryResponse[]
  amountRef?: RefObject<HTMLInputElement | null>
}

export const ExpenseFormFields = <T extends ExpenseFormValues>({
  values,
  onChange,
  categories,
  amountRef,
}: ExpenseFormFieldsProps<T>) => {
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
