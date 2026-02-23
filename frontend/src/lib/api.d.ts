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
