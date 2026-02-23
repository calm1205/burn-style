interface RegisterOptionsResponse {
  options: PublicKeyCredentialCreationOptionsJSON
}

interface RegisterVerifyResponse {
  message: string
}

interface LoginOptionsResponse {
  options: PublicKeyCredentialRequestOptionsJSON
}

interface LoginVerifyResponse {
  access_token: string
  token_type: string
}

interface CategoryResponse {
  uuid: string
  name: string
}

interface CategoryCreate {
  name: string
}

interface CategoryUpdate {
  name?: string
}

interface ExpenseResponse {
  uuid: string
  name: string
  amount: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  categories: CategoryResponse[]
}

interface ExpenseCreate {
  name: string
  amount: number
  category_uuids: string[]
}

interface ExpenseUpdate {
  name?: string
  amount?: number
  category_uuids?: string[]
}
