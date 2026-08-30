import { useState } from "react"
import { useOutletContext } from "react-router"

import type { UserResponse } from "../../common/libs/types"
import { SettingsAccountSection } from "../components/SettingsAccountSection"
import { SettingsDialogs } from "../components/SettingsDialogs"
import { SettingsImportExportSection } from "../components/SettingsImportExportSection"
import { SettingsNavSection } from "../components/SettingsNavSection"
import { SettingsProfileHeader } from "../components/SettingsProfileHeader"
import { SettingsStatusMessages } from "../components/SettingsStatusMessages"
import { SettingsThemePicker } from "../components/SettingsThemePicker"
import { useSettingsBackup } from "../hooks/useSettingsBackup"
import { useSettingsProfile } from "../hooks/useSettingsProfile"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
  refreshUser: () => Promise<void>
}

export const SettingsPage = () => {
  const { user, onLogout, refreshUser } = useOutletContext<OutletContext>()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const profile = useSettingsProfile({ user, refreshUser, setError, setLoading })
  const backup = useSettingsBackup({ userName: user?.name, setError, setSuccess, setLoading })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-6">
      <SettingsStatusMessages error={error} success={success} />

      <SettingsProfileHeader name={user?.name} profile={profile} loading={loading} />

      <SettingsNavSection />

      <SettingsThemePicker />

      <SettingsImportExportSection
        loading={loading}
        fileInputRef={backup.fileInputRef}
        onExport={backup.exportBackup}
        onFileSelect={backup.selectImportFile}
      />

      <SettingsAccountSection
        loading={loading}
        onLogout={onLogout}
        onOpenDelete={profile.openDeleteDialog}
      />

      <SettingsDialogs profile={profile} backup={backup} loading={loading} />
    </div>
  )
}
