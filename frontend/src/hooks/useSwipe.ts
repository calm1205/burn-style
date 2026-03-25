import { useEffect, useRef } from "react"

interface UseSwipeOptions {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  threshold?: number
  maxDuration?: number
}

export const useSwipe = <T extends HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  maxDuration = 300,
}: UseSwipeOptions) => {
  const ref = useRef<T>(null)
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight })
  callbacksRef.current = { onSwipeLeft, onSwipeRight }

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let startX = 0
    let startY = 0
    let startTime = 0
    let isSwiping: boolean | null = null

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      startX = touch.clientX
      startY = touch.clientY
      startTime = Date.now()
      isSwiping = null
    }

    const onTouchMove = (e: TouchEvent) => {
      if (isSwiping === false) return
      const touch = e.touches[0]
      const deltaX = Math.abs(touch.clientX - startX)
      const deltaY = Math.abs(touch.clientY - startY)

      if (isSwiping === null && (deltaX > 10 || deltaY > 10)) {
        isSwiping = deltaX > deltaY * 1.5
      }

      if (isSwiping && e.cancelable) {
        e.preventDefault()
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (isSwiping !== true) return
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - startX
      const duration = Date.now() - startTime

      if (Math.abs(deltaX) >= threshold && duration <= maxDuration) {
        if (deltaX < 0) {
          callbacksRef.current.onSwipeLeft()
        } else {
          callbacksRef.current.onSwipeRight()
        }
      }
    }

    el.addEventListener("touchstart", onTouchStart)
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
    }
  }, [threshold, maxDuration])

  return { ref }
}
