import { useEffect, useState } from "react"
import { Navigate } from "react-router"
import { api } from "../lib/api"
import { STORAGE_KEYS } from "../lib/constants"

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!token) return
    api
      .getMe()
      .then(() => setVerified(true))
      .catch(() => {
        // 401 → client.ts が /signin にリダイレクト
      })
  }, [token])

  if (!token) {
    return <Navigate to="/signin" replace />
  }

  if (!verified) {
    return null
  }

  return <>{children}</>
}
