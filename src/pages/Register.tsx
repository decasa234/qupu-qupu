// src/pages/Register.tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { getApiResponseCode } from '../lib/apiError'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { redeemPendingReferral, savePendingReferralCode } from '../lib/referralStorage'
import { resolvePostLoginRoute } from '../lib/postLoginRoute'
import AuthCard from '../components/AuthCard'
import GoogleSignInButton from '../components/GoogleSignInButton'
import OtpInput from '../components/OtpInput'
import PillField from '../components/PillField'
import {
  type RegistrationErrors,
  sanitizePhoneInput,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
  validateRegistrationForm,
} from '../lib/registerValidation'
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
  const [searchParams] = useSearchParams()
  const { login } = useAuthStore()
  const [step, setStep] = useState<Step>('credentials')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<RegistrationErrors>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<PendingState | null>(null)

  // Capture ?ref=CODE on mount. Persists in localStorage across the
  // multi-step OTP flow. Redeemed after a successful register-verify.
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) savePendingReferralCode(ref)
  }, [searchParams])

  const setFieldError = (field: keyof RegistrationErrors, message: string | undefined) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }))
  }

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
      // Google sign-in here can be an existing account with children — route
      // it like a login. Fresh accounts (0 children) still hit onboarding.
      navigate(resolvePostLoginRoute(payload.user.role, children.length), { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const handleInit = async (event: React.FormEvent) => {
    event.preventDefault()
    const errors = validateRegistrationForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError('Periksa lagi data yang belum sesuai.')
      return
    }
    trackEvent('register_button_click')
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-init', { ...form, age: null })
      const data = response.data.data as { pendingId: string; expiresAt: string }
      setPending({ pendingId: data.pendingId, expiresAt: data.expiresAt, email: form.email })
      setStep('otp')
    } catch (requestError: unknown) {
      setError(toIndonesianErrorMessage(requestError, 'Registrasi gagal.'))
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
      // Best-effort referral credit. Never blocks navigation; the
      // helper swallows errors and always clears localStorage.
      void redeemPendingReferral()
      navigate('/onboard/child', { replace: true })
    } catch (requestError: unknown) {
      setError(toIndonesianErrorMessage(requestError, 'Verifikasi gagal.'))
      // Flow control rides on the stable `code` field, never on display copy.
      const code = getApiResponseCode(requestError)
      if (code === 'OTP_EXPIRED' || code === 'OTP_LOCKED') {
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
      setError(toIndonesianErrorMessage(requestError, 'Gagal kirim ulang kode.'))
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

        <form className="space-y-4" onSubmit={handleInit} noValidate>
          <PillField
            label="Nama orang tua"
            icon="fa-solid fa-user"
            value={form.name}
            onChange={(value) => {
              setForm((state) => ({ ...state, name: value }))
              if (fieldErrors.name) setFieldError('name', validateName(value))
            }}
            onBlur={() => setFieldError('name', validateName(form.name))}
            error={fieldErrors.name}
            placeholder="Nama kamu"
          />
          <PillField
            label="Email"
            icon="fa-solid fa-envelope"
            type="email"
            value={form.email}
            onChange={(value) => {
              setForm((state) => ({ ...state, email: value }))
              if (fieldErrors.email) setFieldError('email', validateEmail(value))
            }}
            onBlur={() => setFieldError('email', validateEmail(form.email))}
            error={fieldErrors.email}
            placeholder="orangtua@contoh.com"
            autoComplete="email"
          />
          <PillField
            label="No. HP"
            icon="fa-solid fa-phone"
            type="tel"
            inputMode="numeric"
            maxLength={13}
            value={form.phone}
            onChange={(value) => {
              const digits = sanitizePhoneInput(value)
              setForm((state) => ({ ...state, phone: digits }))
              if (fieldErrors.phone) setFieldError('phone', validatePhone(digits))
            }}
            onBlur={() => setFieldError('phone', validatePhone(form.phone))}
            error={fieldErrors.phone}
            placeholder="0812xxxxxxxx"
            helper={fieldErrors.phone ? undefined : '10–13 digit, mulai dari 08.'}
            autoComplete="tel"
          />
          <PillField
            label="Password"
            icon="fa-solid fa-lock"
            type="password"
            value={form.password}
            onChange={(value) => {
              setForm((state) => ({ ...state, password: value }))
              if (fieldErrors.password) setFieldError('password', validatePassword(value))
            }}
            onBlur={() => setFieldError('password', validatePassword(form.password))}
            error={fieldErrors.password}
            placeholder="minimal 8 karakter"
            autoComplete="new-password"
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

          <p className="text-center text-xs font-medium leading-relaxed text-qupu-muted">
            Dengan mendaftar, kamu menyetujui{' '}
            <Link to="/ketentuan" className="font-bold text-qupu-brand-orange hover:underline">
              Syarat &amp; Ketentuan
            </Link>{' '}
            dan{' '}
            <Link to="/privasi" className="font-bold text-qupu-brand-orange hover:underline">
              Kebijakan Privasi
            </Link>
            .
          </p>
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
