import type { CategoryResponse, ExpenseResponse } from "../../common/libs/types"
import type { YearMonth } from "../components/InsightYearChart"

const VIBE_LABELS: { key: string; label: string; field: keyof ExpenseResponse }[] = [
  { key: "ROUTINE", label: "Routine", field: "vibe_planning" },
  { key: "SPONTANEOUS", label: "Spontaneous", field: "vibe_planning" },
  { key: "NEEDED", label: "Needed it", field: "vibe_necessity" },
  { key: "WANTED", label: "Wanted it", field: "vibe_necessity" },
  { key: "SOLO", label: "Solo", field: "vibe_social" },
  { key: "WITH_SOMEONE", label: "With someone", field: "vibe_social" },
]

export interface VibeStat {
  key: string
  label: string
  count: number
  pct: number
}

export interface CategoryStat {
  category: CategoryResponse | null
  amount: number
  pct: number
}

export const monthLabel = (year: number, month: number): string =>
  new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

export const fmtAmount = (n: number): string => `¥${Math.round(n).toLocaleString()}`

export const computeVibes = (expenses: ExpenseResponse[]): VibeStat[] => {
  const counts = new Map<string, number>()
  for (const e of expenses) {
    for (const { key, field } of VIBE_LABELS) {
      if (e[field] === key) {
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }
  const total = [...counts.values()].reduce((s, n) => s + n, 0)
  return VIBE_LABELS.map(({ key, label }) => {
    const count = counts.get(key) ?? 0
    return { key, label, count, pct: total > 0 ? (count / total) * 100 : 0 }
  })
    .filter((v) => v.count > 0)
    .toSorted((a, b) => b.count - a.count)
}

export const computeCategories = (expenses: ExpenseResponse[]): CategoryStat[] => {
  const map = new Map<string, { category: CategoryResponse | null; amount: number }>()
  for (const e of expenses) {
    if (e.categories.length === 0) {
      const entry = map.get("__none__") ?? { category: null, amount: 0 }
      entry.amount += e.amount
      map.set("__none__", entry)
    } else {
      for (const c of e.categories) {
        const entry = map.get(c.uuid) ?? { category: c, amount: 0 }
        entry.amount += e.amount
        map.set(c.uuid, entry)
      }
    }
  }
  const total = [...map.values()].reduce((s, x) => s + x.amount, 0)
  return [...map.values()]
    .map(({ category, amount }) => ({
      category,
      amount,
      pct: total > 0 ? (amount / total) * 100 : 0,
    }))
    .toSorted((a, b) => b.amount - a.amount)
}

export const computeYear = (expenses: ExpenseResponse[]): YearMonth[] => {
  const now = new Date()
  const months: YearMonth[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      amount: 0,
      current: i === 0,
    })
  }
  for (const e of expenses) {
    const d = new Date(e.expensed_at)
    const k = `${d.getFullYear()}-${d.getMonth() + 1}`
    const target = months.find((m) => m.key === k)
    if (target) target.amount += e.amount
  }
  return months
}
