import { Cross2Icon } from "@radix-ui/react-icons"
import { type SubmitEvent, useState } from "react"
import { Link, useNavigate } from "react-router"

import { api } from "../../common/libs/api"
import { getErrorMessage } from "../../common/libs/client"
import { STORAGE_KEYS } from "../../common/libs/constants"

export const SignInPage = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState(
    () => localStorage.getItem(STORAGE_KEYS.LAST_USERNAME) ?? "",
  )
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const clearUsername = () => {
    setUsername("")
    localStorage.removeItem(STORAGE_KEYS.LAST_USERNAME)
  }

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await api.signIn(username)
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, result.access_token)
      localStorage.setItem(STORAGE_KEYS.LAST_USERNAME, username)
      navigate("/")
    } catch (err) {
      setError(getErrorMessage(err, "Failed to sign in"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 dark:text-gray-100">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-8">
        <h1 className="text-center text-3xl font-light tracking-tight">Sign In</h1>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-xs text-gray-500 dark:text-gray-400">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                placeholder="Warren Buffett"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={50}
                disabled={loading}
                className="w-full border-x-0 border-t-0 border-b border-gray-300 bg-transparent px-1 py-3 pr-8 outline-none transition-colors focus:border-primary disabled:opacity-50 dark:border-gray-600 dark:text-gray-100"
              />
              {username && !loading && (
                <button
                  type="button"
                  onClick={clearUsername}
                  className="absolute top-1/2 right-1 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <Cross2Icon className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary py-3 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {"Don't have an account? "}
          <Link to="/signup" className="text-primary underline underline-offset-4 hover:opacity-70">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  )
}
