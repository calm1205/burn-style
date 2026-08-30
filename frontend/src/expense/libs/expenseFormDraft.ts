import type { VibeNecessity, VibePlanning, VibeSocial } from "../../common/libs/types"

/** Expense 作成・編集フォームの入力中 state。 */
export interface ExpenseFormDraft {
  name: string
  amount: string
  expensedAt: string
  categoryUuid: string | null
  vibeSocial: VibeSocial | null
  vibePlanning: VibePlanning | null
  vibeNecessity: VibeNecessity | null
}

export const emptyExpenseFormDraft: ExpenseFormDraft = {
  name: "",
  amount: "",
  expensedAt: "",
  categoryUuid: null,
  vibeSocial: null,
  vibePlanning: null,
  vibeNecessity: null,
}
