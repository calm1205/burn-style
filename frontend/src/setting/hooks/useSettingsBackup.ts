import { useRef } from "react"

import { useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"

interface Args {
  userName: string | undefined
  setError: (message: string) => void
  setSuccess: (message: string) => void
  setLoading: (loading: boolean) => void
}

/** Settings 画面の export / import 操作。 */
export const useSettingsBackup = ({ userName, setError, setSuccess, setLoading }: Args) => {
  const { dialogRef: importDialogRef, open: openImportDialog } = useConfirmDialog()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingImportSnapshotRef = useRef<unknown>(null)

  const exportBackup = async () => {
    try {
      const data = await api.exportMe()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `${userName ?? "export"}_expense.json`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      setError(getErrorMessage(err, "Export failed"))
    }
  }

  const selectImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const reader = new FileReader()
    reader.addEventListener("load", (event) => {
      try {
        pendingImportSnapshotRef.current = JSON.parse(event.target?.result as string)
        openImportDialog()
      } catch {
        setError("Invalid JSON file")
      }
    })
    reader.readAsText(file)
  }

  const importBackup = async () => {
    setError("")
    setSuccess("")
    setLoading(true)
    importDialogRef.current?.close()
    try {
      const importResult = await api.importMe(pendingImportSnapshotRef.current)
      setSuccess(importResult.message)
    } catch (err) {
      setError(getErrorMessage(err, "Import failed"))
    } finally {
      pendingImportSnapshotRef.current = null
      setLoading(false)
    }
  }

  return {
    fileInputRef,
    importDialogRef,
    exportBackup,
    selectImportFile,
    importBackup,
  }
}
