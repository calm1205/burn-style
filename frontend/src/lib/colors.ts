export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
  "var(--color-chart-8)",
]

export const CHART_COLOR_GRAY = "var(--color-chart-gray)"

export const RANGE_COLORS = [
  "var(--color-chart-scale-1)",
  "var(--color-chart-scale-2)",
  "var(--color-chart-scale-3)",
  "var(--color-chart-scale-4)",
  "var(--color-chart-scale-5)",
  "var(--color-chart-scale-6)",
]

const LOW_RATIO_THRESHOLD = 0.05

export const assignChartColors = (
  items: { name: string; amount: number }[],
): Map<string, string> => {
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const colorMap = new Map<string, string>()
  let colorIndex = 0
  for (const item of items) {
    if (total > 0 && item.amount / total < LOW_RATIO_THRESHOLD) {
      colorMap.set(item.name, CHART_COLOR_GRAY)
    } else {
      colorMap.set(item.name, CHART_COLORS[colorIndex % CHART_COLORS.length])
      colorIndex++
    }
  }
  return colorMap
}
