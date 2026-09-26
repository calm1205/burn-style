import type { VibeNecessity, VibePlanning, VibeSocial } from "../../common/libs/types"
import {
  calendarMonthDateRange,
  createDefaultExpenseFilter,
  formatDateKey,
  formatMonthKey,
  isAllTimePeriodFilter,
  parseDateKey,
  presetDateRange,
  type ExpenseFilter,
  type RecurringMode,
} from "./expenseFilter"

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/
/** backend の uuid7().hex（32 文字・ハイフンなし）。 */
const CATEGORY_UUID = /^[0-9a-f]{32}$/i

const VIBE_SOCIAL = new Set<VibeSocial>(["SOLO", "WITH_SOMEONE"])
const VIBE_PLANNING = new Set<VibePlanning>(["ROUTINE", "SPONTANEOUS"])
const VIBE_NECESSITY = new Set<VibeNecessity>(["NEEDED", "WANTED"])
const RECURRING = new Set<RecurringMode>(["all", "exclude", "only"])

const parsePositiveInt = (raw: string | null): number => {
  if (!raw) return 0
  const n = Number(raw)
  if (!Number.isInteger(n) || n <= 0) return 0
  return n
}

const parseDateParam = (raw: string | null): string | null =>
  raw && DATE_KEY.test(raw) ? raw : null

/** マウント時に当月 from/to を seed してよいか（query 完全に空のときのみ）。 */
export const shouldSeedDefaultMonthQuery = (params: URLSearchParams): boolean =>
  params.toString() === ""

/** from/to から scope/month を復元（URL には載せない）。 */
export const enrichExpenseFilterForUi = (filter: ExpenseFilter): ExpenseFilter => {
  if (isAllTimePeriodFilter(filter)) {
    return { ...filter, scope: "all", month: null }
  }

  if (!filter.dateStart && !filter.dateEnd) {
    return { ...filter, scope: "all", month: null }
  }

  const week = presetDateRange("week")
  if (filter.dateStart === week.start && filter.dateEnd === week.end) {
    return { ...filter, scope: "week", month: null }
  }

  if (filter.dateStart && filter.dateEnd) {
    const startDate = parseDateKey(filter.dateStart)
    if (startDate) {
      const monthKey = formatMonthKey(startDate.getFullYear(), startDate.getMonth())
      const monthRange = calendarMonthDateRange(monthKey)
      if (monthRange.start === filter.dateStart && monthRange.end === filter.dateEnd) {
        const now = new Date()
        const currentKey = formatMonthKey(now.getFullYear(), now.getMonth())
        return {
          ...filter,
          scope: "month",
          month: monthKey === currentKey ? null : monthKey,
        }
      }
    }
  }

  return { ...filter, scope: "all", month: null }
}

export const createDefaultMonthExpenseFilter = (): ExpenseFilter => {
  const range = calendarMonthDateRange(null)
  return enrichExpenseFilterForUi({
    ...createDefaultExpenseFilter(),
    dateStart: range.start,
    dateEnd: range.end,
  })
}

export const parseExpenseFilterFromSearchParams = (params: URLSearchParams): ExpenseFilter => {
  let dateStart = parseDateParam(params.get("from"))
  let dateEnd = parseDateParam(params.get("to"))

  if (!dateStart && !dateEnd) {
    const legacy = parseDateParam(params.get("date"))
    if (legacy) {
      dateStart = legacy
      dateEnd = legacy
    }
  }

  const categoriesRaw = params.get("categories")
  const categoryUuids = categoriesRaw
    ? categoriesRaw
        .split(",")
        .map((s) => s.trim())
        .filter((id) => CATEGORY_UUID.test(id))
    : []

  const vibeRaw = params.get("vibeSocial")
  const vibeSocial =
    vibeRaw && VIBE_SOCIAL.has(vibeRaw as VibeSocial) ? (vibeRaw as VibeSocial) : null

  const planningRaw = params.get("vibePlanning")
  const vibePlanning =
    planningRaw && VIBE_PLANNING.has(planningRaw as VibePlanning)
      ? (planningRaw as VibePlanning)
      : null

  const necessityRaw = params.get("vibeNecessity")
  const vibeNecessity =
    necessityRaw && VIBE_NECESSITY.has(necessityRaw as VibeNecessity)
      ? (necessityRaw as VibeNecessity)
      : null

  const recurringRaw = params.get("recurring")
  const recurringMode =
    recurringRaw && RECURRING.has(recurringRaw as RecurringMode)
      ? (recurringRaw as RecurringMode)
      : "all"

  const base: ExpenseFilter = {
    ...createDefaultExpenseFilter(),
    searchQuery: params.get("q") ?? "",
    categoryUuids,
    amountMin: parsePositiveInt(params.get("min")),
    amountMax: parsePositiveInt(params.get("max")),
    dateStart,
    dateEnd,
    vibeSocial,
    vibePlanning,
    vibeNecessity,
    recurringMode,
  }

  return enrichExpenseFilterForUi(base)
}

/** month scope では URL に from/to を必ず載せるため日付を補完する。 */
const filterWithPeriodDatesForUrl = (filter: ExpenseFilter): ExpenseFilter => {
  if (filter.scope === "month") {
    const range = calendarMonthDateRange(filter.month)
    return { ...filter, dateStart: range.start, dateEnd: range.end }
  }
  return filter
}

export const serializeExpenseFilterToSearchParams = (filter: ExpenseFilter): URLSearchParams => {
  const normalized = filterWithPeriodDatesForUrl(filter)
  const params = new URLSearchParams()

  if (normalized.searchQuery) params.set("q", normalized.searchQuery)
  if (normalized.categoryUuids.length > 0)
    params.set("categories", normalized.categoryUuids.join(","))
  if (normalized.amountMin > 0) params.set("min", String(normalized.amountMin))
  if (normalized.amountMax > 0) params.set("max", String(normalized.amountMax))
  if (normalized.scope === "all") {
    params.set("to", formatDateKey(new Date()))
  } else {
    if (normalized.dateStart) params.set("from", normalized.dateStart)
    if (normalized.dateEnd) params.set("to", normalized.dateEnd)
  }
  if (normalized.vibeSocial) params.set("vibeSocial", normalized.vibeSocial)
  if (normalized.vibePlanning) params.set("vibePlanning", normalized.vibePlanning)
  if (normalized.vibeNecessity) params.set("vibeNecessity", normalized.vibeNecessity)
  if (normalized.recurringMode !== "all") params.set("recurring", normalized.recurringMode)

  return params
}

export const seedDefaultMonthSearchParams = (): URLSearchParams =>
  serializeExpenseFilterToSearchParams(createDefaultMonthExpenseFilter())
