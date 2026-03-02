import { STORAGE_KEYS } from "./constants"

export interface ApiError {
  status: number
  message: string
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "リクエストが不正です",
  403: "アクセス権限がありません",
  404: "リソースが見つかりません",
  409: "データが競合しています",
  422: "入力内容に誤りがあります",
  500: "サーバーエラーが発生しました",
}

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:9999"

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })

  const newToken = response.headers.get("X-New-Token")
  if (newToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken)
  }

  if (response.status === 401) {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    window.location.href = "/signin"
    const apiError: ApiError = { status: 401, message: "認証が切れました" }
    throw apiError
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = body?.detail
    const message =
      typeof detail === "string"
        ? detail
        : (STATUS_MESSAGES[response.status] ?? response.statusText)
    const apiError: ApiError = { status: response.status, message }
    throw apiError
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const isApiError = (err: unknown): err is ApiError =>
  typeof err === "object" &&
  err !== null &&
  "status" in err &&
  "message" in err

export const getErrorMessage = (err: unknown, fallback: string): string =>
  isApiError(err) ? err.message : fallback

export const client = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
}
