import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/*
 * Lightweight admin toast system. Replaces the old per-page persistent inline
 * banners (which never auto-dismissed and guessed success/error by sniffing the
 * message string). Pages call `useToast().success(...)` / `.error(...)` and the
 * tone is explicit. Mounted once by AdminLayout, so every admin page can use it.
 */

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastApi {
  push: (message: string, tone?: ToastTone) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TONE_STYLES: Record<ToastTone, { icon: string; cls: string }> = {
  success: { icon: 'fa-solid fa-circle-check', cls: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: 'fa-solid fa-circle-exclamation', cls: 'border-rose-200 bg-rose-50 text-rose-800' },
  info: { icon: 'fa-solid fa-circle-info', cls: 'border-qupu-brand-blue/25 bg-white text-admin-ink' },
}

const TOAST_TTL_MS = 3800

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const push = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = (idRef.current += 1)
      setItems((prev) => [...prev, { id, tone, message }])
      window.setTimeout(() => remove(id), TOAST_TTL_MS)
    },
    [remove],
  )

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
      info: (message) => push(message, 'info'),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:items-end">
        {items.map((item) => {
          const style = TONE_STYLES[item.tone]
          return (
            <div
              key={item.id}
              role="status"
              className={`animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold shadow-admin-soft ${style.cls}`}
            >
              <i className={`${style.icon} mt-0.5`} aria-hidden="true" />
              <span className="min-w-0 flex-1">{item.message}</span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within an admin ToastProvider')
  return ctx
}
