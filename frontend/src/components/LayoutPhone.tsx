import type { ComponentType } from "react"
import { NavLink } from "react-router"

interface NavItem {
  label: string
  to: string
  icon?: ComponentType<{ className?: string }>
}

interface LayoutPhoneProps {
  navItems: NavItem[]
}

export const LayoutPhone = ({ navItems }: LayoutPhoneProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-20 border-t border-gray-100 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.04)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] md:hidden">
      {navItems.map((item, index) => {
        const isLast = index === navItems.length - 1

        return isLast ? (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-1 items-center justify-center py-3"
          >
            <span className="flex items-center justify-center rounded-full bg-primary p-2">
              {item.icon && <item.icon className="size-5 text-white" />}
            </span>
          </NavLink>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center py-3 text-xs font-medium ${isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`
            }
          >
            {item.icon ? <item.icon className="size-5" /> : item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
