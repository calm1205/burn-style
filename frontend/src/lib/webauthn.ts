import { post } from "./api"

interface LoginOptionsResponse {
  options: PublicKeyCredentialRequestOptions
}

interface LoginVerifyResponse {
  access_token: string
  token_type: string
}

export async function login(username: string): Promise<LoginVerifyResponse> {
  const { options } = await post<LoginOptionsResponse>("/auth/login/options", {
    username,
  })

  const credential = await navigator.credentials.get({ publicKey: options })
  if (!credential) {
    throw new Error("認証がキャンセルされました")
  }

  const credentialJson = (credential as PublicKeyCredential).toJSON()

  return post<LoginVerifyResponse>("/auth/login/verify", {
    username,
    credential: credentialJson,
  })
}
