import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { getApiResponseCode } from '../lib/apiError'
import { toIndonesianErrorMessage } from '../lib/errorMessage'
import { redeemPendingReferral } from '../lib/referralStorage'
import GoogleSignInButton from './GoogleSignInButton'
import OtpInput from './OtpInput'
import PillField from './PillField'
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

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onAuthenticated: () => void
}

type Tab = 'login' | 'register'

export default function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const { login } = useAuthStore()
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<RegistrationErrors>({})

  const setFieldError = (field: keyof RegistrationErrors, message: string | undefined) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }))
  }

  useEffect(() => {
    if (!open) {
      setRegisterStep('form')
      setPendingId(null)
      setFieldErrors({})
    }
  }, [open])

  if (!open) return null

  const hydrateChildren = async () => {
    try {
      const childrenResponse = await api.get('/me/children')
      const children = (childrenResponse.data?.data?.children ?? []) as Child[]
      useAuthStore.getState().setChildren(children)
    } catch (childrenError) {
      console.error('Failed to load children after auth:', childrenError)
      useAuthStore.getState().setChildren([])
    }
  }

  const finishAuth = async (payload: AuthPayload) => {
    login(payload.user, payload.token)
    await hydrateChildren()
    onAuthenticated()
  }

  const handleGoogleAuthenticated = async (payload: AuthPayload) => {
    setLoading(true)
    setError('')
    try {
      await finishAuth(payload)
      trackEvent('google_login_completed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    trackEvent('login_button_click')
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/login', { email, password })
      const payload = response.data.data as AuthPayload
      await finishAuth(payload)
      trackEvent('login_completed')
    } catch (requestError) {
      setError(toIndonesianErrorMessage(requestError, 'Login gagal.'))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    const errors = validateRegistrationForm({ name, email, phone, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setError('Periksa lagi data yang belum sesuai.')
      return
    }
    trackEvent('register_button_click')
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-init', {
        name,
        email,
        phone,
        password,
        age: null,
      })
      const data = response.data.data as { pendingId: string }
      setPendingId(data.pendingId)
      setRegisterStep('otp')
    } catch (requestError) {
      setError(toIndonesianErrorMessage(requestError, 'Registrasi gagal.'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (otp: string) => {
    if (!pendingId) return
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/register-verify', { pendingId, otp })
      const payload = response.data.data as AuthPayload
      await finishAuth(payload)
      trackEvent('register_completed')
      // Best-effort referral credit (Plan 5c). Never blocks the flow.
      void redeemPendingReferral()
    } catch (requestError) {
      setError(toIndonesianErrorMessage(requestError, 'Verifikasi gagal.'))
      // Flow control rides on the stable `code` field, never on display copy.
      const code = getApiResponseCode(requestError)
      if (code === 'OTP_EXPIRED' || code === 'OTP_LOCKED') {
        setRegisterStep('form')
        setPendingId(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!pendingId) return
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register-resend', { pendingId })
    } catch (requestError) {
      setError(toIndonesianErrorMessage(requestError, 'Gagal kirim ulang kode.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-qupu-brand-blue/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white shadow-[6px_8px_0_0_#FFD3B1]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
              Simpan Skor
            </div>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-qupu-brand-blue">
              Masuk untuk simpan progres
            </h2>
            <p className="mt-2 text-sm font-semibold text-qupu-muted">
              Skor kamu disimpan setelah login.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full bg-qupu-cream p-2 text-qupu-muted transition-colors hover:text-qupu-brand-blue"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
          <GoogleSignInButton
            onAuthenticated={handleGoogleAuthenticated}
            onError={setError}
          />

          <div className="flex items-center gap-3 text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-qupu-muted">
            <span className="h-px flex-1 bg-qupu-peach" />
            atau
            <span className="h-px flex-1 bg-qupu-peach" />
          </div>

          <div className="flex gap-2 rounded-full bg-qupu-cream p-1">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                tab === 'login'
                  ? 'bg-white text-qupu-brand-blue shadow-sm'
                  : 'text-qupu-muted hover:text-qupu-brand-blue'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                tab === 'register'
                  ? 'bg-white text-qupu-brand-blue shadow-sm'
                  : 'text-qupu-muted hover:text-qupu-brand-blue'
              }`}
            >
              Daftar
            </button>
          </div>

          {tab === 'login' ? (
            <form className="space-y-3" onSubmit={handleLogin}>
              <PillField
                label="Email"
                icon="fa-solid fa-envelope"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="orangtua@contoh.com"
                required
              />
              <PillField
                label="Password"
                icon="fa-solid fa-lock"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="********"
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-3 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          ) : registerStep === 'otp' ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-qupu-muted">
                Kode 6 digit dikirim ke <span className="text-qupu-brand-blue">{email}</span>. Berlaku 10 menit.
              </p>
              <OtpInput length={6} disabled={loading} onComplete={handleVerifyOtp} />
              {error && (
                <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep('form')
                    setPendingId(null)
                    setError('')
                  }}
                  className="flex-1 rounded-full border-2 border-qupu-brand-blue bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue"
                >
                  ← Ganti email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex-1 rounded-full bg-qupu-brand-blue px-5 py-2.5 font-display text-sm font-extrabold text-white disabled:opacity-60"
                >
                  Kirim ulang
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleRegister} noValidate>
              <PillField
                label="Nama orang tua"
                icon="fa-solid fa-user"
                value={name}
                onChange={(value) => {
                  setName(value)
                  if (fieldErrors.name) setFieldError('name', validateName(value))
                }}
                onBlur={() => setFieldError('name', validateName(name))}
                error={fieldErrors.name}
                placeholder="Nama kamu"
              />
              <PillField
                label="Email"
                icon="fa-solid fa-envelope"
                type="email"
                value={email}
                onChange={(value) => {
                  setEmail(value)
                  if (fieldErrors.email) setFieldError('email', validateEmail(value))
                }}
                onBlur={() => setFieldError('email', validateEmail(email))}
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
                value={phone}
                onChange={(value) => {
                  const digits = sanitizePhoneInput(value)
                  setPhone(digits)
                  if (fieldErrors.phone) setFieldError('phone', validatePhone(digits))
                }}
                onBlur={() => setFieldError('phone', validatePhone(phone))}
                error={fieldErrors.phone}
                placeholder="0812xxxxxxxx"
                helper={fieldErrors.phone ? undefined : '10–13 digit, mulai dari 08.'}
                autoComplete="tel"
              />
              <PillField
                label="Password"
                icon="fa-solid fa-lock"
                type="password"
                value={password}
                onChange={(value) => {
                  setPassword(value)
                  if (fieldErrors.password) setFieldError('password', validatePassword(value))
                }}
                onBlur={() => setFieldError('password', validatePassword(password))}
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-3 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? 'Membuat akun...' : 'Buat akun'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
