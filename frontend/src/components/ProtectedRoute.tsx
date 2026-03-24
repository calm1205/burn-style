import { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router"
import { api } from "../lib/api"
import { STORAGE_KEYS } from "../lib/constants"

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

const clearTokenAndRedirect = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  window.location.href = "/signin"
}

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const [verified, setVerified] = useState(false)

  const verify = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!stored) return

    if (isTokenExpired(stored)) {
      clearTokenAndRedirect()
      return
    }

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

  // バックグラウンド復帰時
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
