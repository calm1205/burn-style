import {
  CheckIcon,
  ExitIcon,
  Pencil1Icon,
  ResetIcon,
} from "@radix-ui/react-icons"
import { Button, Separator, Text } from "@radix-ui/themes"
import { useState } from "react"
import { useOutletContext } from "react-router"
import { ConfirmDialog, useConfirmDialog } from "../components/ConfirmDialog"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"
import { STORAGE_KEYS } from "../lib/constants"
import type { UserResponse } from "../lib/types"

interface OutletContext {
  user: UserResponse | null
  onLogout: () => void
  refreshUser: () => Promise<void>
}

export const SettingsPage = () => {
  const { user, onLogout, refreshUser } = useOutletContext<OutletContext>()
  const [error, setError] = useState("")
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState("")
  const { dialogRef, open: openDialog } = useConfirmDialog()

  const startEdit = () => {
    setName(user?.name ?? "")
    setEditing(true)
  }

  const handleUpdate = async () => {
    setError("")
    try {
      await api.updateMe({ name })
      setEditing(false)
      await refreshUser()
    } catch (err) {
      setError(getErrorMessage(err, "Update failed"))
    }
  }

  const handleDelete = async () => {
    setError("")
    try {
      await api.deleteMe()
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      dialogRef.current?.close()
      window.location.href = "/auth"
    } catch (err) {
      setError(getErrorMessage(err, "Delete failed"))
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6" style={{ paddingTop: "20vh" }}>
      <h1 className="mb-6 text-2xl font-bold">Setting</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <Separator size="4" mb="4" />

      <div className="mb-6">
        <Text size="3" weight="bold" as="p" mb="2">
          Account
        </Text>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="flex-1 border-b border-gray-300 px-1 py-1 text-sm outline-none focus:border-gray-900"
            />
            <button
              type="button"
              onClick={handleUpdate}
              className="text-blue-500 hover:text-blue-700"
            >
              <CheckIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ResetIcon className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Text size="2" color="gray" as="p">
              Username: {user?.name ?? "---"}
            </Text>
            <button
              type="button"
              onClick={startEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <Pencil1Icon className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      <Separator size="4" mb="4" />

      <div className="flex gap-3">
        <Button variant="outline" color="red" onClick={onLogout}>
          <ExitIcon />
          Logout
        </Button>
        <Button variant="solid" color="red" onClick={openDialog}>
          Delete Account
        </Button>
      </div>

      <ConfirmDialog
        message="All your expense data will be permanently deleted. Are you sure?"
        onConfirm={handleDelete}
        dialogRef={dialogRef}
      />
    </div>
  )
}
