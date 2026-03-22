import { client } from "./client"
import type {
  CategoryCreate,
  CategoryResponse,
  CategoryUpdate,
  ExpenseCreate,
  ExpenseResponse,
  ExpenseUpdate,
  RegisterOptionsResponse,
  RegisterVerifyResponse,
  SignInOptionsResponse,
  SignInVerifyResponse,
  UserResponse,
} from "./types"

// --- 認証 ---

const register = async (username: string): Promise<RegisterVerifyResponse> => {
  const { options } = await client.post<RegisterOptionsResponse>(
    "/auth/register/options",
    { name: username },
  )

  const credential = await navigator.credentials.create({
    publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(options),
  })
  if (!credential) {
    throw new Error("パスキーの登録がキャンセルされました")
  }

  const credentialJson = (credential as PublicKeyCredential).toJSON()

  return client.post<RegisterVerifyResponse>("/auth/register/verify", {
    name: username,
    credential: credentialJson,
  })
}

const signIn = async (username: string): Promise<SignInVerifyResponse> => {
  const { options } = await client.post<SignInOptionsResponse>(
    "/auth/signin/options",
    { name: username },
  )

  const credential = await navigator.credentials.get({
    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(options),
  })
  if (!credential) {
    throw new Error("認証がキャンセルされました")
  }

  const credentialJson = (credential as PublicKeyCredential).toJSON()

  return client.post<SignInVerifyResponse>("/auth/signin/verify", {
    name: username,
    credential: credentialJson,
  })
}

// --- ユーザー ---

const getMe = (): Promise<UserResponse> => client.get<UserResponse>("/me")

const updateMe = (data: { name: string }): Promise<UserResponse> =>
  client.patch<UserResponse>("/me", data)

const deleteMe = (): Promise<void> => client.delete<void>("/me")

const exportMe = (): Promise<unknown> => client.get<unknown>("/me/export")

// --- カテゴリ ---

const getCategories = (): Promise<CategoryResponse[]> =>
  client.get<CategoryResponse[]>("/categories")

const createCategory = (data: CategoryCreate): Promise<CategoryResponse> =>
  client.post<CategoryResponse>("/categories", data)

const updateCategory = (
  uuid: string,
  data: CategoryUpdate,
): Promise<CategoryResponse> =>
  client.patch<CategoryResponse>(`/categories/${uuid}`, data)

const deleteCategory = (uuid: string): Promise<void> =>
  client.delete<void>(`/categories/${uuid}`)

// --- 支出 ---

const getExpense = (uuid: string): Promise<ExpenseResponse> =>
  client.get<ExpenseResponse>(`/expenses/${uuid}`)

const getExpenses = (
  year?: number,
  month?: number,
): Promise<ExpenseResponse[]> => {
  const params = new URLSearchParams()
  if (year !== undefined) params.set("year", String(year))
  if (month !== undefined) params.set("month", String(month))
  const qs = params.toString()
  return client.get<ExpenseResponse[]>(`/expenses${qs ? `?${qs}` : ""}`)
}

const createExpense = (data: ExpenseCreate): Promise<ExpenseResponse> =>
  client.post<ExpenseResponse>("/expenses", data)

const updateExpense = (
  uuid: string,
  data: ExpenseUpdate,
): Promise<ExpenseResponse> =>
  client.patch<ExpenseResponse>(`/expenses/${uuid}`, data)

const deleteExpense = (uuid: string): Promise<void> =>
  client.delete<void>(`/expenses/${uuid}`)

export const api = {
  register,
  signIn,
  getMe,
  updateMe,
  deleteMe,
  exportMe,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getExpense,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
}
