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
      navigate("/login")
    } catch (err) {
      setError(getErrorMessage(err, "登録に失敗"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">サインアップ</h1>

        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          maxLength={50}
          disabled={loading}
          className="rounded border px-3 py-2 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "登録中..." : "サインアップ"}
        </button>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <p className="text-center text-sm">
          アカウントをお持ちの方は{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            ログイン
          </Link>
        </p>
      </form>
    </div>
  )
}
