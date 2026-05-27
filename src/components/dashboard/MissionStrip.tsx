// src/components/dashboard/MissionStrip.tsx
//
// "Misi hari ini" — 3 daily quests. Slot 1 (first not-yet-completed) renders
// as a chunky card with a Start CTA, visible coin + XP rewards, progress bar.
// Slots 2 + 3 render as dimmed mini-cards. When all three are completed,
// shows a single "done for today" card.
import { Link } from 'react-router-dom'
import type { DashboardQuest } from '../../lib/dashboardData'

interface Props {
  quests: DashboardQuest[]
  childName: string
}

function isOpen(q: DashboardQuest): boolean {
  return q.status === 'active'
}

export default function MissionStrip({ quests, childName }: Props) {
  if (quests.length === 0) {
    return (
      <section className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-blue/30 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1]">
        <i className="fa-solid fa-bullseye text-3xl text-qupu-brand-orange" aria-hidden="true" />
        <h3 className="mt-2 font-display text-lg font-extrabold text-qupu-brand-blue">
          Mulai 1 quiz untuk membuka misi
        </h3>
        <p className="mt-1 text-sm font-medium text-qupu-muted">
          {childName} dapat 3 misi harian setelah quiz pertama.
        </p>
        <Link
          to="/videos"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2 font-display text-sm font-extrabold text-white shadow-subscribe"
        >
          <i className="fa-solid fa-play" aria-hidden="true" /> Pilih video
        </Link>
      </section>
    )
  }

  const active = quests.find(isOpen) ?? null
  const others = quests.filter((q) => q.id !== active?.id)
  const allDone = active === null

  return (
    <section className="space-y-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
        Misi hari ini
      </div>

      {allDone ? (
        <div className="rounded-[2rem] border-[3px] border-emerald-400/70 bg-white p-6 text-center shadow-[5px_6px_0_0_#FFD3B1]">
          <i className="fa-solid fa-circle-check text-3xl text-emerald-500" aria-hidden="true" />
          <h3 className="mt-2 font-display text-lg font-extrabold text-qupu-brand-blue">
            Semua misi selesai — kembali besok!
          </h3>
        </div>
      ) : (
        <ActiveCard quest={active!} />
      )}

      {others.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {others.slice(0, 2).map((q) => (
            <MiniCard key={q.id} quest={q} />
          ))}
        </div>
      )}
    </section>
  )
}

function ActiveCard({ quest }: { quest: DashboardQuest }) {
  const pct = Math.min(100, Math.round((quest.progressValue / Math.max(1, quest.targetValue)) * 100))
  return (
    <article className="rounded-[2rem] border-[3px] border-qupu-brand-orange bg-gradient-to-br from-white to-qupu-peach/30 p-5 shadow-[5px_6px_0_0_#FFD3B1]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-coins" aria-hidden="true" /> +{quest.coinReward ?? 0} ·
          <i className="fa-solid fa-bolt" aria-hidden="true" /> +{quest.xpReward} XP
        </span>
        <span className="font-display text-xs font-extrabold text-qupu-muted">
          {quest.progressValue} / {quest.targetValue}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-extrabold text-qupu-brand-blue">{quest.title}</h3>
      <p className="mt-1 text-sm font-medium text-qupu-muted">{quest.description}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-qupu-brand-orange" style={{ width: `${pct}%` }} />
      </div>
      <Link
        to="/videos"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
      >
        <i className="fa-solid fa-play" aria-hidden="true" /> Mulai sekarang
      </Link>
    </article>
  )
}

function MiniCard({ quest }: { quest: DashboardQuest }) {
  const completed = quest.status !== 'active'
  return (
    <article
      className={`rounded-[1.25rem] border-2 border-qupu-peach bg-white/85 p-3 text-xs ${
        completed ? 'opacity-60' : 'opacity-80'
      }`}
    >
      <strong className="block font-display text-sm text-qupu-brand-blue">{quest.title}</strong>
      <div className="mt-1 text-qupu-muted">
        {quest.progressValue} / {quest.targetValue}
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-qupu-brand-yellow">
        <i className="fa-solid fa-coins" aria-hidden="true" /> +{quest.coinReward ?? 0}
      </div>
    </article>
  )
}
