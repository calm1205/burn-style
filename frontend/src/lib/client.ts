import { STORAGE_KEYS } from "./constants"

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
    window.location.href = "/login"
    throw new Error("認証が切れました")
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail ?? response.statusText)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const client = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
}
