import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { AuthPayload, Child } from '../types'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', { email, password })
      const payload = response.data.data as AuthPayload
      login(payload.user, payload.token)

      let children: Child[] = []
      try {
        const childrenResponse = await api.get('/me/children')
        children = childrenResponse.data.data.children ?? []
      } catch (childrenError) {
        console.error('Failed to load children after login:', childrenError)
      }

      useAuthStore.getState().setChildren(children)
      navigate(children.length === 0 ? '/onboarding/child' : '/dashboard', { replace: true })
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
    <div className="mx-auto max-w-lg">
      <div className="rounded-[2.5rem] border border-qupu-peach bg-white p-8 shadow-soft sm:p-10">
        <div className="text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">Login</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-qupu-purple">Masuk ke dashboard QUPU</h1>
        <p className="mt-3 text-qupu-muted">
          Lanjutkan progres, simpan skor terbaru, dan lihat badge yang sudah kebuka.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Field
            label="Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="orangtua@contoh.com"
          />
          <Field
            label="Password"
            icon={Lock}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="********"
          />

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-qupu-purple px-5 py-4 text-base font-bold text-white transition-colors hover:bg-qupu-purple-dark disabled:opacity-60"
          >
            {loading ? 'Sedang masuk...' : 'Masuk ke akun'}
          </button>
        </form>

        <div className="mt-6 text-sm text-qupu-muted">
          Belum punya akun?{' '}
          <Link to="/register" className="font-bold text-qupu-orange hover:underline">
            Buat akun baru
          </Link>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string
  icon: typeof Mail
  value: string
  onChange: (value: string) => void
  placeholder: string
  type: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-qupu-muted" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-[1.2rem] border border-qupu-peach bg-qupu-shell px-12 py-4 text-qupu-ink outline-none transition-colors focus:border-qupu-orange"
        />
      </div>
    </label>
  )
}
