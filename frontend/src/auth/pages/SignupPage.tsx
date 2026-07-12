import { AuthPageLayout } from "../components/AuthPageLayout"
import { AuthSubmitButton } from "../components/AuthSubmitButton"
import { AuthUsernameInput } from "../components/AuthUsernameInput"
import { useSignupForm } from "../hooks/useSignupForm"

export const SignupPage = () => {
  const f = useSignupForm()

  return (
    <AuthPageLayout
      title="Sign Up"
      onSubmit={f.handleSubmit}
      error={f.error}
      footer={{ text: "Already have an account? ", linkTo: "/signin", linkLabel: "Sign In" }}
    >
      <AuthUsernameInput value={f.username} onChange={f.setUsername} loading={f.loading} />
      <AuthSubmitButton loading={f.loading} loadingLabel="Signing up..." label="Sign Up" />
    </AuthPageLayout>
  )
}
