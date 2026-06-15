const pad = (n: number) => String(n).padStart(2, "0")

/** ISO 文字列を datetime-local input 用のローカル日時文字列に変換。 */
export const toLocalDatetime = (isoStr: string) => {
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
