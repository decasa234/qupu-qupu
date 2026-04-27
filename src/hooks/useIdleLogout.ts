import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const ACTIVITY_EVENTS: Array<keyof DocumentEventMap> = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'wheel',
  'visibilitychange',
]

interface UseIdleLogoutOptions {
  enabled: boolean
  timeoutMs: number
  onTimeout?: () => void
}

export function useIdleLogout({ enabled, timeoutMs, onTimeout }: UseIdleLogoutOptions) {
  const timerRef = useRef<number | null>(null)
  const onTimeoutRef = useRef(onTimeout)

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const reset = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        onTimeoutRef.current?.()
      }, timeoutMs)
    }

    reset()

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, reset, { passive: true })
    })

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, reset)
      })
    }
  }, [enabled, timeoutMs])
}

const ADMIN_IDLE_TIMEOUT_MS = 15 * 60 * 1000

export function useAdminIdleLogout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const isAdmin = isAuthenticated && user?.role === 'admin'

  useIdleLogout({
    enabled: isAdmin,
    timeoutMs: ADMIN_IDLE_TIMEOUT_MS,
    onTimeout: () => {
      logout()
      navigate('/login', { replace: true })
    },
  })
}
