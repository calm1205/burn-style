import { ExitIcon, TrashIcon } from "@radix-ui/react-icons"

import { SettingsSectionLabel } from "./SettingsSectionLabel"

interface SettingsAccountSectionProps {
  userName: string | undefined
  loading: boolean
  onLogout: () => void
  onOpenDelete: () => void
}

export const SettingsAccountSection = ({
  userName,
  loading,
  onLogout,
  onOpenDelete,
}: SettingsAccountSectionProps) => (
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
          {userName && (
            <div className="truncate text-[11px] text-gray-500 dark:text-gray-400">{userName}</div>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onOpenDelete}
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
)
