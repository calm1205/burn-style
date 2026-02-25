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
  )
}
