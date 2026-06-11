// src/components/parent/ParentGate.tsx
//
// Kid-proofs the parent area on the Me/Profil page. While locked, the gated
// children collapse into ONE "Pengaturan Orang Tua" card; tapping it opens a
// PinPad (or, if no PIN exists yet, the SetPinModal). A correct PIN unlocks
// for the rest of the browser session — sessionStorage keyed per user, so a
// new tab/session locks again but in-session navigation doesn't re-prompt.
//
// Only `parent`-role users are gated (kids share the parent's session).
// Admins and legacy student/teacher roles see the content directly.
import { useState, type ReactNode } from 'react'
import api from '../../lib/api'
import { toIndonesianErrorMessage } from '../../lib/errorMessage'
import { isParentUnlocked, markParentUnlocked } from '../../lib/parentUnlock'
import { useAuthStore } from '../../store/authStore'
import PinPad from './PinPad'
import SetPinModal from './SetPinModal'

export default function ParentGate({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const [unlockedNow, setUnlocked] = useState(false)
  const [modal, setModal] = useState<'none' | 'verify' | 'set'>('none')

  // sessionStorage is re-read on every render (cheap) so an unlock earned
  // elsewhere — e.g. setting the PIN via AppShell's sign-in prompt while
  // this page is mounted — is picked up on the store-driven re-render.
  const unlocked = unlockedNow || (user ? isParentUnlocked(user.id) : false)

  // Gate applies to parent-role accounts only.
  if (!user || user.role !== 'parent' || unlocked) {
    return <>{children}</>
  }

  function unlock() {
    if (user) markParentUnlocked(user.id)
    setModal('none')
    setUnlocked(true)
  }

  return (
    <>
      <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <button
          type="button"
          onClick={() => setModal(user.pinSet ? 'verify' : 'set')}
          className="flex w-full items-center gap-3 text-left transition-transform active:translate-y-0.5"
        >
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1rem] bg-qupu-brand-blue text-lg text-white">
            <i className="fa-solid fa-lock" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-base font-extrabold leading-tight text-qupu-brand-blue">
              Pengaturan Orang Tua
            </span>
            <span className="block text-xs font-semibold text-qupu-muted">
              {user.pinSet
                ? 'Khusus orang tua — masukkan PIN'
                : 'Khusus orang tua — atur PIN dulu'}
            </span>
          </span>
          <i className="fa-solid fa-chevron-right text-xs text-qupu-muted/60" aria-hidden="true" />
        </button>
      </section>

      {modal === 'verify' ? (
        <VerifyPinModal onUnlock={unlock} onClose={() => setModal('none')} />
      ) : null}
      {modal === 'set' ? (
        <SetPinModal onClose={() => setModal('none')} onSuccess={unlock} />
      ) : null}
    </>
  )
}

// PinPad-in-a-modal: verifies against POST /users/me/pin/verify (server-side
// bcrypt compare, 10/min rate limit) and unlocks on success.
function VerifyPinModal({ onUnlock, onClose }: { onUnlock: () => void; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [shakeNonce, setShakeNonce] = useState(0)
  const [busy, setBusy] = useState(false)

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Masukkan PIN orang tua"
    >
      <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 text-center shadow-[0_6px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-brand-blue text-xl text-white">
          <i className="fa-solid fa-lock" aria-hidden="true" />
        </span>
        <h2 className="mt-3 font-display text-xl font-extrabold text-qupu-brand-blue">
          Masukkan PIN
        </h2>
        <p className="mt-1 text-sm font-medium text-qupu-muted">
          Bagian ini khusus orang tua, ya.
        </p>
        <div className="mt-4">
          <PinPad onComplete={handleComplete} error={error} shakeNonce={shakeNonce} busy={busy} />
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="mt-5 rounded-full px-4 py-2 font-display text-sm font-extrabold text-qupu-muted transition-transform active:translate-y-0.5"
        >
          Batal
        </button>
      </div>
    </div>
  )
}
