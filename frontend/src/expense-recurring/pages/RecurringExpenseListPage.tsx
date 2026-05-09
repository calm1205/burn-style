import { ChevronRightIcon, PlusIcon } from "@radix-ui/react-icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { categoryGlyph } from "../../common/libs/category"
import { getErrorMessage } from "../../common/libs/client"
import type {
  IntervalUnit,
  RecurringExpenseDueResponse,
  RecurringExpenseResponse,
} from "../../common/libs/types"

interface FrequencyGroup {
  key: string
  label: string
  unit: IntervalUnit
  count: number
}

const FREQUENCY_GROUPS: FrequencyGroup[] = [
  { key: "weekly", label: "Weekly", unit: "WEEK", count: 1 },
  { key: "biweekly", label: "Every 2 wk", unit: "WEEK", count: 2 },
  { key: "monthly", label: "Monthly", unit: "MONTH", count: 1 },
  { key: "quarterly", label: "Quarterly", unit: "MONTH", count: 3 },
  { key: "yearly", label: "Yearly", unit: "MONTH", count: 12 },
]

const PERIOD_LABEL: Record<string, string> = {
  weekly: "/ wk",
  biweekly: "/ 2wk",
  monthly: "/ mo",
  quarterly: "/ 3mo",
  yearly: "/ yr",
}

/** 月次概算合計を算出 (週次は約4.345倍、年次は1/12) */
const monthlyEquivalent = (r: RecurringExpenseResponse): number => {
  if (r.interval_unit === "WEEK") {
    return Math.round((r.amount * 4.345) / r.interval_count)
  }
  return Math.round(r.amount / r.interval_count)
}

const formatAmount = (n: number): string => n.toLocaleString("en-US")

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const groupOf = (r: RecurringExpenseResponse): FrequencyGroup | null =>
  FREQUENCY_GROUPS.find((g) => g.unit === r.interval_unit && g.count === r.interval_count) ?? null

/** 次回予定日を派生算出 (recorded_count はサーバ側のみ把握なので簡易表示として start_date 起点) */
const nextDueOf = (
  r: RecurringExpenseResponse,
  due: RecurringExpenseDueResponse[],
): string | null => {
  const d = due.find((x) => x.uuid === r.uuid)
  if (d && d.missed_dates.length > 0) {
    return d.missed_dates[0]
  }
  return null
}

export const RecurringExpenseListPage = () => {
  const navigate = useNavigate()
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
    () => items.reduce((sum, r) => sum + monthlyEquivalent(r), 0),
    [items],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, RecurringExpenseResponse[]>()
    for (const g of FREQUENCY_GROUPS) {
      map.set(g.key, [])
    }
    for (const r of items) {
      const g = groupOf(r)
      if (g) {
        map.get(g.key)?.push(r)
      }
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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 pb-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* Summary */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">Every month</div>
        <div className="mt-1 text-3xl font-light tracking-tight">¥{formatAmount(totalMonthly)}</div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {items.length} {items.length === 1 ? "recurring" : "recurrings"}
        </div>
      </div>

      {/* Coming up (due payments) */}
      {due.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="mb-3 text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
            Coming up
          </div>
          <div className="flex flex-col gap-3">
            {due.map((d) => (
              <button
                key={d.uuid}
                type="button"
                onClick={() => handleRecord(d.uuid, d.missed_count)}
                disabled={loading}
                className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-left hover:bg-gray-100 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <div className="flex flex-1 flex-col">
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {d.missed_count > 1
                      ? `${d.missed_count} unrecorded · oldest ${formatDate(d.missed_dates[0])}`
                      : `due ${formatDate(d.missed_dates[0])}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">¥{formatAmount(d.amount)}</div>
                  <div className="mt-0.5 text-xs text-primary">Tap to record</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add button */}
      <Link
        to="/expense/recurring/new"
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover"
      >
        <PlusIcon className="size-4" />
        Add recurring
      </Link>

      {/* Grouped list */}
      {FREQUENCY_GROUPS.map((g) => {
        const list = grouped.get(g.key) ?? []
        if (list.length === 0) return null
        const groupTotal = list.reduce((sum, r) => sum + monthlyEquivalent(r), 0)
        return (
          <div
            key={g.key}
            className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800"
          >
            <div className="flex items-center justify-between px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>{g.label}</span>
              <span>
                {list.length} · ¥{formatAmount(groupTotal)}/mo
              </span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {list.map((r) => {
                const next = nextDueOf(r, due)
                return (
                  <button
                    key={r.uuid}
                    type="button"
                    onClick={() => navigate(`/expense/recurring/${r.uuid}`)}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex flex-1 flex-col">
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <span>{categoryGlyph(r.category)}</span>
                        <span>{r.category.name}</span>
                        {next && (
                          <>
                            <span>·</span>
                            <span>next {formatDate(next)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">¥{formatAmount(r.amount)}</div>
                      <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {PERIOD_LABEL[g.key]}
                      </div>
                    </div>
                    <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No recurrings yet
        </p>
      )}
    </div>
  )
}
