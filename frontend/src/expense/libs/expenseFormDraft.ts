import { DEFAULT_VIBE, type Vibe } from "../../common/libs/types"

/** Expense 作成・編集フォームの入力中 state。 */
export interface ExpenseFormDraft {
  name: string
  amount: string
  expensedAt: string
  categoryUuid: string | null
  vibe: Vibe
}

export const emptyExpenseFormDraft: ExpenseFormDraft = {
  name: "",
  amount: "",
  expensedAt: "",
  categoryUuid: null,
  vibe: DEFAULT_VIBE,
}

export const vibeFromDraft = (vibe: Vibe) => ({
  social: vibe.social,
  planning: vibe.planning,
  necessity: vibe.necessity,
})
