// src/pages/Register.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import AuthCard from '../components/AuthCard'
import { useAuthStore } from '../store/authStore'
import type { AuthPayload } from '../types'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/register', { ...form, age: null })
      const payload = response.data.data as AuthPayload
      login(payload.user, payload.token)
      navigate('/onboarding/child', { replace: true })
    } catch (requestError: unknown) {
      const nextError =
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError &&
        typeof (requestError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (requestError as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Registrasi gagal.'
      setError(nextError)
    } finally {
      setLoading(false)
    }
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
      <form className="space-y-4" onSubmit={handleSubmit}>
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
            <i className="fa-solid fa-user-plus text-base text-qupu-brand-orange" aria-hidden="true" />
          </span>
          {loading ? 'Membuat akun...' : 'Buat akun orang tua'}
        </button>
      </form>
    </AuthCard>
  )
}

function PillField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string
  icon: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <div className="relative mt-2">
        <i
          className={`${icon} pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-qupu-muted`}
          aria-hidden="true"
        />
        <input
          type={type}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        />
      </div>
    </label>
  )
}
