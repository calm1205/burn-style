interface AuthSubmitButtonProps {
  loading: boolean
  loadingLabel: string
  label: string
}

export const AuthSubmitButton = ({ loading, loadingLabel, label }: AuthSubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="rounded-xl bg-primary py-3 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      {loading ? loadingLabel : label}
    </button>
  )
}
