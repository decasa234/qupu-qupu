// src/components/parent/PinEntryGate.tsx
//
// Full-screen PIN gate guarding the /parent dashboard. Unlike the old
// inline gate on Profil, the unlock is NEVER persisted (no storage at all):
// the caller holds the unlocked flag in React state, so leaving /parent
// re-locks it. If the account has no PIN yet (confirmed against a fresh
// GET /users/me, like AppShell's sign-in prompt), the create flow opens
// instead; a wrong PIN shakes; 429 surfaces the friendly rate-limit copy.
// "Lupa PIN?" opens the password-based reset (ForgotPinModal).
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { toIndonesianErrorMessage } from '../../lib/errorMessage'
import { useAuthStore } from '../../store/authStore'
import PinPad from './PinPad'
import SetPinModal from './SetPinModal'
import ForgotPinModal from './ForgotPinModal'

export default function PinEntryGate({ onUnlock }: { onUnlock: () => void }) {
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const navigate = useNavigate()

  // The persisted user may predate the pinSet field (or the PIN was set on
  // another device), so when pinSet isn't a confident true we re-check with
  // a fresh GET /users/me before deciding create-vs-verify.
  const [pinConfirmed, setPinConfirmed] = useState<boolean | null>(
    user?.pinSet === true ? true : null,
  )
  const [error, setError] = useState<string | null>(null)
  const [shakeNonce, setShakeNonce] = useState(0)
  const [busy, setBusy] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  // Distinguishes "modal closed after success" from "parent tapped Batal".
  const setPinSucceededRef = useRef(false)

  useEffect(() => {
    if (pinConfirmed !== null) return
    let cancelled = false
    api
      .get('/users/me')
      .then((res) => {
        const fresh = res.data?.data?.pinSet
        if (cancelled || typeof fresh !== 'boolean') return
        updateUser({ pinSet: fresh })
        setPinConfirmed(fresh)
      })
      .catch(() => {
        // Offline: fall back to whatever the store says (false → create flow
        // would be wrong if a PIN exists elsewhere, but the server still
        // rejects a duplicate set without current_pin/password).
        if (!cancelled) setPinConfirmed(user?.pinSet === true)
      })
    return () => {
      cancelled = true
    }
  }, [pinConfirmed, updateUser, user?.pinSet])

  async function handleComplete(pin: string) {
    setBusy(true)
    setError(null)
    try {
      await api.post('/users/me/pin/verify', { pin })
      onUnlock()
    } catch (err) {
      setError(toIndonesianErrorMessage(err, 'PIN salah.'))
      setShakeNonce((n) => n + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-qupu-cream px-4 py-10">
      <div className="relative w-full max-w-sm rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-6 text-center shadow-[6px_8px_0_0_#FFD3B1]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-brand-blue text-2xl text-white">
          <i className="fa-solid fa-user-shield" aria-hidden="true" />
        </span>
        <h1 className="mt-3 font-display text-xl font-extrabold text-qupu-brand-blue">
          Area Orang Tua
        </h1>

        {pinConfirmed === null ? (
          <p className="mt-3 text-sm font-medium text-qupu-muted">Memeriksa PIN…</p>
        ) : pinConfirmed ? (
          <>
            <p className="mt-1 text-sm font-medium text-qupu-muted">
              Masukkan PIN untuk membuka dashboard orang tua.
            </p>
            <div className="mt-4">
              <PinPad onComplete={handleComplete} error={error} shakeNonce={shakeNonce} busy={busy} />
            </div>
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              disabled={busy}
              className="mt-4 font-display text-sm font-extrabold text-qupu-brand-orange transition-transform active:translate-y-0.5"
            >
              Lupa PIN?
            </button>
          </>
        ) : (
          // No PIN yet — the create modal renders over this card.
          <p className="mt-1 text-sm font-medium text-qupu-muted">
            Buat PIN dulu untuk melindungi area orang tua.
          </p>
        )}

        <div className="mt-5">
          <Link
            to="/belajar"
            className="font-display text-sm font-extrabold text-qupu-muted transition-transform active:translate-y-0.5"
          >
            Kembali ke aplikasi anak
          </Link>
        </div>
      </div>

      {pinConfirmed === false ? (
        <SetPinModal
          mode="create"
          onSuccess={() => {
            setPinSucceededRef.current = true
            onUnlock()
          }}
          onClose={() => {
            // Cancelled without setting a PIN → back to the kid app.
            if (!setPinSucceededRef.current) navigate('/belajar')
          }}
        />
      ) : null}

      {showForgot ? (
        <ForgotPinModal
          onClose={() => setShowForgot(false)}
          onSuccess={() => {
            setShowForgot(false)
            // Proving the account password (and setting a fresh PIN) counts
            // as proving you're the parent.
            onUnlock()
          }}
        />
      ) : null}
    </div>
  )
}
