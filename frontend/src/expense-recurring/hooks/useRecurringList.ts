import { useCallback, useEffect, useMemo, useState } from "react"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { RecurringExpenseResponse } from "../../common/libs/types"
import { monthlyEquivalent } from "../libs/recurringFrequency"

/** 定期支払一覧のデータ取得と月次合計を提供。 */
export const useRecurringList = () => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchRecurringExpenses = useCallback(async () => {
    try {
      setRecurringExpenses(await api.getRecurringExpenses())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchRecurringExpenses()
  }, [fetchRecurringExpenses])

  const totalMonthly = useMemo(
    () =>
      recurringExpenses.reduce(
        (sum, r) => sum + monthlyEquivalent(r.amount, r.interval_unit, r.interval_count),
        0,
      ),
    [recurringExpenses],
  )

  return { recurringExpenses, error, totalMonthly }
}
