// src/pages/Me.tsx
//
// Profil tab destination. Sections: account header, child profile management
// (switch active child / add a child), a Pengaturan menu (Rapor → /report,
// Statistik & Misi Harian → /dashboard, Keluar → logout), and the owned-items
// collection.
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import InventoryGrid from '../components/me/InventoryGrid'
import AvatarEditor from '../components/me/AvatarEditor'
import ChildrenManager from '../components/me/ChildrenManager'
import FamilyLeaderboard from '../components/me/FamilyLeaderboard'
import FamilyQuestCard from '../components/me/FamilyQuestCard'
import LevelDetail from '../components/me/LevelDetail'

export default function MePage() {
  useDocumentTitle('Profil')
  const { user, children, activeChildId, logout } = useAuthStore()
  const activeChild = children.find((child) => child.id === activeChildId) ?? null
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 sm:max-w-lg">
      <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Akun</div>
        <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue">{user?.name ?? 'Profil'}</h2>
        <p className="mt-1 text-xs font-medium text-qupu-muted">{user?.email}</p>
      </section>

      <ChildrenManager />

      {/* Family surfaces (P2.3) — both render nothing for accounts with
          fewer than 2 children. */}
      <FamilyLeaderboard />
      <FamilyQuestCard />

      {activeChild && <AvatarEditor child={activeChild} />}

      {activeChild && <LevelDetail childId={activeChild.id} />}

      <section className="rounded-[2rem] border-[3px] border-qupu-brand-blue/15 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
          Pengaturan
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <SettingsRow
            to="/badges"
            icon="fa-solid fa-medal"
            iconBg="#8A5BF0"
            title="Badge & pencapaian"
            subtitle="Lihat semua lencana yang terkumpul"
          />
          <SettingsRow
            to="/report"
            icon="fa-solid fa-chart-line"
            iconBg="#30598A"
            title="Rapor belajar"
            subtitle="Lihat progres & nilai lengkap"
          />
          <SettingsRow
            to="/dashboard"
            icon="fa-solid fa-chart-pie"
            iconBg="#0E7490"
            title="Statistik & Misi Harian"
            subtitle="Ringkasan belajar, kuis & misi harian"
          />
          <NotifyEmailRow />
          <SettingsRow
            onClick={handleLogout}
            icon="fa-solid fa-right-from-bracket"
            iconBg="#E11D48"
            title="Keluar"
            subtitle="Keluar dari akun ini"
            danger
          />
        </div>
      </section>

      <section id="koleksi" className="rounded-[2rem] border-[3px] border-qupu-brand-orange/40 bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1]">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">Koleksi saya</div>
        <h2 className="mt-1 font-display text-lg font-extrabold text-qupu-brand-blue">Item yang sudah dimiliki</h2>
        <div className="mt-3">
          {activeChildId ? (
            <InventoryGrid childId={activeChildId} />
          ) : (
            <p className="text-sm font-medium text-qupu-muted">Pilih profil anak dulu untuk melihat koleksi.</p>
          )}
        </div>
      </section>
    </div>
  )
}

// Parent email-notification opt-out (P2.5). Default ON (the DB default), so
// the switch renders enabled immediately and the GET only corrects it for
// parents who already opted out. The PUT is optimistic with rollback —
// matching the row layout of SettingsRow but with a switch instead of a
// chevron.
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
        <span className="block font-display text-sm font-extrabold leading-tight text-qupu-brand-blue">
          Email pengingat &amp; rangkuman mingguan
        </span>
        <span className="block text-[11px] font-semibold text-qupu-muted">
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
  to?: string
  onClick?: () => void
  danger?: boolean
}

function SettingsRow({ icon, iconBg, title, subtitle, to, onClick, danger }: SettingsRowProps) {
  const inner = (
    <>
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.9rem] text-base text-white"
        style={{ backgroundColor: iconBg }}
      >
        <i className={icon} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={`block font-display text-sm font-extrabold leading-tight ${danger ? 'text-[#E11D48]' : 'text-qupu-brand-blue'}`}>
          {title}
        </span>
        <span className="block text-[11px] font-semibold text-qupu-muted">{subtitle}</span>
      </span>
      <i className="fa-solid fa-chevron-right text-xs text-qupu-muted/60" aria-hidden="true" />
    </>
  )

  const className =
    'flex items-center gap-3 rounded-[1.25rem] bg-qupu-shell px-3 py-2.5 transition-transform active:translate-y-0.5'

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={`${className} w-full`}>
      {inner}
    </button>
  )
}
