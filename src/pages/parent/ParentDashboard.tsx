// src/pages/parent/ParentDashboard.tsx
//
// The /parent surface — everything parent-facing lives here, OUTSIDE the kid
// AppShell (no bottom tab bar). PIN-locked via PinEntryGate; the unlocked
// flag is plain React state, so navigating away unmounts the page and
// re-locks it (never persisted). One scrolling page with anchor-chip nav:
// Profil Anak / Rapor Belajar / Statistik & Misi Harian / Pengaturan.
// Visually calmer than the kid surfaces: slate text on cream, denser copy,
// Fredoka kept for headings.
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import BackButton from '../../components/BackButton'
import useDocumentTitle from '../../hooks/useDocumentTitle'
import ChildrenManager from '../../components/me/ChildrenManager'
import PinEntryGate from '../../components/parent/PinEntryGate'
import SetPinModal from '../../components/parent/SetPinModal'
import DashboardPage from '../Dashboard'
import ReportPage from '../Report'

const NAV_SECTIONS = [
  { id: 'anak', label: 'Profil Anak', icon: 'fa-solid fa-children' },
  { id: 'rapor', label: 'Rapor', icon: 'fa-solid fa-chart-line' },
  { id: 'statistik', label: 'Statistik', icon: 'fa-solid fa-chart-pie' },
  { id: 'pengaturan', label: 'Pengaturan', icon: 'fa-solid fa-gear' },
] as const

export default function ParentDashboard() {
  useDocumentTitle('Orang Tua')
  const user = useAuthStore((state) => state.user)
  // Re-lock on every mount: state (not storage) by design.
  const [unlocked, setUnlocked] = useState(false)

  // Admins belong on the admin dashboard. Every OTHER authenticated role
  // (parent, student, teacher) owns this account and may enter — the kid
  // Profil no longer has logout/settings, so this is their only such surface.
  // The PIN gate below applies to all of them; the PIN API
  // (api/routes/users.ts /me/pin*) is role-agnostic, only authenticated.
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (!unlocked) {
    return <PinEntryGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className="min-h-screen bg-qupu-cream pb-16">
      <TopBar />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 pt-4">
        <section id="anak" className="scroll-mt-28">
          <SectionHeading icon="fa-solid fa-children" title="Profil Anak" />
          <div className="mt-3">
            <ChildrenManager />
          </div>
        </section>

        <section id="rapor" className="scroll-mt-28">
          <SectionHeading icon="fa-solid fa-chart-line" title="Rapor Belajar" />
          <div className="mt-3">
            <ReportPage embedded />
          </div>
        </section>

        <section id="statistik" className="scroll-mt-28">
          <SectionHeading icon="fa-solid fa-chart-pie" title="Statistik & Misi Harian" />
          {/* DashboardPage centers itself with self-center → flex parent. */}
          <div className="mt-3 flex flex-col">
            <DashboardPage embedded />
          </div>
        </section>

        <section id="pengaturan" className="scroll-mt-28">
          <SectionHeading icon="fa-solid fa-gear" title="Pengaturan" />
          <div className="mt-3">
            <SettingsCard />
          </div>
        </section>
      </div>
    </div>
  )
}

// Sticky top bar: back-to-kid-app link, title, anchor chips.
function TopBar() {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 border-b border-[#FFE3CC] bg-qupu-cream/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <BackButton variant="back" onClick={() => navigate('/belajar')} label="Kembali ke aplikasi anak" />
          <h1 className="inline-flex items-center gap-2 font-display text-base font-extrabold text-slate-800">
            <i className="fa-solid fa-user-shield text-sm text-qupu-brand-orange" aria-hidden="true" />
            Orang Tua
          </h1>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-0.5" aria-label="Bagian halaman">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[0.6875rem] font-bold text-slate-600 ring-1 ring-[#FFE3CC] transition-colors hover:text-qupu-brand-orange"
            >
              <i className={`${section.icon} text-[0.625rem]`} aria-hidden="true" />
              {section.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}

function SectionHeading({ icon, title }: { icon: string; title: string }) {
  return (
    <h2 className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-slate-800">
      <span className="flex h-8 w-8 items-center justify-center rounded-[0.7rem] bg-white text-sm text-qupu-brand-orange ring-1 ring-[#FFE3CC]">
        <i className={icon} aria-hidden="true" />
      </span>
      {title}
    </h2>
  )
}

// Pengaturan: account info, email-reminder toggle (moved from Me.tsx),
// Ubah PIN, Keluar.
function SettingsCard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showChangePin, setShowChangePin] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Akun</div>
      <h3 className="mt-1 font-display text-lg font-extrabold text-slate-800">{user?.name ?? 'Akun'}</h3>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{user?.email}</p>

      <div className="mt-4 flex flex-col gap-2">
        <NotifyEmailRow />
        {/* Anyone past the PIN gate has a PIN (the gate forces creation),
            and the PIN API is role-agnostic — so no role gate here. */}
        <SettingsRow
          onClick={() => setShowChangePin(true)}
          icon="fa-solid fa-key"
          iconBg="#E0762E"
          title="Ubah PIN"
          subtitle="Ganti PIN area orang tua"
        />
        <SettingsRow
          onClick={handleLogout}
          icon="fa-solid fa-right-from-bracket"
          iconBg="#E11D48"
          title="Keluar"
          subtitle="Keluar dari akun ini"
          danger
        />
      </div>

      {showChangePin && <SetPinModal mode="change" onClose={() => setShowChangePin(false)} />}
    </section>
  )
}

// Parent email-notification opt-out (P2.5), moved here from Me.tsx. Default
// ON (the DB default), so the switch renders enabled immediately and the GET
// only corrects it for parents who already opted out. The PUT is optimistic
// with rollback.
function NotifyEmailRow() {
  const [enabled, setEnabled] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .get('/users/me')
      .then((res) => {
        const value = res.data?.data?.notify_email
        if (!cancelled && typeof value === 'boolean') setEnabled(value)
      })
      .catch(() => {
        // Leave the default-on state; the toggle still works.
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleToggle() {
    if (busy) return
    const next = !enabled
    setEnabled(next)
    setBusy(true)
    try {
      await api.put('/users/me', { notify_email: next })
    } catch {
      setEnabled(!next) // roll back on failure
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5">
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.9rem] text-base text-white"
        style={{ backgroundColor: '#D97706' }}
      >
        <i className="fa-solid fa-envelope" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-display text-sm font-extrabold leading-tight text-slate-700">
          Email pengingat &amp; rangkuman mingguan
        </span>
        <span className="block text-[0.6875rem] font-semibold text-slate-500">
          Pengingat streak &amp; rangkuman belajar tiap Senin
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Email pengingat & rangkuman mingguan"
        onClick={handleToggle}
        disabled={busy}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          enabled ? 'bg-qupu-brand-orange' : 'bg-qupu-brand-blue/20'
        } ${busy ? 'opacity-60' : ''}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            enabled ? 'left-[1.375rem]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

interface SettingsRowProps {
  icon: string
  iconBg: string
  title: string
  subtitle: string
  onClick: () => void
  danger?: boolean
}

function SettingsRow({ icon, iconBg, title, subtitle, onClick, danger }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5 transition-transform active:translate-y-0.5"
    >
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.9rem] text-base text-white"
        style={{ backgroundColor: iconBg }}
      >
        <i className={icon} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={`block font-display text-sm font-extrabold leading-tight ${danger ? 'text-[#E11D48]' : 'text-slate-700'}`}>
          {title}
        </span>
        <span className="block text-[0.6875rem] font-semibold text-slate-500">{subtitle}</span>
      </span>
      <i className="fa-solid fa-chevron-right text-xs text-slate-400" aria-hidden="true" />
    </button>
  )
}
