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

interface SubscriptionTemplate {
  uuid: string
  name: string
  amount: number
  category: CategoryResponse
  created_at: string
  updated_at: string
}

interface SubscriptionTemplateCreate {
  name: string
  amount: number
  category_uuid: string
}

interface SubscriptionTemplateUpdate {
  name?: string
  amount?: number
  category_uuid?: string
}

interface BulkRecordResponse {
  created_count: number
  message: string
}
