import type { ReactNode, SubmitEvent } from "react"
import { Link } from "react-router"

interface AuthPageLayoutProps {
  title: string
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => void
  error: string
  footer: { text: string; linkTo: string; linkLabel: string }
  children: ReactNode
}

export const AuthPageLayout = ({
  title,
  onSubmit,
  error,
  footer,
  children,
}: AuthPageLayoutProps) => {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 dark:bg-gray-900 dark:text-gray-100">
      <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-8">
        <h1 className="text-center text-3xl font-light tracking-tight">{title}</h1>

        <div className="flex flex-col gap-6">{children}</div>

        {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {footer.text}
          <Link
            to={footer.linkTo}
            className="text-primary underline underline-offset-4 hover:opacity-70"
          >
            {footer.linkLabel}
          </Link>
        </p>
      </form>
    </div>
  )
}
