import type { ReactNode } from "react"

interface PrimaryButtonProps {
  type?: "button" | "submit"
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

export const PrimaryButton = ({
  type = "button",
  onClick,
  disabled,
  children,
}: PrimaryButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(47,116,208,0.32)] hover:bg-primary-hover disabled:opacity-50 disabled:shadow-none"
  >
    {children}
  </button>
)
