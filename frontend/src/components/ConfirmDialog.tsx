import { useRef } from "react"

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  confirmText?: string
}

export const useConfirmDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const open = () => dialogRef.current?.showModal()
  return { dialogRef, open }
}

export const ConfirmDialog = ({
  message,
  onConfirm,
  confirmText = "Delete",
  dialogRef,
}: ConfirmDialogProps & {
  dialogRef: React.RefObject<HTMLDialogElement | null>
}) => {
  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-lg backdrop:bg-black/50 dark:bg-gray-800 dark:text-gray-100"
    >
      <p className="mb-6 text-sm">{message}</p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
        >
          {confirmText}
        </button>
      </div>
    </dialog>
  )
}
