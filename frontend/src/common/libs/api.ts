import { client } from "./client"
import type {
  CategoryCreate,
  CategoryMergeRequest,
  CategoryResponse,
  CategoryUpdate,
  ExpenseCreate,
  ExpenseResponse,
  ExpenseTemplateCreate,
  ExpenseTemplateResponse,
  ExpenseTemplateUpdate,
  ExpenseUpdate,
  ImportResponse,
  RegisterOptionsResponse,
  RegisterVerifyResponse,
  SignInOptionsResponse,
  SignInVerifyResponse,
  UserResponse,
} from "./types"

// --- Auth ---

const register = async (username: string): Promise<RegisterVerifyResponse> => {
  const { options } = await client.post<RegisterOptionsResponse>("/auth/register/options", {
    name: username,
  })

  const credential = await navigator.credentials.create({
    publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(options),
  })
  if (!credential) {
    throw new Error("Passkey registration was cancelled")
  }

  const credentialJson = (credential as PublicKeyCredential).toJSON()

  return client.post<RegisterVerifyResponse>("/auth/register/verify", {
    name: username,
    credential: credentialJson,
  })
}

const signIn = async (username: string): Promise<SignInVerifyResponse> => {
  const { options } = await client.post<SignInOptionsResponse>("/auth/signin/options", {
    name: username,
  })

  const credential = await navigator.credentials.get({
    publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(options),
  })
  if (!credential) {
    throw new Error("Authentication was cancelled")
  }

  const credentialJson = (credential as PublicKeyCredential).toJSON()

  return client.post<SignInVerifyResponse>("/auth/signin/verify", {
    name: username,
    credential: credentialJson,
  })
}

// --- User ---

const getMe = (): Promise<UserResponse> => client.get<UserResponse>("/me")

const updateMe = (data: { name: string }): Promise<UserResponse> =>
  client.patch<UserResponse>("/me", data)

const deleteMe = (): Promise<void> => client.delete<void>("/me")

const exportMe = (): Promise<unknown> => client.get<unknown>("/me/export")

const importMe = (data: unknown): Promise<ImportResponse> =>
  client.post<ImportResponse>("/me/import", data)

// --- Category ---

const getCategories = (): Promise<CategoryResponse[]> =>
  client.get<CategoryResponse[]>("/categories")

const createCategory = (data: CategoryCreate): Promise<CategoryResponse> =>
  client.post<CategoryResponse>("/categories", data)

const updateCategory = (uuid: string, data: CategoryUpdate): Promise<CategoryResponse> =>
  client.patch<CategoryResponse>(`/categories/${uuid}`, data)

const deleteCategory = (uuid: string): Promise<void> => client.delete<void>(`/categories/${uuid}`)

const mergeCategory = (uuid: string, data: CategoryMergeRequest): Promise<CategoryResponse> =>
  client.post<CategoryResponse>(`/categories/${uuid}/merge`, data)

// --- Expense ---

const getExpense = (uuid: string): Promise<ExpenseResponse> =>
  client.get<ExpenseResponse>(`/expenses/${uuid}`)

const getExpenses = (year?: number, month?: number): Promise<ExpenseResponse[]> => {
  const params = new URLSearchParams()
  if (year !== undefined) params.set("year", String(year))
  if (month !== undefined) params.set("month", String(month))
  const qs = params.toString()
  return client.get<ExpenseResponse[]>(`/expenses${qs ? `?${qs}` : ""}`)
}

const createExpense = (data: ExpenseCreate): Promise<ExpenseResponse> =>
  client.post<ExpenseResponse>("/expenses", data)

const updateExpense = (uuid: string, data: ExpenseUpdate): Promise<ExpenseResponse> =>
  client.patch<ExpenseResponse>(`/expenses/${uuid}`, data)

const deleteExpense = (uuid: string): Promise<void> => client.delete<void>(`/expenses/${uuid}`)

// --- Expense Template ---

const getExpenseTemplates = (): Promise<ExpenseTemplateResponse[]> =>
  client.get<ExpenseTemplateResponse[]>("/expense-templates")

const createExpenseTemplate = (data: ExpenseTemplateCreate): Promise<ExpenseTemplateResponse> =>
  client.post<ExpenseTemplateResponse>("/expense-templates", data)

const updateExpenseTemplate = (
  uuid: string,
  data: ExpenseTemplateUpdate,
): Promise<ExpenseTemplateResponse> =>
  client.patch<ExpenseTemplateResponse>(`/expense-templates/${uuid}`, data)

const deleteExpenseTemplate = (uuid: string): Promise<void> =>
  client.delete<void>(`/expense-templates/${uuid}`)

export const api = {
  register,
  signIn,
  getMe,
  updateMe,
  deleteMe,
  exportMe,
  importMe,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  mergeCategory,
  getExpense,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseTemplates,
  createExpenseTemplate,
  updateExpenseTemplate,
  deleteExpenseTemplate,
}
