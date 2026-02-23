import { STORAGE_KEYS } from "./constants"

class API {
  private static instance: API
  private baseUrl: string

  private constructor() {
    this.baseUrl = `http://localhost:${import.meta.env.VITE_API_PORT ?? "9999"}`
  }

  static getInstance(): API {
    if (!API.instance) {
      API.instance = new API()
    }
    return API.instance
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: response.statusText }))
      throw new Error(error.detail ?? response.statusText)
    }

    return response.json() as Promise<T>
  }

  // --- 認証 ---

  async register(username: string): Promise<RegisterVerifyResponse> {
    const { options } = await this.request<RegisterOptionsResponse>(
      "POST",
      "/auth/register/options",
      { username },
    )

    const credential = await navigator.credentials.create({
      publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(options),
    })
    if (!credential) {
      throw new Error("パスキーの登録がキャンセルされました")
    }

    const credentialJson = (credential as PublicKeyCredential).toJSON()

    return this.request<RegisterVerifyResponse>(
      "POST",
      "/auth/register/verify",
      {
        username,
        credential: credentialJson,
      },
    )
  }

  async login(username: string): Promise<LoginVerifyResponse> {
    const { options } = await this.request<LoginOptionsResponse>(
      "POST",
      "/auth/login/options",
      { username },
    )

    const credential = await navigator.credentials.get({
      publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(options),
    })
    if (!credential) {
      throw new Error("認証がキャンセルされました")
    }

    const credentialJson = (credential as PublicKeyCredential).toJSON()

    return this.request<LoginVerifyResponse>("POST", "/auth/login/verify", {
      username,
      credential: credentialJson,
    })
  }
}

export const api = API.getInstance()
