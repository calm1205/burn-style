import { CounterClockwiseClockIcon, RowsIcon } from "@radix-ui/react-icons"
import { useNavigate, useOutletContext } from "react-router"

import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import type { UserResponse } from "../../common/libs/types"
import { SettingsAccountSection } from "../components/SettingsAccountSection"
import { SettingsDataSection } from "../components/SettingsDataSection"
import { SettingsProfileHeader } from "../components/SettingsProfileHeader"
import { SettingsRow, type SettingsRowAction } from "../components/SettingsRow"
import { SettingsThemePicker } from "../components/SettingsThemePicker"
import { useSettingsActions } from "../hooks/useSettingsActions"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
  refreshUser: () => Promise<void>
}

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { user, onLogout, refreshUser } = useOutletContext<OutletContext>()
  const actions = useSettingsActions({ user, refreshUser })

  const navRows: SettingsRowAction[] = [
    { label: "Categories", Icon: RowsIcon, onClick: () => navigate("/category"), accent: true },
    {
      label: "Recurring",
      Icon: CounterClockwiseClockIcon,
      onClick: () => navigate("/expense/recurring"),
      accent: true,
    },
  ]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-6">
      {actions.error && (
        <p className="px-2 text-sm text-red-600 dark:text-red-400">{actions.error}</p>
      )}
      {actions.success && (
        <p className="px-2 text-sm text-green-600 dark:text-green-400">{actions.success}</p>
      )}

      <SettingsProfileHeader
        name={user?.name}
        editing={actions.editing}
        draftName={actions.name}
        loading={actions.loading}
        onDraftChange={actions.setName}
        onStartEdit={actions.startEdit}
        onSave={actions.handleUpdate}
        onCancel={() => actions.setEditing(false)}
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {navRows.map((row, i) => (
          <SettingsRow key={row.label} row={row} divided={i > 0} />
        ))}
      </div>

      <SettingsThemePicker />

      <SettingsDataSection
        loading={actions.loading}
        fileInputRef={actions.fileInputRef}
        onExport={actions.handleExport}
        onFileSelect={actions.handleFileSelect}
      />

      <SettingsAccountSection
        userName={user?.name}
        loading={actions.loading}
        onLogout={onLogout}
        onOpenDelete={actions.openDeleteDialog}
      />

      <ConfirmDialog
        message="All your expense data will be permanently deleted. Are you sure?"
        onConfirm={actions.handleDelete}
        loading={actions.loading}
        dialogRef={actions.dialogRef}
      />
      <ConfirmDialog
        message="All existing categories and expenses will be deleted and replaced with the imported data. Continue?"
        onConfirm={actions.handleImport}
        confirmText="Import"
        loading={actions.loading}
        dialogRef={actions.importDialogRef}
      />
    </div>
  )
}
