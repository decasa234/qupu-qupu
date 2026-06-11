// src/components/parent/SetPinModal.tsx
//
// Set (or change) the parent PIN. Two-step entry: "Buat PIN" then "Ulangi
// PIN" — a mismatch resets to step one with a message. In `change` mode a
// PinPad asking the current PIN comes first (verified server-side via
// POST /users/me/pin/verify so a wrong old PIN fails immediately and is
// rate-limited), and the old PIN is then sent as `current_pin` with the set
// request. Success flips authStore's `pinSet`, shows a short check
// animation, then closes.
import { useEffect, useRef, useState } from 'react'
import api from '../../lib/api'
import { toIndonesianErrorMessage } from '../../lib/errorMessage'
import { useAuthStore } from '../../store/authStore'
import PinPad from './PinPad'

interface SetPinModalProps {
  mode?: 'create' | 'change'
  onClose: () => void
  /** Called after a successful set (before close). */
  onSuccess?: () => void
  /** When provided, renders a "Nanti saja" dismiss button (set-at-sign-in). */
  onSkip?: () => void
}

type Step = 'current' | 'create' | 'confirm' | 'done'

export default function SetPinModal({ mode = 'create', onClose, onSuccess, onSkip }: SetPinModalProps) {
  const updateUser = useAuthStore((state) => state.updateUser)
  const [step, setStep] = useState<Step>(mode === 'change' ? 'current' : 'create')
  const [currentPin, setCurrentPin] = useState<string | null>(null)
  const [firstPin, setFirstPin] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shakeNonce, setShakeNonce] = useState(0)
  const [busy, setBusy] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  function fail(message: string) {
    setError(message)
    setShakeNonce((n) => n + 1)
  }

  async function handleCurrentPin(pin: string) {
    setBusy(true)
    setError(null)
    try {
      await api.post('/users/me/pin/verify', { pin })
      setCurrentPin(pin)
      setStep('create')
    } catch (err) {
      fail(toIndonesianErrorMessage(err, 'PIN salah.'))
    } finally {
      setBusy(false)
    }
  }

  function handleFirstPin(pin: string) {
    setFirstPin(pin)
    setError(null)
    setShakeNonce(0)
    setStep('confirm')
  }

  async function handleConfirmPin(pin: string) {
    if (pin !== firstPin) {
      // Mismatch: back to step one, start over.
      setFirstPin(null)
      setStep('create')
      fail('PIN tidak sama. Coba buat lagi ya.')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.post('/users/me/pin', {
        pin,
        ...(currentPin ? { current_pin: currentPin } : {}),
      })
      updateUser({ pinSet: true })
      setStep('done')
      closeTimerRef.current = window.setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 900)
    } catch (err) {
      // Server rejected (rate limit / network): restart the two-step entry.
      setFirstPin(null)
      setStep('create')
      fail(toIndonesianErrorMessage(err, 'Gagal menyimpan PIN. Coba lagi.'))
    } finally {
      setBusy(false)
    }
  }

  const heading =
    step === 'current' ? 'Masukkan PIN lama' : step === 'confirm' ? 'Ulangi PIN' : 'Buat PIN'
  const subheading =
    step === 'current'
      ? 'Masukkan PIN yang sekarang dulu, ya.'
      : step === 'confirm'
        ? 'Ketik PIN yang sama sekali lagi.'
        : 'PIN 4 digit untuk melindungi pengaturan orang tua.'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'change' ? 'Ubah PIN orang tua' : 'Buat PIN orang tua'}
    >
      <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        {step === 'done' ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-brand-orange text-3xl text-white shadow-[inset_0_-4px_0_#C46123]">
              <i className="fa-solid fa-check animate-bounce" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-qupu-brand-blue">
              PIN tersimpan!
            </h2>
            <p className="mt-1 text-sm font-medium text-qupu-muted">
              Pengaturan orang tua sekarang terlindungi.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-brand-blue text-xl text-white">
              <i className="fa-solid fa-lock" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold text-qupu-brand-blue">
              {heading}
            </h2>
            <p className="mt-1 text-sm font-medium text-qupu-muted">{subheading}</p>
            <div className="mt-4">
              {/* Re-key per step so the pad starts empty on every step. */}
              <PinPad
                key={step}
                onComplete={
                  step === 'current'
                    ? handleCurrentPin
                    : step === 'confirm'
                      ? handleConfirmPin
                      : handleFirstPin
                }
                error={error}
                shakeNonce={shakeNonce}
                busy={busy}
              />
            </div>
            <div className="mt-5 flex flex-col gap-2">
              {onSkip ? (
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={busy}
                  className="rounded-full px-4 py-2 font-display text-sm font-extrabold text-qupu-muted transition-transform active:translate-y-0.5"
                >
                  Nanti saja
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="rounded-full px-4 py-2 font-display text-sm font-extrabold text-qupu-muted transition-transform active:translate-y-0.5"
                >
                  Batal
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
