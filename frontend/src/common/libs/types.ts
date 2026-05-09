export interface RegisterOptionsResponse {
  options: PublicKeyCredentialCreationOptionsJSON
}

export interface RegisterVerifyResponse {
  message: string
}

export interface SignInOptionsResponse {
  options: PublicKeyCredentialRequestOptionsJSON
}

export interface SignInVerifyResponse {
  access_token: string
  token_type: string
}

export interface CategoryResponse {
  uuid: string
  name: string
}

export interface CategoryCreate {
  name: string
}

export interface CategoryUpdate {
  name?: string
}

export interface ExpenseResponse {
  uuid: string
  name: string
  amount: number
  expensed_at: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  categories: CategoryResponse[]
}

export interface ExpenseCreate {
  name: string
  amount: number
  expensed_at: string
  category_uuid?: string | null
}

export interface ExpenseUpdate {
  name?: string
  amount?: number
  expensed_at?: string
  category_uuid?: string | null
}

export interface UserResponse {
  uuid: string
  name: string
}

export interface ExpenseTemplateResponse {
  uuid: string
  name: string
  amount: number
  category: CategoryResponse
  created_at: string
  updated_at: string
}

export interface ExpenseTemplateCreate {
  name: string
  amount: number
  category_uuid: string
}

export interface ExpenseTemplateUpdate {
  name?: string
  amount?: number
  category_uuid?: string
}

export interface ImportResponse {
  categories_count: number
  expenses_count: number
  message: string
}
