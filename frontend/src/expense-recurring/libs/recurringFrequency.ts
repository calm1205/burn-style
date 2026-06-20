import type { IntervalUnit } from "../../common/libs/types"

export interface FrequencyOption {
  key: string
  label: string
  unit: IntervalUnit
  count: number
}

export const FREQUENCY_OPTIONS: FrequencyOption[] = [
  { key: "weekly", label: "Weekly", unit: "WEEK", count: 1 },
  { key: "biweekly", label: "Every 2 wk", unit: "WEEK", count: 2 },
  { key: "monthly", label: "Monthly", unit: "MONTH", count: 1 },
  { key: "quarterly", label: "Quarterly", unit: "MONTH", count: 3 },
  { key: "yearly", label: "Yearly", unit: "MONTH", count: 12 },
]

export const matchFrequency = (unit: IntervalUnit, count: number): string =>
  FREQUENCY_OPTIONS.find((f) => f.unit === unit && f.count === count)?.key ?? "monthly"

/** JST 今日の YYYY-MM-DD を返す。OS タイムゾーン非依存。 */
export const todayJst = (): string => {
  const now = new Date()
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}

export const PERIOD_LABEL: Record<string, string> = {
  weekly: "/ wk",
  biweekly: "/ 2wk",
  monthly: "/ mo",
  quarterly: "/ 3mo",
  yearly: "/ yr",
}

/** 月次概算合計を算出 (週次は約4.345倍、年次は1/12)。 */
export const monthlyEquivalent = (amount: number, unit: IntervalUnit, count: number): number => {
  if (unit === "WEEK") {
    return Math.round((amount * 4.345) / count)
  }
  return Math.round(amount / count)
}

/** start_date 起点で n 回目 (0-indexed) の発生日 (YYYY-MM-DD) を返す。月末は前月末に丸める。 */
const occurrence = (startIso: string, unit: IntervalUnit, count: number, n: number): string => {
  const [y, m, d] = startIso.split("-").map(Number)
  if (unit === "WEEK") {
    const date = new Date(Date.UTC(y, m - 1, d + 7 * count * n))
    return date.toISOString().slice(0, 10)
  }
  const date = new Date(Date.UTC(y, m - 1 + count * n, d))
  if (date.getUTCDate() !== d) date.setUTCDate(0)
  return date.toISOString().slice(0, 10)
}

/** 今日以降の次の発生日を返す。end_date を超える場合は null。 */
export const nextOccurrence = (
  startDate: string,
  unit: IntervalUnit,
  count: number,
  endDate: string | null,
): string | null => {
  const today = todayJst()
  let n = 0
  let next = startDate
  while (next < today) {
    n++
    next = occurrence(startDate, unit, count, n)
  }
  if (endDate && next > endDate) return null
  return next
}

export const groupOf = (unit: IntervalUnit, count: number): FrequencyOption | null =>
  FREQUENCY_OPTIONS.find((g) => g.unit === unit && g.count === count) ?? null
