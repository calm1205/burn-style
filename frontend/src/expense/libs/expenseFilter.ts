import type {
  ExpenseResponse,
  VibeNecessity,
  VibePlanning,
  VibeSocial,
} from "../../common/libs/types"

export type FilterScope = "week" | "month" | "all"
export type RecurringMode = "all" | "exclude" | "only"

export interface ExpenseFilter {
  searchQuery: string
  scope: FilterScope
  categoryUuids: string[]
  amountMin: number
  amountMax: number
  /** 期間の開始日 (YYYY-MM-DD, 当日含む)。dateStart/dateEnd いずれか設定時は scope を無視。 */
  dateStart: string | null
  /** 期間の終了日 (YYYY-MM-DD, 当日含む)。 */
  dateEnd: string | null
  /** scope=="month" で対象月を YYYY-MM 指定。null なら当月。 */
  month: string | null
  vibeSocial: VibeSocial | null
  vibePlanning: VibePlanning | null
  vibeNecessity: VibeNecessity | null
  /** 繰り返し支出から生成された支出の扱い。all=全て / exclude=除外 / only=繰り返しのみ。 */
  recurringMode: RecurringMode
}

export const SCOPE_OPTIONS: { scope: FilterScope; label: string; short: string }[] = [
  { scope: "week", label: "This week", short: "Week" },
  { scope: "month", label: "This month", short: "Month" },
  { scope: "all", label: "All time", short: "All" },
]

export const defaultFilter = (): ExpenseFilter => ({
  searchQuery: "",
  scope: "month",
  categoryUuids: [],
  amountMin: 0,
  amountMax: 0,
  dateStart: null,
  dateEnd: null,
  month: null,
  vibeSocial: null,
  vibePlanning: null,
  vibeNecessity: null,
  recurringMode: "all",
})

export const filterCount = (filter: ExpenseFilter): number => {
  let n = 0
  if (filter.searchQuery) n++
  if (filter.scope !== "month") n++
  if (filter.categoryUuids.length > 0) n++
  if (filter.amountMin > 0 || filter.amountMax > 0) n++
  if (filter.dateStart || filter.dateEnd) n++
  if (filter.vibeSocial) n++
  if (filter.vibePlanning) n++
  if (filter.vibeNecessity) n++
  if (filter.recurringMode !== "all") n++
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

export const formatDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

/** Period プリセットボタン用に scope を具体的な日付範囲へ変換 (all は範囲なし)。 */
export const presetDateRange = (
  scope: FilterScope,
): { start: string | null; end: string | null } => {
  if (scope === "all") return { start: null, end: null }

  const now = new Date()
  if (scope === "week") {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { start: formatDateKey(start), end: formatDateKey(now) }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: formatDateKey(start), end: formatDateKey(end) }
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

export const applyFilter = (
  expenses: ExpenseResponse[],
  filter: ExpenseFilter,
): ExpenseResponse[] => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)
  const rangeStart = filter.dateStart ? parseDateKey(filter.dateStart) : null
  const rangeEnd = filter.dateEnd ? parseDateKey(filter.dateEnd) : null
  // 終了日を含めるため翌日 0:00 を上限 (排他) とする。
  const rangeEndExclusive = rangeEnd ? new Date(rangeEnd) : null
  if (rangeEndExclusive) rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1)

  return expenses.filter((e) => {
    const d = new Date(e.expensed_at)

    if (rangeStart || rangeEndExclusive) {
      if (rangeStart && d < rangeStart) return false
      if (rangeEndExclusive && d >= rangeEndExclusive) return false
    } else if (filter.scope === "week") {
      if (d < weekStart) return false
      if (d > now && !sameLocalDay(d, now)) return false
    } else if (filter.scope === "month") {
      const target = filter.month
        ? parseMonthKey(filter.month)
        : { year: now.getFullYear(), month: now.getMonth() }
      if (!target) return false
      if (d.getFullYear() !== target.year || d.getMonth() !== target.month) return false
    }

    if (filter.searchQuery && !e.name.toLowerCase().includes(filter.searchQuery.toLowerCase()))
      return false
    if (filter.categoryUuids.length > 0) {
      const hit = e.categories.some((c) => filter.categoryUuids.includes(c.uuid))
      if (!hit) return false
    }
    if (filter.amountMin > 0 && e.amount < filter.amountMin) return false
    if (filter.amountMax > 0 && e.amount > filter.amountMax) return false
    if (filter.vibeSocial && e.vibe_social !== filter.vibeSocial) return false
    if (filter.vibePlanning && e.vibe_planning !== filter.vibePlanning) return false
    if (filter.vibeNecessity && e.vibe_necessity !== filter.vibeNecessity) return false
    if (filter.recurringMode === "exclude" && e.recurring_expense_uuid !== null) return false
    if (filter.recurringMode === "only" && e.recurring_expense_uuid === null) return false
    return true
  })
}
