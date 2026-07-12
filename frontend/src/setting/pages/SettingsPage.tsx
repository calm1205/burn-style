import { useOutletContext } from "react-router"

import type { UserResponse } from "../../common/libs/types"
import { SettingsAccountSection } from "../components/SettingsAccountSection"
import { SettingsDataSection } from "../components/SettingsDataSection"
import { SettingsDialogs } from "../components/SettingsDialogs"
import { SettingsNavSection } from "../components/SettingsNavSection"
import { SettingsProfileHeader } from "../components/SettingsProfileHeader"
import { SettingsStatusMessages } from "../components/SettingsStatusMessages"
import { SettingsThemePicker } from "../components/SettingsThemePicker"
import { useSettingsActions } from "../hooks/useSettingsActions"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
  refreshUser: () => Promise<void>
}

export const SettingsPage = () => {
  const { user, onLogout, refreshUser } = useOutletContext<OutletContext>()
  const actions = useSettingsActions({ user, refreshUser })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-6">
      <SettingsStatusMessages error={actions.error} success={actions.success} />

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

      <SettingsNavSection />

      <SettingsThemePicker />

      <SettingsDataSection
        loading={actions.loading}
        fileInputRef={actions.fileInputRef}
        onExport={actions.handleExport}
        onFileSelect={actions.handleFileSelect}
      />

      <SettingsAccountSection
        loading={actions.loading}
        onLogout={onLogout}
        onOpenDelete={actions.openDeleteDialog}
      />

      <SettingsDialogs actions={actions} />
    </div>
  )
}
