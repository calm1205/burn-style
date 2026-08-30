import { type SubmitEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { client, getErrorMessage } from "../../common/libs/client"
import { STORAGE_KEYS } from "../../common/libs/constants"

export const useSignInForm = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState(
    () => localStorage.getItem(STORAGE_KEYS.LAST_USERNAME) ?? "",
  )
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // cold start対策: ユーザーが入力している間にAPI/DBを起こしておく
  useEffect(() => {
    const startedAt = performance.now()
    client
      .get("/health")
      .then(() => {
        const elapsedMs = Math.round(performance.now() - startedAt)
        console.info("[health] prewarm ok", { elapsedMs })
      })
      .catch((err) => {
        const elapsedMs = Math.round(performance.now() - startedAt)
        console.warn("[health] prewarm failed", { elapsedMs, err })
      })
  }, [])

  const clearUsername = () => {
    setUsername("")
    localStorage.removeItem(STORAGE_KEYS.LAST_USERNAME)
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const signInResponse = await api.signIn(username)
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, signInResponse.access_token)
      localStorage.setItem(STORAGE_KEYS.LAST_USERNAME, username)
      navigate("/expense/new")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to sign in"))
    } finally {
      setLoading(false)
    }
  }

  return { username, setUsername, error, loading, clearUsername, handleSubmit }
}
