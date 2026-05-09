import type { ComponentType } from "react"
import { NavLink } from "react-router"

interface NavItem {
  label: string
  to: string
  icon?: ComponentType<{ className?: string }>
  accent?: boolean
}

interface LayoutPhoneProps {
  navItems: NavItem[]
}

export const LayoutPhone = ({ navItems }: LayoutPhoneProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-gray-200/60 bg-white/85 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur-xl backdrop-saturate-150 dark:border-gray-700/60 dark:bg-gray-900/85 md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 px-1 py-1 text-[10px] font-semibold tracking-wide ${
              isActive && !item.accent ? "text-primary" : "text-gray-400 dark:text-gray-500"
            }`
          }
        >
          {item.icon &&
            (item.accent ? (
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-white">
                <item.icon className="size-4" />
              </span>
            ) : (
              <span className="flex h-7 items-center justify-center">
                <item.icon className="size-5" />
              </span>
            ))}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
