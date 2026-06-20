import { useCallback, useEffect, useMemo, useState } from "react"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { RecurringExpenseDueResponse, RecurringExpenseResponse } from "../../common/libs/types"
import { monthlyEquivalent } from "../libs/recurringFrequency"

/** 定期支払一覧と due (期日到来分) のデータ取得 + 月次合計を提供。 */
export const useRecurringList = () => {
  const [items, setItems] = useState<RecurringExpenseResponse[]>([])
  const [due, setDue] = useState<RecurringExpenseDueResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const [list, dueList] = await Promise.all([
        api.getRecurringExpenses(),
        api.getRecurringExpenseDue(),
      ])
      setItems(list)
      setDue(dueList)
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalMonthly = useMemo(
    () =>
      items.reduce(
        (sum, r) => sum + monthlyEquivalent(r.amount, r.interval_unit, r.interval_count),
        0,
      ),
    [items],
  )

  return { items, due, error, totalMonthly }
}
