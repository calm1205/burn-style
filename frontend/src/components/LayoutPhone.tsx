import { NavLink } from "react-router"

interface NavItem {
  label: string
  to: string
}

interface LayoutPhoneProps {
  navItems: NavItem[]
  onLogout: () => void
}

export const LayoutPhone = ({ navItems, onLogout }: LayoutPhoneProps) => {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <span className="font-bold text-lg">Finance</span>
        <button
          type="button"
          onClick={onLogout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ログアウト
        </button>
      </header>
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
    </>
  )
}
