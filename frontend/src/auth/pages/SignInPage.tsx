import { AuthPageLayout } from "../components/AuthPageLayout"
import { AuthSubmitButton } from "../components/AuthSubmitButton"
import { AuthUsernameInput } from "../components/AuthUsernameInput"
import { useSignInForm } from "../hooks/useSignInForm"

export const SignInPage = () => {
  const signInForm = useSignInForm()

  return (
    <AuthPageLayout
      title="Sign In"
      onSubmit={signInForm.signIn}
      error={signInForm.error}
      footer={{ text: "Don't have an account? ", linkTo: "/signup", linkLabel: "Sign Up" }}
    >
      <AuthUsernameInput
        value={signInForm.username}
        onChange={signInForm.setUsername}
        loading={signInForm.loading}
        onClear={signInForm.clearUsername}
      />
      <AuthSubmitButton loading={signInForm.loading} loadingLabel="Signing in..." label="Sign In" />
    </AuthPageLayout>
  )
}
