// src/components/parent/ForgotPinModal.tsx
//
// "Lupa PIN" reset path: prove the account password, pick a new 4-digit PIN
// (two-step entry like SetPinModal), then one POST /users/me/pin with
// { pin, password }. The server decides whether the account CAN reset this
// way — Google-only accounts have no password_hash and the endpoint answers
// with a specific Indonesian error ("Akun Google: …"); we detect that reply
// and swap the form for an explanation instead of guessing client-side.
import { useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import api from '../../lib/api'
import { toIndonesianErrorMessage } from '../../lib/errorMessage'
import { useAuthStore } from '../../store/authStore'
import PinPad from './PinPad'

interface ForgotPinModalProps {
  onClose: () => void
  /** Called after the new PIN is saved (before close). */
  onSuccess?: () => void
}

type Step = 'password' | 'create' | 'confirm' | 'done' | 'google-only'

export default function ForgotPinModal({ onClose, onSuccess }: ForgotPinModalProps) {
  const updateUser = useAuthStore((state) => state.updateUser)
  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [firstPin, setFirstPin] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shakeNonce, setShakeNonce] = useState(0)
  const [busy, setBusy] = useState(false)
  // The server's own message for the Google-only case — shown verbatim.
  const [googleOnlyMessage, setGoogleOnlyMessage] = useState<string | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  function handlePasswordNext(event: React.FormEvent) {
    event.preventDefault()
    if (!password.trim()) {
      setError('Kata sandi wajib diisi.')
      return
    }
    setError(null)
    setStep('create')
  }

  function handleFirstPin(pin: string) {
    setFirstPin(pin)
    setError(null)
    setShakeNonce(0)
    setStep('confirm')
  }

  async function handleConfirmPin(pin: string) {
    if (pin !== firstPin) {
      setFirstPin(null)
      setStep('create')
      setError('PIN tidak sama. Coba buat lagi ya.')
      setShakeNonce((n) => n + 1)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.post('/users/me/pin', { pin, password })
      updateUser({ pinSet: true })
      setStep('done')
      closeTimerRef.current = window.setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 900)
    } catch (err) {
      const message = toIndonesianErrorMessage(err, 'Gagal menyimpan PIN. Coba lagi.')
      // The server's Google-only reply: surface its message + an explanation
      // instead of the form. Detected from the response, never guessed.
      if (
        isAxiosError(err) &&
        err.response?.status === 400 &&
        message.startsWith('Akun Google')
      ) {
        setGoogleOnlyMessage(message)
        setStep('google-only')
        return
      }
      // Wrong password (or rate limit / network): back to the password step.
      setFirstPin(null)
      setStep('password')
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Atur ulang PIN orang tua"
    >
      <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        {step === 'done' ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-orange text-3xl text-white shadow-[inset_0_-4px_0_#C46123]">
              <i className="fa-solid fa-check animate-bounce" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-qupu-brand-blue">
              PIN baru tersimpan!
            </h2>
            <p className="mt-1 text-sm font-medium text-qupu-muted">
              Gunakan PIN baru ini mulai sekarang.
            </p>
          </>
        ) : step === 'google-only' ? (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-brand-blue text-xl text-white">
              <i className="fa-brands fa-google" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold text-qupu-brand-blue">
              Akun Google
            </h2>
            <p className="mt-2 text-sm font-semibold text-qupu-ink" role="alert">
              {googleOnlyMessage}
            </p>
            <p className="mt-2 text-xs font-medium text-qupu-muted">
              Akun ini masuk lewat Google dan tidak punya kata sandi, jadi PIN
              tidak bisa diatur ulang dengan kata sandi.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full px-4 py-2 font-display text-sm font-extrabold text-qupu-muted transition-transform active:translate-y-0.5"
            >
              Tutup
            </button>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-brand-blue text-xl text-white">
              <i className="fa-solid fa-key" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold text-qupu-brand-blue">
              {step === 'password'
                ? 'Lupa PIN'
                : step === 'confirm'
                  ? 'Ulangi PIN baru'
                  : 'Buat PIN baru'}
            </h2>
            <p className="mt-1 text-sm font-medium text-qupu-muted">
              {step === 'password'
                ? 'Masukkan kata sandi akun untuk mengatur PIN baru.'
                : step === 'confirm'
                  ? 'Ketik PIN yang sama sekali lagi.'
                  : 'PIN 4 digit untuk melindungi area orang tua.'}
            </p>

            {step === 'password' ? (
              <form className="mt-4" onSubmit={handlePasswordNext}>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Kata sandi akun"
                  autoFocus
                  autoComplete="current-password"
                  className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-center text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
                />
                {error ? (
                  <p className="mt-2 text-xs font-bold text-[#E11D48]" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={busy || !password.trim()}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Lanjut
                </button>
              </form>
            ) : (
              <div className="mt-4">
                {/* Re-key per step so the pad starts empty on every step. */}
                <PinPad
                  key={step}
                  onComplete={step === 'confirm' ? handleConfirmPin : handleFirstPin}
                  error={error}
                  shakeNonce={shakeNonce}
                  busy={busy}
                />
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="mt-5 rounded-full px-4 py-2 font-display text-sm font-extrabold text-qupu-muted transition-transform active:translate-y-0.5"
            >
              Batal
            </button>
          </>
        )}
      </div>
    </div>
  )
}
