import { Cross2Icon } from "@radix-ui/react-icons"

interface AuthUsernameInputProps {
  value: string
  onChange: (v: string) => void
  loading: boolean
  onClear?: () => void
}

export const AuthUsernameInput = ({
  value,
  onChange,
  loading,
  onClear,
}: AuthUsernameInputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="username" className="text-xs text-gray-500 dark:text-gray-400">
        Username
      </label>
      <div className="relative">
        <input
          id="username"
          type="text"
          placeholder="Warren Buffett"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          maxLength={50}
          disabled={loading}
          className={`w-full border-x-0 border-t-0 border-b border-gray-300 bg-transparent px-1 py-3 outline-none transition-colors focus:border-primary disabled:opacity-50 dark:border-gray-600 dark:text-gray-100 ${onClear ? "pr-8" : ""}`}
        />
        {onClear && value && !loading && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1/2 right-1 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <Cross2Icon className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
