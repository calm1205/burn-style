import { type SubmitEvent, useState } from "react";
import { login } from "../lib/webauthn";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username);
      localStorage.setItem("access_token", result.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex w-80 flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">ログイン</h1>

        <input
          type="text"
          placeholder="ユーザー名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          className="rounded border px-3 py-2 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "認証中..." : "ログイン"}
        </button>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
