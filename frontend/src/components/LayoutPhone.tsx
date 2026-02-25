import { ExitIcon, PersonIcon } from "@radix-ui/react-icons"
import { Popover } from "radix-ui"
import type { ComponentType } from "react"
import { NavLink } from "react-router"

interface NavItem {
  label: string
  to: string
  icon?: ComponentType<{ className?: string }>
}

interface LayoutPhoneProps {
  navItems: NavItem[]
  userName?: string
  onLogout: () => void
}

export const LayoutPhone = ({
  navItems,
  userName,
  onLogout,
}: LayoutPhoneProps) => {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-end bg-white px-4 py-3 md:hidden">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
            >
              <PersonIcon className="size-5" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              side="bottom"
              sideOffset={4}
              align="end"
              className="rounded-md border border-gray-200 bg-white p-1 shadow-md"
            >
              <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100">
                {userName ?? "..."}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                <ExitIcon className="size-4 shrink-0" />
                ログアウト
              </button>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-gray-200 bg-white md:hidden">
        {navItems.map((item, index) => {
          const isLast = index === navItems.length - 1
          return isLast ? (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-1 items-center justify-center py-3"
            >
              <span className="flex items-center justify-center rounded-full bg-black p-2">
                {item.icon && <item.icon className="size-5 text-white" />}
              </span>
            </NavLink>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 items-center justify-center py-3 text-xs font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`
              }
            >
              {item.icon ? <item.icon className="size-5" /> : item.label}
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}
