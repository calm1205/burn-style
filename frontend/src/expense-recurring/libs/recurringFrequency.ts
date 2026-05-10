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

export const groupOf = (unit: IntervalUnit, count: number): FrequencyOption | null =>
  FREQUENCY_OPTIONS.find((g) => g.unit === unit && g.count === count) ?? null
