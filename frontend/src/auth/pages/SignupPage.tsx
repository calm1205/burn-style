import { AuthPageLayout } from "../components/AuthPageLayout"
import { AuthSubmitButton } from "../components/AuthSubmitButton"
import { AuthUsernameInput } from "../components/AuthUsernameInput"
import { useSignupForm } from "../hooks/useSignupForm"

export const SignupPage = () => {
  const signupForm = useSignupForm()

  return (
    <AuthPageLayout
      title="Sign Up"
      onSubmit={signupForm.handleSubmit}
      error={signupForm.error}
      footer={{ text: "Already have an account? ", linkTo: "/signin", linkLabel: "Sign In" }}
    >
      <AuthUsernameInput
        value={signupForm.username}
        onChange={signupForm.setUsername}
        loading={signupForm.loading}
      />
      <AuthSubmitButton loading={signupForm.loading} loadingLabel="Signing up..." label="Sign Up" />
    </AuthPageLayout>
  )
}
