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
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center py-3 text-xs font-medium ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500"}`
          }
        >
          {item.icon ? <item.icon className="size-5" /> : item.label}
        </NavLink>
      ))}
    </nav>
  )
}
