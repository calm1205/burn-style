import { useRef } from "react"

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
}

export const useConfirmDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const open = () => dialogRef.current?.showModal()
  return { dialogRef, open }
}

export const ConfirmDialog = ({
  message,
  onConfirm,
  dialogRef,
}: ConfirmDialogProps & {
  dialogRef: React.RefObject<HTMLDialogElement | null>
}) => {
  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 backdrop:bg-black/50"
    >
      <p className="mb-6 text-sm">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="rounded px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          削除
        </button>
      </div>
    </dialog>
  )
}
