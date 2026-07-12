import { AuthPageLayout } from "../components/AuthPageLayout"
import { AuthSubmitButton } from "../components/AuthSubmitButton"
import { AuthUsernameInput } from "../components/AuthUsernameInput"
import { useSignInForm } from "../hooks/useSignInForm"

export const SignInPage = () => {
  const f = useSignInForm()

  return (
    <AuthPageLayout
      title="Sign In"
      onSubmit={f.handleSubmit}
      error={f.error}
      footer={{ text: "Don't have an account? ", linkTo: "/signup", linkLabel: "Sign Up" }}
    >
      <AuthUsernameInput
        value={f.username}
        onChange={f.setUsername}
        loading={f.loading}
        onClear={f.clearUsername}
      />
      <AuthSubmitButton loading={f.loading} loadingLabel="Signing in..." label="Sign In" />
    </AuthPageLayout>
  )
}
