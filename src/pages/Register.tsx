import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Mail, Phone, UserCircle2 } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import type { AuthPayload } from '../types'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/register', {
        ...form,
        age: null,
      })
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
    <div className="mx-auto max-w-xl">
      <div className="rounded-[2.5rem] border border-qupu-peach bg-white p-8 shadow-soft sm:p-10">
        <div className="text-sm font-bold uppercase tracking-[0.24em] text-qupu-orange">Register</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-qupu-purple">
          Buat akun orang tua QUPU
        </h1>
        <p className="mt-3 text-qupu-muted">
          Satu akun untuk semua anak. Setelah daftar kamu bisa tambah profil tiap anak dan simpan progres masing-masing.
        </p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <Field
            label="Nama orang tua"
            icon={UserCircle2}
            value={form.name}
            onChange={(value) => setForm((state) => ({ ...state, name: value }))}
            placeholder="Nama kamu"
            type="text"
          />
          <Field
            label="Email"
            icon={Mail}
            value={form.email}
            onChange={(value) => setForm((state) => ({ ...state, email: value }))}
            placeholder="orangtua@contoh.com"
            type="email"
          />
          <Field
            label="No. HP"
            icon={Phone}
            value={form.phone}
            onChange={(value) => setForm((state) => ({ ...state, phone: value }))}
            placeholder="0812xxxx"
            type="tel"
          />
          <Field
            label="Password"
            icon={Lock}
            value={form.password}
            onChange={(value) => setForm((state) => ({ ...state, password: value }))}
            placeholder="minimal 8 karakter"
            type="password"
          />

          {error && (
            <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-qupu-orange px-5 py-4 text-base font-bold text-white transition-colors hover:bg-qupu-orange-dark disabled:opacity-60"
          >
            {loading ? 'Membuat akun...' : 'Buat akun orang tua'}
          </button>
        </form>

        <div className="mt-6 text-sm text-qupu-muted">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-qupu-purple hover:underline">
            Login di sini
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
