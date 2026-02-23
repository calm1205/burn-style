import { NavLink } from "react-router"

interface NavItem {
  label: string
  to: string
}

interface LayoutPhoneProps {
  navItems: NavItem[]
}

export const LayoutPhone = ({ navItems }: LayoutPhoneProps) => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-gray-200 bg-white md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center py-3 text-xs font-medium ${isActive ? "text-gray-900" : "text-gray-500"}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
