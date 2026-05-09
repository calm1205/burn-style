import type { ComponentType } from "react"
import { NavLink } from "react-router"

import { UserMenu } from "./UserMenu"

interface NavItem {
  label: string
  to: string
  icon?: ComponentType<{ className?: string }>
}

interface LayoutLaptopProps {
  navItems: NavItem[]
  userName?: string
  onLogout: () => void
}

export const LayoutLaptop = ({ navItems, userName, onLogout }: LayoutLaptopProps) => {
  return (
    <aside className="hidden md:flex md:flex-col w-56 border-r border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="p-4 font-bold text-lg border-b border-gray-100 dark:border-gray-700">
        BurnStyle
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"}`
            }
          >
            {item.icon && <item.icon className="size-4 shrink-0" />}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-100 dark:border-gray-700">
        <UserMenu userName={userName} onLogout={onLogout} />
      </div>
    </aside>
  )
}
