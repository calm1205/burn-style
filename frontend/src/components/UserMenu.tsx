import { ExitIcon, PersonIcon } from "@radix-ui/react-icons"
import { Popover } from "radix-ui"

interface UserMenuProps {
  userName?: string
  onLogout: () => void
}

export const UserMenu = ({ userName, onLogout }: UserMenuProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
        >
          <PersonIcon className="size-4 shrink-0" />
          <span className="truncate">{userName ?? "..."}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={4}
          className="rounded-xl border border-gray-100 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-700"
          >
            <ExitIcon className="size-4 shrink-0" />
            ログアウト
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
