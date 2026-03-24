import { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router"
import { api } from "../lib/api"
import { STORAGE_KEYS } from "../lib/constants"

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const [verified, setVerified] = useState(false)

  const verify = useCallback(() => {
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) return
    api
      .getMe()
      .then(() => setVerified(true))
      .catch(() => {
        // 401 → client.ts が /signin にリダイレクト
      })
  }, [])

  // 初回マウント時
  useEffect(() => {
    verify()
  }, [verify])

  // PWAバックグラウンド復帰時
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        verify()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [verify])

  if (!token) {
    return <Navigate to="/signin" replace />
  }

  if (!verified) {
    return null
  }

  return <>{children}</>
}
