import { useEffect, useState } from "react"

import { subscribeInflight } from "../libs/client"

const SHOW_DELAY_MS = 400

/** in-flight リクエストが SHOW_DELAY_MS 以上続くと上端にスライドバーを表示。cold start 待ち UI 用。 */
export const GlobalLoadingBar = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    return subscribeInflight((count) => {
      if (count > 0) {
        if (!timer) {
          timer = setTimeout(() => {
            setShow(true)
            timer = null
          }, SHOW_DELAY_MS)
        }
      } else {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }
        setShow(false)
      }
    })
  }, [])

  if (!show) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-primary/15">
      <div className="loading-bar-track h-full w-1/3 rounded-full bg-primary" />
    </div>
  )
}
