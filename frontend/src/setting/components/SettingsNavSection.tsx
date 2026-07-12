import { useNavigate } from "react-router"

import { CounterClockwiseClockIcon, RowsIcon } from "../../common/icons"
import { SettingsRow, type SettingsRowAction } from "./SettingsRow"

export const SettingsNavSection = () => {
  const navigate = useNavigate()

  const rows: SettingsRowAction[] = [
    { label: "Categories", Icon: RowsIcon, onClick: () => navigate("/category"), accent: true },
    {
      label: "Recurring",
      Icon: CounterClockwiseClockIcon,
      onClick: () => navigate("/expense/recurring"),
      accent: true,
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {rows.map((row, i) => (
        <SettingsRow key={row.label} row={row} divided={i > 0} />
      ))}
    </div>
  )
}
