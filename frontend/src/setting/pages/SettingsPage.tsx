import {
  CheckIcon,
  CounterClockwiseClockIcon,
  DownloadIcon,
  ExitIcon,
  FileTextIcon,
  Pencil1Icon,
  ResetIcon,
  RowsIcon,
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
import { SettingsRow, type SettingsRowAction } from "../components/SettingsRow"
import { SettingsSectionLabel } from "../components/SettingsSectionLabel"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
  refreshUser: () => Promise<void>
}

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { user, onLogout, refreshUser } = useOutletContext<OutletContext>()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme)
  const [loading, setLoading] = useState(false)
  const { dialogRef, open: openDialog } = useConfirmDialog()
  const { dialogRef: importDialogRef, open: openImportDialog } = useConfirmDialog()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDataRef = useRef<unknown>(null)

  const initial = (user?.name ?? "?").charAt(0).toUpperCase()

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

  const navRows: SettingsRowAction[] = [
    {
      label: "Categories",
      Icon: RowsIcon,
      onClick: () => navigate("/category"),
      accent: true,
    },
    {
      label: "Templates",
      Icon: FileTextIcon,
      onClick: () => navigate("/expense/template"),
      accent: true,
    },
    {
      label: "Recurring",
      Icon: CounterClockwiseClockIcon,
      onClick: () => navigate("/expense/recurring"),
      accent: true,
    },
  ]

  const dataRows: SettingsRowAction[] = [
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
      onClick: handleExport,
      accent: true,
    },
  ]

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-6">
      {error && <p className="px-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="px-2 text-sm text-green-600 dark:text-green-400">{success}</p>}

      <div className="flex items-center gap-3.5 px-2 pt-2">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl font-bold dark:bg-gray-700">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="min-w-0 flex-1 border-b border-gray-300 px-1 py-0.5 text-lg font-bold tracking-tight outline-none focus:border-primary dark:border-gray-600 dark:bg-transparent dark:text-gray-100"
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
              className="flex w-full items-center gap-2 text-left"
            >
              <span className="truncate text-xl font-bold tracking-tight">
                {user?.name ?? "---"}
              </span>
              <Pencil1Icon className="size-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {navRows.map((row, i) => (
          <SettingsRow key={row.label} row={row} divided={i > 0} />
        ))}
      </div>

      <div>
        <SettingsSectionLabel>Preferences</SettingsSectionLabel>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Theme</p>
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
      </div>

      <div>
        <SettingsSectionLabel>Your data</SettingsSectionLabel>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {dataRows.map((row, i) => (
            <SettingsRow key={row.label} row={row} divided={i > 0} />
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div>
        <SettingsSectionLabel>Account</SettingsSectionLabel>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <ExitIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Log out</div>
              {user?.name && (
                <div className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                  {user.name}
                </div>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={openDialog}
            disabled={loading}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3.5 text-left text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <TrashIcon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Delete account</div>
              <div className="truncate text-[11px] text-red-400/80 dark:text-red-300/60">
                Permanently erase all expenses
              </div>
            </div>
          </button>
        </div>
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
