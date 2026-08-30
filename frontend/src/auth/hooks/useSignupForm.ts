import { type SubmitEvent, useState } from "react"
import { useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"

export const useSignupForm = () => {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const signUp = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.register(username)
      navigate("/signin")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to sign up"))
    } finally {
      setLoading(false)
    }
  }

  return { username, setUsername, error, loading, signUp }
}
