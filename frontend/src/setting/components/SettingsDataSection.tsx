import { DownloadIcon, UploadIcon } from "@radix-ui/react-icons"

import { SettingsRow, type SettingsRowAction } from "./SettingsRow"
import { SettingsSectionLabel } from "./SettingsSectionLabel"

interface SettingsDataSectionProps {
  loading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onExport: () => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const SettingsDataSection = ({
  loading,
  fileInputRef,
  onExport,
  onFileSelect,
}: SettingsDataSectionProps) => {
  const rows: SettingsRowAction[] = [
    {
      label: "Import data",
      Icon: DownloadIcon,
      onClick: () => fileInputRef.current?.click(),
      accent: true,
      disabled: loading,
    },
    {
      label: "Export your data",
      Icon: UploadIcon,
      onClick: onExport,
      accent: true,
    },
  ]

  return (
    <div>
      <SettingsSectionLabel>Your data</SettingsSectionLabel>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {rows.map((row, i) => (
          <SettingsRow key={row.label} row={row} divided={i > 0} />
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onFileSelect}
        className="hidden"
      />
    </div>
  )
}
