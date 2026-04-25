# Public Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the home page's design language to `/login`, `/register`, `/onboarding/child`, `/videos`, and `/videos/:slug` so the public-facing surface reads as one product.

**Architecture:** Extract the shared `Reveal` motion helper, build a new `AuthCard` shell component for the three auth pages, build a styled `Slider` and `ChildForm` for reuse, then migrate each page to consume the new components plus the established tokens (peach offset shadows, dashed orange borders, FontAwesome icons, navy/orange CTAs, brand color tokens). No backend changes.

**Tech Stack:** React 18 + Vite + TypeScript, Tailwind 3 (custom tokens in `tailwind.config.js`), framer-motion (already installed) for `Reveal` and tier-change animations, FontAwesome via CDN for iconography, react-router-dom for routing, zustand for auth/active-child state, axios for API.

**Note on testing:** This repo has no test runner configured (per `CLAUDE.md`). Verification at each task uses `npm run check`, `npm run lint`, `npm run build`, and a manual visual pass via `npm run dev`. Steps that would normally be "write failing test" are replaced with type-check / build-passes / visual-regression checks.

---

## File structure

**New files**
- `src/components/Reveal.tsx` — extracted scroll-entry motion wrapper.
- `src/components/AuthCard.tsx` — shared auth page shell (mascot + eyebrow + title + form slot + footer slot).
- `src/components/Slider.tsx` — styled `<input type="range">` with floating value chip.
- `src/components/ChildForm.tsx` — extracted child-creation form fields (used by `ChildModal` and `OnboardingChild`).

**Modified files**
- `src/pages/Home.tsx` — import `Reveal` from its new location.
- `src/pages/Login.tsx` — adopt `AuthCard`.
- `src/pages/Register.tsx` — adopt `AuthCard`.
- `src/pages/OnboardingChild.tsx` — adopt `AuthCard` + render `ChildForm` inline (no modal).
- `src/components/ChildModal.tsx` — wrap `ChildForm` body, keep modal chrome.
- `src/pages/Videos.tsx` — refined header card + staggered grid + design-language consistency.
- `src/components/VideoCard.tsx` — apply tokens (border, shadow, hover state, FontAwesome play icon).
- `src/pages/VideoDetail.tsx` — full layout pass: player frame, description card, badge family card, score input card with slider + tier preview, result state, not-found state.

**No backend changes.** No new dependencies.

---

## Task 1: Extract `Reveal` motion wrapper

**Files:**
- Create: `src/components/Reveal.tsx`
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Create the file**

```tsx
// src/components/Reveal.tsx
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        type: 'spring',
        stiffness: 95,
        damping: 14,
        mass: 0.9,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Update `Home.tsx` to import from the new location and remove the local definition**

In `src/pages/Home.tsx`:
- Add the import after the other component imports: `import Reveal from '../components/Reveal'`
- Remove the local `function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) { ... }` definition (it currently lives just above `/* ==================== HERO ==================== */`).
- Remove the `import { motion } from 'framer-motion'` line — it's no longer used in `Home.tsx` after the Reveal extraction.

- [ ] **Step 3: Verify build**

```bash
npm run check
npm run lint
```

Expected: both pass with zero errors. If `motion` is still referenced elsewhere in `Home.tsx` (search the file), keep the framer-motion import.

- [ ] **Step 4: Commit**

```bash
git add src/components/Reveal.tsx src/pages/Home.tsx
git commit -m "refactor: extract Reveal motion wrapper to its own component"
```

---

## Task 2: Create `AuthCard` shell component

**Files:**
- Create: `src/components/AuthCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/AuthCard.tsx
import type { ReactNode } from 'react'
import Reveal from './Reveal'
import { cn } from '../lib/utils'

interface AuthCardProps {
  mascotSrc: string
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export default function AuthCard({
  mascotSrc,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <Reveal>
      <div className={cn('relative mx-auto max-w-lg', className)}>
        <img
          src={mascotSrc}
          alt=""
          draggable={false}
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-12 h-28 w-auto select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.25)] sm:-right-6 sm:-top-14 sm:h-32"
        />

        <i
          className="fa-solid fa-star pointer-events-none absolute -left-4 top-6 text-2xl text-qupu-brand-yellow drop-shadow-sm"
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-star pointer-events-none absolute right-10 -top-2 text-base text-qupu-brand-yellow/80"
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-star pointer-events-none absolute -left-2 bottom-12 text-sm text-qupu-brand-yellow/70"
          aria-hidden="true"
        />
        <i
          className="fa-solid fa-star pointer-events-none absolute -right-3 bottom-6 text-lg text-qupu-brand-yellow"
          aria-hidden="true"
        />

        <div className="relative rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-8 shadow-[6px_8px_0_0_#FFD3B1] sm:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            {eyebrow}
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-qupu-brand-blue sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm font-semibold leading-relaxed text-qupu-muted sm:text-base">
              {subtitle}
            </p>
          )}

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-6 border-t border-qupu-peach pt-5 text-sm text-qupu-muted">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run check
```

Expected: pass. The component is unused so no ESLint issues for now.

- [ ] **Step 3: Commit**

```bash
git add src/components/AuthCard.tsx
git commit -m "feat: add AuthCard shared shell for auth pages"
```

---

## Task 3: Migrate `Login.tsx` to `AuthCard`

**Files:**
- Modify: `src/pages/Login.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
// src/pages/Login.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import AuthCard from '../components/AuthCard'
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
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass.

- [ ] **Step 3: Visual check**

Run `npm run dev`, browse to `/login`, confirm: cream page bg, centered card with mascot peeking top-right, navy heading, orange "MASUK" eyebrow, two pill inputs with FontAwesome icons, navy CTA, footer link to `/register`. Stars decorating corners.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Login.tsx
git commit -m "feat: redesign Login with AuthCard shell"
```

---

## Task 4: Migrate `Register.tsx` to `AuthCard`

**Files:**
- Modify: `src/pages/Register.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
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
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass.

- [ ] **Step 3: Visual check**

Run `npm run dev`, browse to `/register`, confirm: mascot peeks top-right (right variant), orange "DAFTAR" eyebrow, four pill inputs with icons, orange CTA (variation from Login's navy), footer link to `/login`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Register.tsx
git commit -m "feat: redesign Register with AuthCard shell"
```

---

## Task 5: Extract `ChildForm` from `ChildModal`

**Files:**
- Create: `src/components/ChildForm.tsx`
- Modify: `src/components/ChildModal.tsx`

- [ ] **Step 1: Create `ChildForm.tsx`**

```tsx
// src/components/ChildForm.tsx
import { useEffect, useState } from 'react'
import api from '../lib/api'
import type { AgeGroupOption, Child } from '../types'

const AVATAR_PRESETS = ['#FB923C', '#F472B6', '#60A5FA', '#34D399', '#A78BFA', '#F59E0B']

interface ChildFormProps {
  submitLabel: string
  onCreated: (child: Child) => void
  onError?: (message: string) => void
}

export default function ChildForm({ submitLabel, onCreated, onError }: ChildFormProps) {
  const [name, setName] = useState('')
  const [ageGroupId, setAgeGroupId] = useState('')
  const [avatarColor, setAvatarColor] = useState(AVATAR_PRESETS[0])
  const [ageGroups, setAgeGroups] = useState<AgeGroupOption[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void api
      .get('/public/meta')
      .then((response) => {
        const groups: AgeGroupOption[] = response.data.data.ageGroups ?? []
        setAgeGroups(groups)
      })
      .catch((fetchError) => {
        console.error('Failed to load age groups:', fetchError)
      })
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      setError('Nama anak wajib diisi.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await api.post('/me/children', {
        name: name.trim(),
        ageGroupId: ageGroupId || null,
        avatarColor,
      })
      const child = response.data.data.child as Child
      onCreated(child)
    } catch (submitError: unknown) {
      const nextError =
        typeof submitError === 'object' &&
        submitError !== null &&
        'response' in submitError &&
        typeof (submitError as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (submitError as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Gagal menambahkan anak.'
      setError(nextError)
      onError?.(nextError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Nama anak</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Contoh: Aira"
          maxLength={80}
          className="mt-2 w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">
          Kelompok usia (opsional)
        </span>
        <select
          value={ageGroupId}
          onChange={(event) => setAgeGroupId(event.target.value)}
          className="mt-2 w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-5 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        >
          <option value="">Pilih nanti</option>
          {ageGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">Warna avatar</span>
        <div className="mt-2 flex flex-wrap gap-3">
          {AVATAR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setAvatarColor(color)}
              aria-label={`Pilih warna ${color}`}
              className={`h-10 w-10 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 ${
                avatarColor === color ? 'border-qupu-brand-blue' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
          <i className="fa-solid fa-circle-check text-base text-qupu-brand-orange" aria-hidden="true" />
        </span>
        {saving ? 'Menyimpan...' : submitLabel}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Refactor `ChildModal.tsx` to use `ChildForm`**

Replace the entire `src/components/ChildModal.tsx` file with:

```tsx
// src/components/ChildModal.tsx
import { X } from 'lucide-react'
import ChildForm from './ChildForm'
import type { Child } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (child: Child) => void
  title?: string
  submitLabel?: string
}

export default function ChildModal({
  open,
  onClose,
  onCreated,
  title = 'Tambah profil anak',
  submitLabel = 'Simpan profil',
}: Props) {
  if (!open) return null

  const handleCreated = (child: Child) => {
    onCreated(child)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-qupu-brand-blue/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-qupu-peach bg-white p-6 shadow-clay">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Profil Anak</div>
            <h2 className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue">{title}</h2>
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

        <div className="mt-5">
          <ChildForm submitLabel={submitLabel} onCreated={handleCreated} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass. The modal still works because `ChildForm` carries the same logic that previously lived inside it.

- [ ] **Step 4: Visual check**

Run `npm run dev`, log in, click the navbar child switcher, hit "Tambah profil anak". Modal should open and the form should still create a child end-to-end.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChildForm.tsx src/components/ChildModal.tsx
git commit -m "refactor: extract ChildForm so it can be reused outside the modal"
```

---

## Task 6: Migrate `OnboardingChild.tsx` to `AuthCard` + inline `ChildForm`

**Files:**
- Modify: `src/pages/OnboardingChild.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
// src/pages/OnboardingChild.tsx
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/AuthCard'
import ChildForm from '../components/ChildForm'
import { useAuthStore } from '../store/authStore'
import type { Child } from '../types'

export default function OnboardingChild() {
  const navigate = useNavigate()
  const { children, activeChildId, addChild, setActiveChild } = useAuthStore()

  useEffect(() => {
    if (children.length > 0 && activeChildId) {
      navigate('/dashboard', { replace: true })
    }
  }, [children, activeChildId, navigate])

  const handleCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthCard
      mascotSrc="/hero-mascot.png"
      eyebrow="Profil Anak"
      title="Tambah profil anak pertama"
      subtitle="Setiap anak punya progres dan koleksi badge sendiri. Kamu bisa tambah lebih banyak profil kapan saja."
      footer={
        <Link to="/dashboard" className="font-semibold hover:text-qupu-brand-orange">
          Lewati untuk sekarang
        </Link>
      }
    >
      <ChildForm submitLabel="Simpan dan mulai" onCreated={handleCreated} />
    </AuthCard>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass.

- [ ] **Step 3: Visual check**

Register a new test parent, get redirected to `/onboarding/child`, confirm the new card layout (hero mascot peeking top-right, "PROFIL ANAK" eyebrow). Submit the form to create a child — should redirect to `/dashboard`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/OnboardingChild.tsx
git commit -m "feat: redesign OnboardingChild with AuthCard + inline ChildForm"
```

---

## Task 7: Create `Slider` component

**Files:**
- Create: `src/components/Slider.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/Slider.tsx
import { useId } from 'react'
import { cn } from '../lib/utils'

interface SliderProps {
  value: number
  min?: number
  max: number
  step?: number
  onChange: (value: number) => void
  className?: string
  ariaLabel?: string
}

export default function Slider({
  value,
  min = 0,
  max,
  step = 1,
  onChange,
  className,
  ariaLabel,
}: SliderProps) {
  const id = useId()
  const range = max - min === 0 ? 1 : max - min
  const percent = ((value - min) / range) * 100

  return (
    <div className={cn('relative w-full select-none px-3 pb-2 pt-10', className)}>
      <div
        className="pointer-events-none absolute -translate-x-1/2 transition-[left] duration-150 ease-out"
        style={{ left: `calc(${percent}% + ${12 - percent * 0.24}px)`, top: 0 }}
      >
        <div className="relative">
          <div className="rounded-xl bg-qupu-brand-blue px-3 py-1 font-display text-sm font-extrabold text-white shadow-[0_2px_0_0_#263B55]">
            {value}
          </div>
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px"
            aria-hidden="true"
          >
            <div className="h-2 w-2 rotate-45 bg-qupu-brand-blue" />
          </div>
        </div>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={ariaLabel}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full bg-qupu-peach',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-qupu-brand-orange/30',
          '[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-qupu-peach',
          '[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-qupu-peach',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:-translate-y-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-qupu-brand-orange [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-subscribe [&::-webkit-slider-thumb]:transition-transform',
          '[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-qupu-brand-orange [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-subscribe',
        )}
        style={{
          background: `linear-gradient(to right, #EF711A 0%, #EF711A ${percent}%, #FFD3B1 ${percent}%, #FFD3B1 100%)`,
        }}
      />

      <div className="mt-2 flex justify-between text-xs font-semibold text-qupu-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npm run check
npm run lint
```

Expected: pass. Component is unused at this point — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/components/Slider.tsx
git commit -m "feat: add Slider component with floating value chip"
```

---

## Task 8: Refresh `VideoCard.tsx` to match design language

**Files:**
- Modify: `src/components/VideoCard.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
// src/components/VideoCard.tsx
import { Link } from 'react-router-dom'
import type { VideoCard as VideoCardType } from '../types'

interface VideoCardProps {
  video: VideoCardType
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white shadow-[5px_6px_0_0_#FFD3B1] transition-all duration-200 hover:-translate-y-1 hover:border-qupu-brand-orange">
      <Link to={`/videos/${video.slug}`} className="block cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-qupu-cream">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div
            className="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white shadow-sm"
            style={{ backgroundColor: video.subject.colorHex }}
          >
            {video.subject.name}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-qupu-brand-blue shadow-sm">
            {video.ageGroup.name}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-qupu-brand-orange shadow-clay-orange">
              <i className="fa-solid fa-play text-lg text-white" aria-hidden="true" />
            </div>
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 font-display text-lg font-extrabold leading-tight text-qupu-brand-blue group-hover:text-qupu-brand-orange">
          {video.title}
        </h3>
        {video.description && (
          <p className="line-clamp-2 text-xs font-medium leading-relaxed text-qupu-muted">
            {video.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-qupu-muted">
          <span>{video.numberOfQuestions} soal</span>
          <span className="text-qupu-muted/50">•</span>
          <span>{video.difficulty}</span>
        </div>

        <div className="flex items-center justify-between rounded-[1.25rem] bg-qupu-cream px-4 py-2.5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-qupu-muted">Badge</div>
            <div className="text-sm font-bold text-qupu-brand-blue">{video.badgeFamily.name}</div>
          </div>
          <Link
            to={`/videos/${video.slug}`}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 text-xs font-extrabold text-white transition-transform hover:-translate-y-0.5"
          >
            Detail
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass.

- [ ] **Step 3: Visual check**

Browse to `/videos`. Confirm cards now have: dashed-blue→orange border on hover, peach offset shadow, FontAwesome play overlay, age group pill top-right of thumbnail, badge family chip + orange "Detail" button at the bottom of each card.

- [ ] **Step 4: Commit**

```bash
git add src/components/VideoCard.tsx
git commit -m "feat: restyle VideoCard with new design tokens"
```

---

## Task 9: Refine the `Videos` catalog page

**Files:**
- Modify: `src/pages/Videos.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
// src/pages/Videos.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import VideoCard from '../components/VideoCard'
import Reveal from '../components/Reveal'
import type { VideoCard as VideoCardType } from '../types'

export default function VideosPage() {
  const [search, setSearch] = useState('')
  const [videos, setVideos] = useState<VideoCardType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const debouncedSearch = useDebounced(search, 250)

  useEffect(() => {
    async function load() {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError('')

      try {
        const response = await api.get('/public/videos', {
          params: debouncedSearch ? { search: debouncedSearch } : {},
          signal: controller.signal,
        })
        setVideos(response.data.data.videos ?? [])
      } catch (requestError: unknown) {
        if (controller.signal.aborted) return
        console.error('Failed to load videos:', requestError)
        setError('Gagal memuat katalog video.')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => abortRef.current?.abort()
  }, [debouncedSearch])

  const looksLikeYoutubeLink = useMemo(
    () => /youtube\.com|youtu\.be/i.test(search.trim()),
    [search],
  )

  return (
    <div className="space-y-8">
      <Reveal>
        <section className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[6px_8px_0_0_#FFD3B1] sm:p-8 lg:p-10">
          <i
            className="fa-solid fa-star pointer-events-none absolute left-5 top-5 text-xl text-qupu-brand-yellow drop-shadow-sm"
            aria-hidden="true"
          />
          <i
            className="fa-solid fa-star pointer-events-none absolute right-8 top-3 text-base text-qupu-brand-yellow/80"
            aria-hidden="true"
          />
          <i
            className="fa-solid fa-star pointer-events-none absolute right-3 bottom-6 text-sm text-qupu-brand-yellow/70"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                Katalog Video
              </div>
              <h1 className="font-display text-4xl font-extrabold text-qupu-brand-blue sm:text-5xl">
                Cari video QUPU favorit anak
              </h1>
              <p className="max-w-xl text-base font-semibold leading-relaxed text-qupu-muted">
                Ketik judul, topik, atau tempel link YouTube — kami akan cocokkan dengan video yang ada di QUPU.
              </p>

              <div className="relative">
                <i
                  className="fa-solid fa-magnifying-glass pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-qupu-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari judul, deskripsi, atau tempel link YouTube..."
                  className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3.5 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-qupu-cream p-2 text-qupu-muted transition-colors hover:text-qupu-brand-blue"
                  >
                    <i className="fa-solid fa-xmark text-xs" aria-hidden="true" />
                  </button>
                )}
              </div>

              {looksLikeYoutubeLink && (
                <div className="inline-flex items-center gap-2 rounded-full bg-qupu-cream px-3 py-1.5 text-xs font-semibold text-qupu-brand-orange">
                  <i className="fa-solid fa-link text-xs" aria-hidden="true" />
                  Link YouTube terdeteksi
                </div>
              )}
            </div>

            <div className="hidden justify-center lg:flex">
              <img
                src="/hero-mascot.png"
                alt=""
                draggable={false}
                aria-hidden="true"
                className="h-auto w-full max-w-[280px] select-none drop-shadow-[0_10px_24px_rgba(120,60,0,0.2)]"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {error && (
        <div className="rounded-[1.5rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-[2rem] bg-qupu-peach/40"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Reveal delay={0.05}>
          <section className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-10 text-center shadow-[5px_6px_0_0_#FFD3B1]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
              <i className="fa-solid fa-magnifying-glass text-2xl" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-qupu-brand-blue">
              Video belum ditemukan
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-qupu-muted">
              {looksLikeYoutubeLink
                ? 'Video dari link itu belum ada di katalog QUPU. Coba cari pakai judul atau topik.'
                : 'Coba kata kunci lain, atau hapus filter pencarian.'}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-orange transition-colors hover:bg-qupu-brand-orange hover:text-white"
              >
                <i className="fa-solid fa-rotate-left text-sm" aria-hidden="true" />
                Hapus pencarian
              </button>
            )}
          </section>
        </Reveal>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                type: 'spring',
                stiffness: 95,
                damping: 14,
                mass: 0.9,
                delay: index * 0.06,
              }}
            >
              <VideoCard video={video} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handle)
  }, [value, delay])

  return debounced
}
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
npm run build
```

Expected: pass.

- [ ] **Step 3: Visual check**

Browse to `/videos`. Confirm: refined header card with dashed orange border, eyebrow + navy title + subtitle + search pill, mascot illustration on the right (lg+), "Link YouTube terdeteksi" chip when pasting URLs, video grid with stagger entry, refined empty state.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Videos.tsx
git commit -m "feat: redesign Videos catalog with refined header and staggered grid"
```

---

## Task 10: Rebuild `VideoDetail` page — layout, player frame, description card

**Files:**
- Modify: `src/pages/VideoDetail.tsx`

This task only handles the left column and overall layout. Subsequent tasks add the right-column cards and score state machine.

- [ ] **Step 1: Replace the file contents**

```tsx
// src/pages/VideoDetail.tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import { formatDateLabel } from '../lib/youtube'
import Reveal from '../components/Reveal'
import Slider from '../components/Slider'
import ChildModal from '../components/ChildModal'
import { useAuthStore } from '../store/authStore'
import type { Child, ScoreAttemptResult, VideoDetail } from '../types'

export default function VideoDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, activeChildId, children, addChild, setActiveChild } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null

  const [video, setVideo] = useState<VideoDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<ScoreAttemptResult | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const response = await api.get(`/public/videos/${slug}`)
        setVideo(response.data.data)
      } catch (fetchError) {
        console.error('Failed to load video:', fetchError)
        setLoadError('Video tidak ditemukan atau belum dipublikasikan.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [slug])

  const previewTier = useMemo(() => {
    if (!video) return null
    return (
      [...video.badgeRules]
        .sort((a, b) => b.tier - a.tier)
        .find(
          (rule) =>
            score >= rule.minCorrect &&
            (rule.maxCorrect === null || score <= rule.maxCorrect),
        ) ?? null
    )
  }, [score, video])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!video || !activeChildId) return

    setSaving(true)
    setSubmitError('')

    try {
      const response = await api.post('/me/video-scores', {
        childId: activeChildId,
        videoId: video.id,
        correctAnswers: score,
      })
      setResult(response.data.data)
    } catch (submitErr: unknown) {
      const nextError =
        typeof submitErr === 'object' &&
        submitErr !== null &&
        'response' in submitErr &&
        typeof (submitErr as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
          ? (submitErr as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Gagal menyimpan skor.'
      setSubmitError(nextError)
    } finally {
      setSaving(false)
    }
  }

  const handleChildCreated = (child: Child) => {
    addChild(child)
    setActiveChild(child.id)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="aspect-video animate-pulse rounded-[2rem] bg-qupu-peach/40" />
        <div className="h-48 animate-pulse rounded-[2rem] bg-qupu-peach/40" />
      </div>
    )
  }

  if (loadError || !video) {
    return (
      <Reveal>
        <section className="rounded-[2.5rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-10 text-center shadow-[6px_8px_0_0_#FFD3B1]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-circle-question text-2xl" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-qupu-brand-blue">
            Video belum tersedia
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-qupu-muted">
            Coba kembali ke beranda untuk memilih video QUPU lainnya.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-house text-sm" aria-hidden="true" />
            Kembali ke beranda
          </Link>
        </section>
      </Reveal>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-qupu-cream shadow-[6px_8px_0_0_#FFD3B1]">
            <div className="aspect-video">
              <iframe
                src={video.embedUrl}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-qupu-muted">
              <span
                className="rounded-full px-3 py-1 text-white"
                style={{ backgroundColor: video.subject.colorHex }}
              >
                {video.subject.name}
              </span>
              <span className="rounded-full bg-qupu-cream px-3 py-1 text-qupu-brand-blue">
                {video.ageGroup.name}
              </span>
              <span className="rounded-full bg-qupu-cream px-3 py-1 text-qupu-brand-blue">
                {video.numberOfQuestions} soal
              </span>
              {video.publishedAt && (
                <span className="rounded-full bg-qupu-cream px-3 py-1 text-qupu-brand-blue">
                  {formatDateLabel(video.publishedAt)}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-qupu-brand-blue">{video.title}</h1>
            <p className="mt-4 text-base leading-7 text-qupu-muted">{video.description}</p>
          </div>
        </Reveal>
      </div>

      <div className="space-y-6">
        {/* Right column placeholder — Tasks 11–13 fill this in */}
        <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-sm text-qupu-muted shadow-[5px_6px_0_0_#FFD3B1]">
          Right column under construction. Tasks 11–13 will replace this with the badge family card,
          score input card, and result state.
        </div>
      </div>

      <ChildModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleChildCreated}
      />

      {/* Suppress unused-vars while right column is stubbed; remove after Task 12 */}
      {false && (
        <span className="hidden">
          {String(score)}
          {String(saving)}
          {String(submitError)}
          {String(result)}
          {String(previewTier)}
          {String(activeChild)}
          {String(isAuthenticated)}
          {String(setScore)}
          {String(handleSubmit)}
          {Slider.name}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass. The "suppress unused" block keeps lint quiet while later tasks fill in usage.

- [ ] **Step 3: Visual check**

Browse to a `/videos/:slug` page. Confirm: video player frame with dashed border + peach offset shadow, description card with meta pills + navy title + body, right column shows the placeholder note. Not-found state renders for an invalid slug.

- [ ] **Step 4: Commit**

```bash
git add src/pages/VideoDetail.tsx
git commit -m "feat: rebuild VideoDetail layout, player frame, description card"
```

---

## Task 11: Add badge family card to `VideoDetail`

**Files:**
- Modify: `src/pages/VideoDetail.tsx`

- [ ] **Step 1: Replace the right-column placeholder block**

Find the block:

```tsx
      <div className="space-y-6">
        {/* Right column placeholder — Tasks 11–13 fill this in */}
        <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-sm text-qupu-muted shadow-[5px_6px_0_0_#FFD3B1]">
          Right column under construction. Tasks 11–13 will replace this with the badge family card,
          score input card, and result state.
        </div>
      </div>
```

Replace with:

```tsx
      <div className="space-y-6">
        <Reveal>
          <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                  Badge Family
                </div>
                <div className="mt-1 font-display text-2xl font-bold text-qupu-brand-blue">
                  {video.badgeFamily.name}
                </div>
                {video.badgeFamily.description && (
                  <p className="mt-2 text-xs font-medium text-qupu-muted">
                    {video.badgeFamily.description}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                style={{ backgroundColor: video.badgeFamily.colorHex }}
              >
                3 Tier
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {video.badgeRules.map((rule, index) => (
                <Reveal key={rule.badgeTierId} delay={0.05 * (index + 1)}>
                  <div className="flex items-center justify-between rounded-[1.25rem] bg-qupu-cream px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: rule.colorHex }}
                      >
                        <i className="fa-solid fa-star text-sm" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-qupu-brand-blue">
                          Tier {rule.tier} · {rule.name}
                        </div>
                        <div className="text-xs text-qupu-muted">
                          {rule.minCorrect} – {rule.maxCorrect ?? `${video.numberOfQuestions}+`} jawaban benar
                        </div>
                      </div>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                      style={{ backgroundColor: rule.colorHex }}
                    >
                      Unlock
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Score input card placeholder — Task 12 fills this in */}
        <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-sm text-qupu-muted shadow-[5px_6px_0_0_#FFD3B1]">
          Score input card lives here (Task 12).
        </div>
      </div>
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass.

- [ ] **Step 3: Visual check**

On a `/videos/:slug` page, the right column should now show: badge family card with eyebrow + name + 3 TIER pill + family description + 3 tier rows (color circle + tier number + name + range + Unlock pill). Tier rows fade/scale in with stagger.

- [ ] **Step 4: Commit**

```bash
git add src/pages/VideoDetail.tsx
git commit -m "feat: add badge family card to VideoDetail right column"
```

---

## Task 12: Add score input card with slider + tier preview

**Files:**
- Modify: `src/pages/VideoDetail.tsx`

- [ ] **Step 1: Replace the score-input placeholder block**

Find:

```tsx
        {/* Score input card placeholder — Task 12 fills this in */}
        <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 text-sm text-qupu-muted shadow-[5px_6px_0_0_#FFD3B1]">
          Score input card lives here (Task 12).
        </div>
```

Replace with the result-aware score card:

```tsx
        <Reveal delay={0.05}>
          <div className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-orange/60 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] sm:p-7">
            {!isAuthenticated && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
                  <i className="fa-solid fa-lock text-xl" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-qupu-brand-blue">
                  Login untuk menyimpan progres
                </h2>
                <p className="mt-2 text-sm text-qupu-muted">
                  Video tetap bisa ditonton oleh siapa pun, tapi badge dan progres butuh akun.
                </p>
                <div className="mt-5 grid gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-3 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
                  >
                    <i className="fa-solid fa-user-plus text-sm" aria-hidden="true" />
                    Buat akun QUPU
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-blue bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-blue transition-colors hover:bg-qupu-brand-blue hover:text-white"
                  >
                    Sudah punya akun? Login
                  </Link>
                </div>
              </div>
            )}

            {isAuthenticated && !activeChild && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
                  <i className="fa-solid fa-user-plus text-xl" aria-hidden="true" />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-qupu-brand-blue">
                  Pilih profil anak dulu
                </h2>
                <p className="mt-2 text-sm text-qupu-muted">
                  Tambahkan atau pilih profil anak untuk menyimpan skor.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-3 font-display text-sm font-extrabold text-white shadow-[0_3px_0_0_#B8541A] transition-transform hover:-translate-y-0.5"
                >
                  <i className="fa-solid fa-plus text-sm" aria-hidden="true" />
                  Tambah profil anak
                </button>
              </div>
            )}

            {isAuthenticated && activeChild && !result && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                    Input Skor
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span
                      className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: activeChild.avatarColor ?? '#FB923C' }}
                    />
                    <h2 className="font-display text-2xl font-bold text-qupu-brand-blue">
                      Skor {activeChild.name}
                    </h2>
                  </div>
                  <p className="mt-2 text-xs text-qupu-muted">
                    Geser untuk masukkan jumlah jawaban benar (0 – {video.numberOfQuestions}).
                  </p>
                </div>

                <Slider
                  value={score}
                  max={video.numberOfQuestions}
                  onChange={setScore}
                  ariaLabel="Jumlah jawaban benar"
                />

                <div
                  key={previewTier?.tier ?? 'none'}
                  className="rounded-[1.5rem] px-4 py-4 transition-colors"
                  style={{
                    backgroundColor: previewTier ? `${previewTier.colorHex}1F` : '#FFF2DF',
                  }}
                >
                  {previewTier ? (
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: previewTier.colorHex }}
                      >
                        <i className="fa-solid fa-star text-sm" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
                          Akan terbuka
                        </div>
                        <div className="font-display text-base font-extrabold text-qupu-brand-blue">
                          Tier {previewTier.tier} · {previewTier.name}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-qupu-muted">
                      <i className="fa-solid fa-circle-info" aria-hidden="true" />
                      Skor ini belum membuka badge. Coba lagi dengan hasil lebih tinggi.
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                    <i className="fa-solid fa-floppy-disk text-base text-qupu-brand-blue" aria-hidden="true" />
                  </span>
                  {saving ? 'Menyimpan...' : `Simpan skor ${score}/${video.numberOfQuestions}`}
                </button>
              </form>
            )}

            {result && (
              <div className="text-center">
                {/* Result UI placeholder — Task 13 fills this in */}
                <div className="rounded-[1.5rem] bg-qupu-cream px-4 py-6 text-sm text-qupu-muted">
                  Result placeholder. Task 13 turns this into the celebration view.
                </div>
              </div>
            )}
          </div>
        </Reveal>
```

Also remove the "suppress unused" `{false && ( ... )}` block at the bottom of the component since `score`, `saving`, `submitError`, `previewTier`, `activeChild`, `isAuthenticated`, `setScore`, `handleSubmit`, and `Slider` are now actually used. Search for `{false && (` and delete that whole `<span className="hidden">…</span>` JSX block.

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
```

Expected: pass.

- [ ] **Step 3: Visual check**

Sign in. Browse to `/videos/:slug`. Confirm three reachable states:
1. Log out → unauthenticated card with lock icon + Buat akun / Login CTAs.
2. Log in but no active child → "Pilih profil anak" card + button opens modal.
3. With active child → score input card with header, slider, live tier preview, big navy CTA. Drag the slider — tier preview color and label update.

- [ ] **Step 4: Commit**

```bash
git add src/pages/VideoDetail.tsx
git commit -m "feat: add score input card with slider and live tier preview"
```

---

## Task 13: Build the score result celebration view

**Files:**
- Modify: `src/pages/VideoDetail.tsx`

- [ ] **Step 1: Replace the result placeholder block**

Find:

```tsx
            {result && (
              <div className="text-center">
                {/* Result UI placeholder — Task 13 fills this in */}
                <div className="rounded-[1.5rem] bg-qupu-cream px-4 py-6 text-sm text-qupu-muted">
                  Result placeholder. Task 13 turns this into the celebration view.
                </div>
              </div>
            )}
```

Replace with:

```tsx
            {result && (
              <div className="space-y-5 text-center">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
                  Skor Tersimpan
                </div>

                <div className="font-display text-6xl font-extrabold leading-none text-qupu-brand-blue">
                  {result.attempt.scorePercentage}%
                </div>
                <div className="text-xs font-semibold text-qupu-muted">
                  {result.attempt.correctAnswers} / {result.attempt.totalQuestions} jawaban benar
                </div>

                {result.unlockedBadge ? (
                  <div className="relative mx-auto inline-flex items-center gap-3 overflow-visible rounded-full px-5 py-3 text-white shadow-sm" style={{ backgroundColor: result.unlockedBadge.colorHex }}>
                    <i className="fa-solid fa-star pointer-events-none absolute -left-3 -top-3 text-2xl text-qupu-brand-yellow drop-shadow-sm" aria-hidden="true" />
                    <i className="fa-solid fa-star pointer-events-none absolute -right-3 -bottom-2 text-base text-qupu-brand-yellow/80" aria-hidden="true" />
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-base" style={{ color: result.unlockedBadge.colorHex }}>
                      <i className="fa-solid fa-trophy" aria-hidden="true" />
                    </span>
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        {result.unlockedBadge.familyName}
                      </div>
                      <div className="font-display text-base font-extrabold">
                        Tier {result.unlockedBadge.tier} · {result.unlockedBadge.tierName}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] bg-qupu-cream px-4 py-3 text-sm text-qupu-muted">
                    Belum ada badge yang terbuka dari skor ini. Coba lagi dengan hasil lebih tinggi.
                  </div>
                )}

                <div className="text-sm font-semibold text-qupu-brand-blue">
                  {result.unlockedBadge
                    ? result.isUpgrade
                      ? 'Badge naik tier — kerja bagus!'
                      : 'Badge untuk hasil ini sudah tersimpan.'
                    : 'Skor tetap tercatat di progres.'}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-5 py-3 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform hover:-translate-y-0.5"
                  >
                    <i className="fa-solid fa-gauge text-sm" aria-hidden="true" />
                    Lihat dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResult(null)
                      setScore(0)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-qupu-brand-orange bg-white px-5 py-2.5 font-display text-sm font-extrabold text-qupu-brand-orange transition-colors hover:bg-qupu-brand-orange hover:text-white"
                  >
                    <i className="fa-solid fa-rotate-left text-sm" aria-hidden="true" />
                    Coba skor lain
                  </button>
                </div>
              </div>
            )}
```

- [ ] **Step 2: Verify build**

```bash
npm run check
npm run lint
npm run build
```

Expected: pass.

- [ ] **Step 3: Visual check**

Submit a real score with an authenticated parent + active child. Confirm: result card replaces the form, big score percent in navy, badge tier chip in tier color with yellow stars overlapping, contextual message, two CTAs (navy "Lihat dashboard" + outline "Coba skor lain"). Click "Coba skor lain" — should reset to the input form with the slider at 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/VideoDetail.tsx
git commit -m "feat: add score result celebration view to VideoDetail"
```

---

## Task 14: Final verification + screenshots

**Files:**
- (no source changes; verification only)

- [ ] **Step 1: Full type + lint + build check**

```bash
npm run check
npm run lint
npm run build
```

Expected: all three pass with zero errors. Bundle size should be similar to or smaller than the current build (no new deps).

- [ ] **Step 2: End-to-end smoke walk**

```bash
npm run dev
```

Walk:
1. `/login` — confirm AuthCard look. Bad credentials show error inline.
2. `/register` — confirm AuthCard look (right mascot). Submit with valid fields → redirected to `/onboarding/child`.
3. `/onboarding/child` — confirm form inline (no modal). Submit → redirected to `/dashboard`.
4. `/videos` — confirm refined header + staggered grid. Search by title and by YouTube URL, confirm "Link YouTube terdeteksi" chip.
5. `/videos/:slug` (any video) — confirm player frame, description card, badge family card. Slide score → tier preview updates. Submit → result celebration. Click "Coba skor lain" → returns to slider state.
6. Log out and revisit `/videos/:slug` — score card shows the unauthenticated state with login/register CTAs.

- [ ] **Step 3: Mobile spot-check**

Open Chrome DevTools, switch to a mobile viewport (e.g. iPhone 12, 390×844). Repeat the smoke walk for `/login`, `/videos`, and `/videos/:slug`. Confirm cards stack cleanly, mascots in AuthCard scale down correctly, video catalog header collapses to single column, video detail right column drops below the player.

- [ ] **Step 4: Commit verification notes (if any code tweaks)**

If any visual fixes were needed during the smoke walk, commit them with a descriptive message. Otherwise, no commit needed.

```bash
git status
```

Expected: clean working tree if the previous tasks landed correctly.

---

## Self-review

**Spec coverage check:**

- Login redesign → Task 3 ✓
- Register redesign → Task 4 ✓
- OnboardingChild redesign → Task 6 (depends on Task 5) ✓
- AuthCard component → Task 2 ✓
- ChildForm extraction → Task 5 ✓
- Reveal extraction → Task 1 ✓
- Slider component → Task 7 ✓
- Videos catalog header refinement → Task 9 ✓
- VideoCard refresh → Task 8 ✓
- VideoDetail layout + player + description → Task 10 ✓
- VideoDetail badge family card → Task 11 ✓
- VideoDetail score input card with slider → Task 12 ✓
- VideoDetail result state → Task 13 ✓
- VideoDetail not-found state → Task 10 (handled in the redesigned file) ✓

All shared patterns from the spec (peach offset shadows, dashed orange borders, FontAwesome icons, navy/orange CTAs, slider with floating chip, brand color tokens, Reveal motion) are applied across the tasks.

No placeholders, TBDs, or "implement later" markers in the steps. Method/prop names (`addChild`, `setActiveChild`, `setChildren`, `score`, `setScore`, `result`, `previewTier`, `Slider`, `Reveal`, `AuthCard`, `ChildForm`, `ChildModal`) are consistent across all tasks.

Type signatures consistent: `Slider` props in Task 7 match consumption in Task 12; `AuthCard` props in Task 2 match usage in Tasks 3, 4, 6; `ChildForm` props in Task 5 match usage in Task 6 (and the modal wrapper retained from existing file).
