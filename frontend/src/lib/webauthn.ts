import { post } from "./api"

interface RegisterOptionsResponse {
  options: PublicKeyCredentialCreationOptions
}

interface RegisterVerifyResponse {
  message: string
}

interface LoginOptionsResponse {
  options: PublicKeyCredentialRequestOptions
}

interface LoginVerifyResponse {
  access_token: string
  token_type: string
}

export const register = async (
  username: string,
): Promise<RegisterVerifyResponse> => {
  const { options } = await post<RegisterOptionsResponse>(
    "/auth/register/options",
    {
      username,
    },
  )

  const credential = await navigator.credentials.create({ publicKey: options })
  if (!credential) {
    throw new Error("パスキーの登録がキャンセルされました")
  }

  const credentialJson = (credential as PublicKeyCredential).toJSON()

  return post<RegisterVerifyResponse>("/auth/register/verify", {
    username,
    credential: credentialJson,
  })
}

export const login = async (username: string): Promise<LoginVerifyResponse> => {
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
