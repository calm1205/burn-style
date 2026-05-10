import { useCallback, useEffect, useMemo, useState } from "react"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import type { ExpenseResponse } from "../../common/libs/types"
import { InsightCategoryCard } from "../components/InsightCategoryCard"
import { InsightSection } from "../components/InsightSection"
import { InsightVibeCard } from "../components/InsightVibeCard"
import { InsightYearChart } from "../components/InsightYearChart"
import { computeCategories, computeVibes, computeYear, monthLabel } from "../libs/insightStats"

export const ExpenseInsightPage = () => {
  const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      setExpenses(await api.getExpenses())
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch data"))
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const thisMonth = useMemo(
    () =>
      expenses.filter((e) => {
        const d = new Date(e.expensed_at)
        return d.getFullYear() === year && d.getMonth() + 1 === month
      }),
    [expenses, year, month],
  )

  const vibes = useMemo(() => computeVibes(thisMonth), [thisMonth])
  const cats = useMemo(() => computeCategories(thisMonth), [thisMonth])
  const yearMonths = useMemo(() => computeYear(expenses), [expenses])

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden">
      {error && (
        <p className="mx-5 shrink-0 pt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="shrink-0 px-5 pt-2 pb-3">
        <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500">
          The full read
        </div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Insights</h1>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {monthLabel(year, month)}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-8">
        <InsightSection title="Why you spent">
          <InsightVibeCard vibes={vibes} />
        </InsightSection>

        <InsightSection title="This month by category">
          <InsightCategoryCard cats={cats} />
        </InsightSection>

        <InsightSection title="Last 12 months" padding="p-4">
          <InsightYearChart year={yearMonths} />
        </InsightSection>
      </div>
    </div>
  )
}
