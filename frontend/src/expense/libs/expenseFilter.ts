import type {
  ExpenseResponse,
  VibeNecessity,
  VibePlanning,
  VibeSocial,
} from "../../common/libs/types"

export type FilterScope = "week" | "month" | "all"
export type RecurringMode = "all" | "exclude" | "only"

export interface ExpenseFilter {
  q: string
  scope: FilterScope
  categoryUuids: string[]
  min: number
  max: number
  /** 特定日のみ表示する場合に YYYY-MM-DD を指定。設定時は scope を無視。 */
  date: string | null
  /** scope=="month" で対象月を YYYY-MM 指定。null なら当月。 */
  month: string | null
  vibeSocial: VibeSocial | null
  vibePlanning: VibePlanning | null
  vibeNecessity: VibeNecessity | null
  /** 繰り返し支出から生成された支出の扱い。all=全て / exclude=除外 / only=繰り返しのみ。 */
  recurringMode: RecurringMode
}

export const SCOPE_OPTIONS: { k: FilterScope; label: string; short: string }[] = [
  { k: "week", label: "This week", short: "Week" },
  { k: "month", label: "This month", short: "Month" },
  { k: "all", label: "All time", short: "All" },
]

export const defaultFilter = (): ExpenseFilter => ({
  q: "",
  scope: "month",
  categoryUuids: [],
  min: 0,
  max: 0,
  date: null,
  month: null,
  vibeSocial: null,
  vibePlanning: null,
  vibeNecessity: null,
  recurringMode: "all",
})

export const filterCount = (f: ExpenseFilter): number => {
  let n = 0
  if (f.q) n++
  if (f.scope !== "month") n++
  if (f.categoryUuids.length > 0) n++
  if (f.min > 0 || f.max > 0) n++
  if (f.date) n++
  if (f.vibeSocial) n++
  if (f.vibePlanning) n++
  if (f.vibeNecessity) n++
  if (f.recurringMode !== "all") n++
  return n
}

const sameLocalDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

export const parseDateKey = (key: string): Date | null => {
  const parts = key.split("-").map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

export const parseMonthKey = (key: string): { year: number; month: number } | null => {
  const parts = key.split("-").map(Number)
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null
  return { year: parts[0], month: parts[1] - 1 }
}

export const formatMonthKey = (year: number, month: number): string =>
  `${year}-${String(month + 1).padStart(2, "0")}`

export const shiftMonthKey = (key: string, delta: number): string => {
  const parsed = parseMonthKey(key)
  if (!parsed) return key
  const d = new Date(parsed.year, parsed.month + delta, 1)
  return formatMonthKey(d.getFullYear(), d.getMonth())
}

export const applyFilter = (expenses: ExpenseResponse[], f: ExpenseFilter): ExpenseResponse[] => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)
  const targetDate = f.date ? parseDateKey(f.date) : null

  return expenses.filter((e) => {
    const d = new Date(e.expensed_at)

    if (targetDate) {
      if (!sameLocalDay(d, targetDate)) return false
    } else if (f.scope === "week") {
      if (d < weekStart) return false
      if (d > now && !sameLocalDay(d, now)) return false
    } else if (f.scope === "month") {
      const target = f.month
        ? parseMonthKey(f.month)
        : { year: now.getFullYear(), month: now.getMonth() }
      if (!target) return false
      if (d.getFullYear() !== target.year || d.getMonth() !== target.month) return false
    }

    if (f.q && !e.name.toLowerCase().includes(f.q.toLowerCase())) return false
    if (f.categoryUuids.length > 0) {
      const hit = e.categories.some((c) => f.categoryUuids.includes(c.uuid))
      if (!hit) return false
    }
    if (f.min > 0 && e.amount < f.min) return false
    if (f.max > 0 && e.amount > f.max) return false
    if (f.vibeSocial && e.vibe_social !== f.vibeSocial) return false
    if (f.vibePlanning && e.vibe_planning !== f.vibePlanning) return false
    if (f.vibeNecessity && e.vibe_necessity !== f.vibeNecessity) return false
    if (f.recurringMode === "exclude" && e.recurring_expense_uuid !== null) return false
    if (f.recurringMode === "only" && e.recurring_expense_uuid === null) return false
    return true
  })
}
