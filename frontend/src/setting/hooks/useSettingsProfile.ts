import { useState } from "react"

import { useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import { STORAGE_KEYS } from "../../common/libs/constants"
import type { UserResponse } from "../../common/libs/types"

interface UseSettingsProfileArgs {
  user: UserResponse | null
  refreshUser: () => Promise<void>
  setError: (message: string) => void
  setLoading: (loading: boolean) => void
}

/** Settings 画面のプロフィール編集とアカウント削除。 */
export const useSettingsProfile = ({
  user,
  refreshUser,
  setError,
  setLoading,
}: UseSettingsProfileArgs) => {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const { dialogRef, open: openDeleteDialog } = useConfirmDialog()

  const startEdit = () => {
    setName(user?.name ?? "")
    setEditing(true)
  }

  const updateProfile = async () => {
    setError("")
    setLoading(true)
    try {
      await api.updateMe({ name })
      setEditing(false)
      await refreshUser()
    } catch (err) {
      setError(getErrorMessage(err, "Update failed"))
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    setError("")
    setLoading(true)
    try {
      await api.deleteMe()
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      dialogRef.current?.close()
      window.location.href = "/auth"
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    } finally {
      setLoading(false)
    }
  }

  return {
    editing,
    name,
    setName,
    setEditing,
    startEdit,
    updateProfile,
    deleteAccount,
    dialogRef,
    openDeleteDialog,
  }
}
