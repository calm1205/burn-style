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

    if (response.status === 204) {
      return undefined as T
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
  // --- カテゴリ ---

  async getCategories(): Promise<CategoryResponse[]> {
    return this.request<CategoryResponse[]>("GET", "/categories")
  }

  async createCategory(data: CategoryCreate): Promise<CategoryResponse> {
    return this.request<CategoryResponse>("POST", "/categories", data)
  }

  async updateCategory(
    uuid: string,
    data: CategoryUpdate,
  ): Promise<CategoryResponse> {
    return this.request<CategoryResponse>("PATCH", `/categories/${uuid}`, data)
  }

  async deleteCategory(uuid: string): Promise<void> {
    return this.request<void>("DELETE", `/categories/${uuid}`)
  }

  // --- サブスクリプションテンプレート ---

  async getSubscriptionTemplates(): Promise<SubscriptionTemplate[]> {
    return this.request<SubscriptionTemplate[]>(
      "GET",
      "/subscription-templates",
    )
  }

  async createSubscriptionTemplate(
    data: SubscriptionTemplateCreate,
  ): Promise<SubscriptionTemplate> {
    return this.request<SubscriptionTemplate>(
      "POST",
      "/subscription-templates",
      data,
    )
  }

  async updateSubscriptionTemplate(
    uuid: string,
    data: SubscriptionTemplateUpdate,
  ): Promise<SubscriptionTemplate> {
    return this.request<SubscriptionTemplate>(
      "PATCH",
      `/subscription-templates/${uuid}`,
      data,
    )
  }

  async deleteSubscriptionTemplate(uuid: string): Promise<void> {
    return this.request<void>("DELETE", `/subscription-templates/${uuid}`)
  }

  async bulkRecord(templateUuids: string[]): Promise<BulkRecordResponse> {
    return this.request<BulkRecordResponse>(
      "POST",
      "/subscription-templates/bulk-record",
      {
        template_uuids: templateUuids,
      },
    )
  }
}

export const api = API.getInstance()
