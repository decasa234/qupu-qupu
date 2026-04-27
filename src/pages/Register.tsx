// src/pages/Register.tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import AuthCard from '../components/AuthCard'
import GoogleSignInButton from '../components/GoogleSignInButton'
import OtpInput from '../components/OtpInput'
import PillField from '../components/PillField'
import { useAuthStore } from '../store/authStore'
import type { AuthPayload, Child } from '../types'

type Step = 'credentials' | 'otp'

interface PendingState {
  pendingId: string
  expiresAt: string
  email: string
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [step, setStep] = useState<Step>('credentials')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<PendingState | null>(null)

  const handleGoogleAuthenticated = async (payload: AuthPayload) => {
    setLoading(true)
    setError('')
    try {
      trackEvent('google_login_completed')
      login(payload.user, payload.token)

      let children: Child[] = []
      try {
        const childrenResponse = await api.get('/me/children')
        children = childrenResponse.data.data.children ?? []
      } catch (childrenError) {
        console.error('Failed to load children after Google sign-in:', childrenError)
      }

      useAuthStore.getState().setChildren(children)
      navigate(children.length === 0 ? '/onboarding/child' : '/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleInit = async (event: React.FormEvent) => {
    event.preventDefault()
    trackEvent('register_button_click')
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-init', { ...form, age: null })
      const data = response.data.data as { pendingId: string; expiresAt: string }
      setPending({ pendingId: data.pendingId, expiresAt: data.expiresAt, email: form.email })
      setStep('otp')
    } catch (requestError: unknown) {
      setError(extractError(requestError, 'Registrasi gagal.'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (otp: string) => {
    if (!pending) return
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-verify', {
        pendingId: pending.pendingId,
        otp,
      })
      const payload = response.data.data as AuthPayload
      login(payload.user, payload.token)
      trackEvent('register_completed')
      navigate('/onboarding/child', { replace: true })
    } catch (requestError: unknown) {
      const message = extractError(requestError, 'Verifikasi gagal.')
      setError(message)
      if (message === 'Kode kadaluarsa.' || message === 'Terlalu banyak percobaan.') {
        setStep('credentials')
        setPending(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!pending) return
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-resend', { pendingId: pending.pendingId })
      const data = response.data.data as { expiresAt: string }
      setPending({ ...pending, expiresAt: data.expiresAt })
    } catch (requestError: unknown) {
      setError(extractError(requestError, 'Gagal kirim ulang kode.'))
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCredentials = () => {
    setStep('credentials')
    setPending(null)
    setError('')
  }

  if (step === 'otp' && pending) {
    return (
      <AuthCard
        mascotSrc="/achievement-right.png"
        eyebrow="Verifikasi"
        title="Cek email kamu"
        subtitle={`Kami kirim kode 6 digit ke ${pending.email}. Berlaku 10 menit.`}
        footer={
          <button
            type="button"
            onClick={handleBackToCredentials}
            className="font-bold text-qupu-brand-orange hover:underline"
          >
            ← Ganti email
          </button>
        }
      >
        <div className="space-y-4">
          <OtpInput
            length={6}
            disabled={loading}
            onComplete={handleVerify}
          />

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <ResendOtpButton
            disabled={loading}
            onResend={handleResend}
            expiresAt={pending.expiresAt}
          />
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      mascotSrc="/achievement-right.png"
      eyebrow="Daftar"
      title="Buat akun orang tua"
      subtitle="Satu akun untuk semua anak. Tambah profil tiap anak setelah daftar."
      footer={
        <span>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-qupu-brand-orange hover:underline">
            Login di sini
          </Link>
        </span>
      }
    >
      <div className="space-y-5">
        <GoogleSignInButton onAuthenticated={handleGoogleAuthenticated} onError={setError} />

        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-muted">
          <span className="h-px flex-1 bg-qupu-peach" />
          atau daftar dengan email
          <span className="h-px flex-1 bg-qupu-peach" />
        </div>

        <form className="space-y-4" onSubmit={handleInit}>
          <PillField
            label="Nama orang tua"
            icon="fa-solid fa-user"
            value={form.name}
            onChange={(value) => setForm((state) => ({ ...state, name: value }))}
            placeholder="Nama kamu"
            required
          />
          <PillField
            label="Email"
            icon="fa-solid fa-envelope"
            type="email"
            value={form.email}
            onChange={(value) => setForm((state) => ({ ...state, email: value }))}
            placeholder="orangtua@contoh.com"
            required
          />
          <PillField
            label="No. HP"
            icon="fa-solid fa-phone"
            type="tel"
            value={form.phone}
            onChange={(value) => setForm((state) => ({ ...state, phone: value }))}
            placeholder="0812xxxx"
            required
          />
          <PillField
            label="Password"
            icon="fa-solid fa-lock"
            type="password"
            value={form.password}
            onChange={(value) => setForm((state) => ({ ...state, password: value }))}
            placeholder="minimal 8 karakter"
            required
          />

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
              <i className="fa-solid fa-paper-plane text-base text-qupu-brand-orange" aria-hidden="true" />
            </span>
            {loading ? 'Mengirim kode...' : 'Kirim kode verifikasi'}
          </button>
        </form>
      </div>
    </AuthCard>
  )
}

function ResendOtpButton({
  disabled,
  onResend,
  expiresAt,
}: {
  disabled: boolean
  onResend: () => void
  expiresAt: string
}) {
  const [secondsLeft, setSecondsLeft] = useState(60)

  useEffect(() => {
    setSecondsLeft(60)
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [expiresAt])

  const ready = secondsLeft <= 0

  return (
    <button
      type="button"
      onClick={onResend}
      disabled={disabled || !ready}
      className="w-full rounded-full border-2 border-qupu-brand-blue bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-colors hover:bg-qupu-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {ready ? 'Kirim ulang kode' : `Kirim ulang dalam ${secondsLeft}s`}
    </button>
  )
}

function extractError(requestError: unknown, fallback: string): string {
  if (
    typeof requestError === 'object' &&
    requestError !== null &&
    'response' in requestError &&
    typeof (requestError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (requestError as { response: { data: { error: string } } }).response.data.error
  }
  return fallback
}
