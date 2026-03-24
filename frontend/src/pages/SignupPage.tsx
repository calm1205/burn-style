import { type SubmitEvent, useState } from "react"
import { Link, useNavigate } from "react-router"
import { api } from "../lib/api"
import { getErrorMessage } from "../lib/client"

export const SignupPage = () => {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
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

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-8"
      >
        <h1 className="text-center text-3xl font-light tracking-tight">
          Sign Up
        </h1>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-xs text-gray-500 dark:text-gray-400"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Warren Buffett"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={50}
              disabled={loading}
              className="border-x-0 border-t-0 border-b border-gray-300 bg-transparent px-1 py-3 outline-none transition-colors focus:border-primary disabled:opacity-50 dark:border-gray-600 dark:text-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary py-3 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </div>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {"Already have an account? "}
          <Link
            to="/signin"
            className="text-primary underline underline-offset-4 hover:opacity-70"
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}
