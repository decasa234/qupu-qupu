// src/pages/Login.tsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import { trackEvent } from '../lib/analytics'
import { resolvePostLoginRoute } from '../lib/postLoginRoute'
import AuthCard from '../components/AuthCard'
import GoogleSignInButton from '../components/GoogleSignInButton'
import PillField from '../components/PillField'
import { useAuthStore } from '../store/authStore'
import type { AuthPayload, Child } from '../types'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const expired = searchParams.get('expired') === '1'
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const finishAuthAndRoute = async (payload: AuthPayload) => {
    login(payload.user, payload.token)

    let children: Child[] = []
    try {
      const childrenResponse = await api.get('/me/children')
      children = childrenResponse.data.data.children ?? []
    } catch (childrenError) {
      console.error('Failed to load children after login:', childrenError)
    }

    useAuthStore.getState().setChildren(children)
    navigate(resolvePostLoginRoute(payload.user.role, children.length), { replace: true })
  }

  const handleGoogleAuthenticated = async (payload: AuthPayload) => {
    setLoading(true)
    setError('')
    try {
      await finishAuthAndRoute(payload)
      trackEvent('google_login_completed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    trackEvent('login_button_click')
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', { email, password })
      const payload = response.data.data as AuthPayload
      await finishAuthAndRoute(payload)
      trackEvent('login_completed')
    } catch (requestError: unknown) {
      const nextError =
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        typeof (requestError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (requestError as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Login gagal.'
      setError(nextError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      mascotSrc="/achievement-left.png"
      eyebrow="Masuk"
      title="Selamat datang kembali"
      subtitle="Lanjutkan progres anak-anak kamu di QUPU"
      footer={
        <span>
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-qupu-brand-orange hover:underline">
            Buat akun baru
          </Link>
        </span>
      }
    >
      <div className="space-y-5">
        {expired && (
          <div className="rounded-[1.25rem] bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            <i className="fa-solid fa-clock mr-2" aria-hidden="true" />
            Sesi kamu sudah berakhir. Silakan login lagi.
          </div>
        )}

        <GoogleSignInButton onAuthenticated={handleGoogleAuthenticated} onError={setError} />

        <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-muted">
          <span className="h-px flex-1 bg-qupu-peach" />
          atau
          <span className="h-px flex-1 bg-qupu-peach" />
        </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
            <i className="fa-solid fa-arrow-right-to-bracket text-base text-qupu-brand-blue" aria-hidden="true" />
          </span>
          {loading ? 'Sedang masuk...' : 'Masuk ke akun'}
        </button>
      </form>
      </div>
    </AuthCard>
  )
}
