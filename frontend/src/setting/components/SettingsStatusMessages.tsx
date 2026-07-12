interface SettingsStatusMessagesProps {
  error: string
  success: string
}

export const SettingsStatusMessages = ({ error, success }: SettingsStatusMessagesProps) => {
  return (
    <>
      {error && <p className="px-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {success && <p className="px-2 text-sm text-green-600 dark:text-green-400">{success}</p>}
    </>
  )
}
