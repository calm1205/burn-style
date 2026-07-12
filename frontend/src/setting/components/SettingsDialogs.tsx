import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import type { useSettingsActions } from "../hooks/useSettingsActions"

interface SettingsDialogsProps {
  actions: ReturnType<typeof useSettingsActions>
}

export const SettingsDialogs = ({ actions }: SettingsDialogsProps) => {
  return (
    <>
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
    </>
  )
}
