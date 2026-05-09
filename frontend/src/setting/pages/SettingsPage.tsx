import {
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  CounterClockwiseClockIcon,
  DownloadIcon,
  ExitIcon,
  FileTextIcon,
  Pencil1Icon,
  ResetIcon,
  TrashIcon,
  UploadIcon,
} from "@radix-ui/react-icons"
import { useRef, useState } from "react"
import { useNavigate, useOutletContext } from "react-router"

import { ConfirmDialog, useConfirmDialog } from "../../common/components/ConfirmDialog"
import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import { STORAGE_KEYS } from "../../common/libs/constants"
import { type ThemeMode, applyTheme, getStoredTheme } from "../../common/libs/theme"
import type { UserResponse } from "../../common/libs/types"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
  refreshUser: () => Promise<void>
}

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { user, onLogout, refreshUser } = useOutletContext<OutletContext>()
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme)
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const { dialogRef, open: openDialog } = useConfirmDialog()
  const { dialogRef: importDialogRef, open: openImportDialog } = useConfirmDialog()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDataRef = useRef<unknown>(null)

  const changeTheme = (mode: ThemeMode) => {
    setTheme(mode)
    applyTheme(mode)
  }

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
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
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

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

      {/* Profile */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Username</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="flex-1 border-b border-gray-300 px-1 py-1 text-base outline-none focus:border-primary dark:border-gray-600 dark:bg-transparent dark:text-gray-100"
            />
            <button
              type="button"
              onClick={handleUpdate}
              disabled={loading}
              className="text-primary hover:text-primary-hover disabled:opacity-50"
            >
              <CheckIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <ResetIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="flex w-full items-center justify-between"
          >
            <span className="text-base font-bold">{user?.name ?? "---"}</span>
            <Pencil1Icon className="size-3.5 text-gray-400 dark:text-gray-500" />
          </button>
        )}
      </div>

      {/* Theme */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">Theme</p>
        <div className="flex gap-2">
          {(["system", "light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => changeTheme(mode)}
              className={`flex-1 rounded-xl py-2 text-sm transition-colors ${
                theme === mode
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
            >
              {mode === "system" ? "System" : mode === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => navigate("/category")}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <BookmarkIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Category</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/expense/template")}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FileTextIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Template</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/expense/recurring")}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <CounterClockwiseClockIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Recurring</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <DownloadIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Export Data</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <UploadIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Import Data</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ExitIcon className="size-4 text-gray-400 dark:text-gray-500" />
          <span className="flex-1">Logout</span>
          <ChevronRightIcon className="size-4 text-gray-300 dark:text-gray-600" />
        </button>
      </div>

      {/* Danger Zone */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800">
        <button
          type="button"
          onClick={openDialog}
          disabled={loading}
          className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
        >
          <TrashIcon className="size-4" />
          <span className="flex-1">Delete Account</span>
        </button>
      </div>

      <ConfirmDialog
        message="All your expense data will be permanently deleted. Are you sure?"
        onConfirm={handleDelete}
        loading={loading}
        dialogRef={dialogRef}
      />
      <ConfirmDialog
        message="All existing categories, expenses, and templates will be deleted and replaced with the imported data. Continue?"
        onConfirm={handleImport}
        confirmText="Import"
        loading={loading}
        dialogRef={importDialogRef}
      />
    </div>
  )
}
