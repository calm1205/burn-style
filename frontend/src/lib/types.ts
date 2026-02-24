export interface RegisterOptionsResponse {
  options: PublicKeyCredentialCreationOptionsJSON
}

export interface RegisterVerifyResponse {
  message: string
}

export interface LoginOptionsResponse {
  options: PublicKeyCredentialRequestOptionsJSON
}

export interface LoginVerifyResponse {
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
  created_at: string
  updated_at: string
  deleted_at: string | null
  categories: CategoryResponse[]
}

export interface ExpenseCreate {
  name: string
  amount: number
  category_uuids: string[]
}

export interface ExpenseUpdate {
  name?: string
  amount?: number
  category_uuids?: string[]
}

export interface UserResponse {
  uuid: string
  name: string
}
