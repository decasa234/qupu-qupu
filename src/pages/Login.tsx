// src/pages/Login.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import AuthCard from '../components/AuthCard'
import PillField from '../components/PillField'
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
    </AuthCard>
  )
}
