import { ConfirmDialog } from "../../common/components/ConfirmDialog"
import type { useSettingsBackup } from "../hooks/useSettingsBackup"
import type { useSettingsProfile } from "../hooks/useSettingsProfile"

interface SettingsDialogsProps {
  profile: ReturnType<typeof useSettingsProfile>
  backup: ReturnType<typeof useSettingsBackup>
  loading: boolean
}

export const SettingsDialogs = ({ profile, backup, loading }: SettingsDialogsProps) => {
  return (
    <>
      <ConfirmDialog
        message="All your expense data will be permanently deleted. Are you sure?"
        onConfirm={profile.deleteAccount}
        loading={loading}
        dialogRef={profile.dialogRef}
      />
      <ConfirmDialog
        message="All existing categories and expenses will be deleted and replaced with the imported data. Continue?"
        onConfirm={backup.importBackup}
        confirmText="Import"
        loading={loading}
        dialogRef={backup.importDialogRef}
      />
    </>
  )
}
