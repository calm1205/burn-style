import { Navigate } from "react-router"
import { STORAGE_KEYS } from "../lib/constants"

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
