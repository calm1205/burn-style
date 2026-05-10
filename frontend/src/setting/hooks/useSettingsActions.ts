import { useRef, useState } from "react"

import { useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import { STORAGE_KEYS } from "../../common/libs/constants"
import type { UserResponse } from "../../common/libs/types"

interface Args {
  user: UserResponse | null
  refreshUser: () => Promise<void>
}

/** Settings 画面のサーバ操作 (名前更新 / 削除 / export / import) と関連 state を一括提供。 */
export const useSettingsActions = ({ user, refreshUser }: Args) => {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const { dialogRef, open: openDeleteDialog } = useConfirmDialog()
  const { dialogRef: importDialogRef, open: openImportDialog } = useConfirmDialog()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDataRef = useRef<unknown>(null)

  const startEdit = () => {
    setName(user?.name ?? "")
    setEditing(true)
  }

  const handleUpdate = async () => {
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

  const handleDelete = async () => {
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

  const handleExport = async () => {
    try {
      const data = await api.exportMe()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${user?.name ?? "export"}_expense.json`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      setError(getErrorMessage(err, "Export failed"))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const reader = new FileReader()
    reader.addEventListener("load", (event) => {
      try {
        importDataRef.current = JSON.parse(event.target?.result as string)
        openImportDialog()
      } catch {
        setError("Invalid JSON file")
      }
    })
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setError("")
    setSuccess("")
    setLoading(true)
    importDialogRef.current?.close()
    try {
      const result = await api.importMe(importDataRef.current)
      setSuccess(result.message)
    } catch (err) {
      setError(getErrorMessage(err, "Import failed"))
    } finally {
      importDataRef.current = null
      setLoading(false)
    }
  }

  return {
    error,
    success,
    editing,
    name,
    loading,
    fileInputRef,
    dialogRef,
    importDialogRef,
    setName,
    setEditing,
    startEdit,
    handleUpdate,
    handleDelete,
    handleExport,
    handleFileSelect,
    handleImport,
    openDeleteDialog,
  }
}
