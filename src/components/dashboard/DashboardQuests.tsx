import { Link } from 'react-router-dom'
import type { DashboardQuest } from '../../lib/dashboardData'

interface Props {
  quests: DashboardQuest[]
  childName: string
}

const QUEST_ICON: Record<string, string> = {
  completion: 'fa-solid fa-bolt',
  high_score: 'fa-solid fa-star',
  subject_focus: 'fa-solid fa-bullseye',
  improvement: 'fa-solid fa-arrow-up',
  streak: 'fa-solid fa-fire',
}

const QUEST_ACCENT: Record<string, string> = {
  completion: 'bg-qupu-brand-blue',
  high_score: 'bg-qupu-brand-yellow text-qupu-brand-blue',
  subject_focus: 'bg-qupu-brand-orange',
  improvement: 'bg-emerald-500',
  streak: 'bg-rose-500',
}

export default function DashboardQuests({ quests, childName }: Props) {
  if (quests.length === 0) {
    return (
      <section className="rounded-[2rem] border-[3px] border-dashed border-qupu-brand-blue/30 bg-white p-6 shadow-[5px_6px_0_0_#FFD3B1] text-center">
        <div className="text-2xl" aria-hidden="true">🎯</div>
        <h3 className="mt-2 font-display text-lg font-extrabold text-qupu-brand-blue">
          Quest harian dimulai dari quiz pertama
        </h3>
        <p className="mt-1 text-sm font-medium text-qupu-muted">
          Selesaikan quiz apa saja, lalu {childName} dapat 3 quest harian otomatis.
        </p>
        <Link
          to="/videos"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2 font-display text-sm font-extrabold text-white shadow-subscribe transition-transform duration-150 hover:-translate-y-0.5"
        >
          Pilih video <span aria-hidden="true">→</span>
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-qupu-brand-orange">
            Quest hari ini
          </div>
          <h2 className="mt-1 font-display text-xl font-extrabold text-qupu-brand-blue sm:text-2xl">
            Selesaikan {quests.length} quest untuk {childName}
          </h2>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {quests.map((quest) => {
          const iconClass = QUEST_ICON[quest.questType] ?? 'fa-solid fa-flag'
          const accent = QUEST_ACCENT[quest.questType] ?? 'bg-qupu-brand-blue'
          const isCompleted = quest.status === 'completed' || quest.status === 'claimed'
          const pct = Math.min(100, Math.round((quest.progressValue / Math.max(1, quest.targetValue)) * 100))
          return (
            <article
              key={quest.id}
              className={`relative flex flex-col rounded-[2rem] border-[3px] bg-white p-5 shadow-[5px_6px_0_0_#FFD3B1] ${
                isCompleted ? 'border-emerald-400/70' : 'border-qupu-peach'
              }`}
            >
              {isCompleted ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 font-display text-xs font-extrabold text-white shadow-soft">
                  <i className="fa-solid fa-check" aria-hidden="true" />
                  Selesai
                </span>
              ) : null}

              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white shadow-soft ${accent}`}
                  aria-hidden="true"
                >
                  <i className={iconClass} />
                </span>
                <h3 className="font-display text-base font-bold leading-snug text-qupu-brand-blue sm:text-lg">
                  {quest.title}
                </h3>
              </div>

              <p className="mt-2 text-xs font-medium leading-relaxed text-qupu-muted sm:text-sm">
                {quest.description}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-qupu-muted">
                  <span>
                    {quest.progressValue} / {quest.targetValue}
                  </span>
                  <span className="rounded-full bg-qupu-shell px-2 py-0.5 text-qupu-brand-blue">
                    +{quest.xpReward} XP
                  </span>
                </div>
                <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-qupu-peach bg-white">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-qupu-brand-orange'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
