import { useCallback, useEffect, useMemo, useState } from "react"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { RecurringExpenseDueResponse, RecurringExpenseResponse } from "../../common/libs/types"
import { FREQUENCY_OPTIONS, monthlyEquivalent } from "../libs/recurringFrequency"

const groupKeyOf = (r: RecurringExpenseResponse): string | null =>
  FREQUENCY_OPTIONS.find((g) => g.unit === r.interval_unit && g.count === r.interval_count)?.key ??
  null

/** 定期支払一覧と due (期日到来分) のデータ取得 + 月次合計 + グループ化を提供。 */
export const useRecurringList = () => {
  const [items, setItems] = useState<RecurringExpenseResponse[]>([])
  const [due, setDue] = useState<RecurringExpenseDueResponse[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

  const grouped = useMemo(() => {
    const map = new Map<string, RecurringExpenseResponse[]>()
    for (const g of FREQUENCY_OPTIONS) {
      map.set(g.key, [])
    }
    for (const r of items) {
      const k = groupKeyOf(r)
      if (k) map.get(k)?.push(r)
    }
    return map
  }, [items])

  const handleRecord = async (uuid: string, missedCount: number) => {
    setError("")
    setLoading(true)
    try {
      await api.recordRecurringExpense(uuid, { count: missedCount })
      await fetchData()
    } catch (err) {
      setError(getErrorMessage(err, "Failed to record"))
    } finally {
      setLoading(false)
    }
  }

  return { items, due, error, loading, totalMonthly, grouped, handleRecord }
}
