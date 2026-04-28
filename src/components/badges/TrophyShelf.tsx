import type { SubjectBadgeGroup } from '../../types'
import BadgeMedallion from './BadgeMedallion'

const PREDIKAT_FROM_RATIO = (earned: number, total: number) => {
  if (total === 0)
    return { label: 'Belum Ada', bgClass: 'bg-slate-200', textClass: 'text-slate-600' }
  const ratio = earned / total
  if (ratio >= 0.75)
    return { label: 'Sangat Baik', bgClass: 'bg-emerald-500', textClass: 'text-white' }
  if (ratio >= 0.5) return { label: 'Baik', bgClass: 'bg-blue-500', textClass: 'text-white' }
  if (ratio >= 0.25) return { label: 'Cukup', bgClass: 'bg-amber-500', textClass: 'text-white' }
  if (ratio > 0) return { label: 'Mulai', bgClass: 'bg-orange-500', textClass: 'text-white' }
  return { label: 'Belum Mulai', bgClass: 'bg-slate-200', textClass: 'text-slate-600' }
}

export default function TrophyShelf({ group }: { group: SubjectBadgeGroup }) {
  const earnedCount = group.unlocks.reduce((acc, u) => acc + u.badgeCount, 0)
  const lockedCount = Math.max(0, group.totalBadges - earnedCount)
  const chip = PREDIKAT_FROM_RATIO(earnedCount, group.totalBadges)

  return (
    <section
      className="rounded-2xl border-[3px] bg-white p-3 shadow-[5px_6px_0_0_#FFD3B1]"
      style={{ borderColor: group.colorHex }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded" style={{ backgroundColor: group.colorHex }} />
          <span className="font-display text-base font-extrabold text-qupu-brand-blue">
            {group.name}
          </span>
          <span className="text-[10px] font-bold text-qupu-muted">
            {earnedCount} / {group.totalBadges} badge
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.08em] ${chip.bgClass} ${chip.textClass}`}
        >
          {chip.label}
        </span>
      </div>

      {group.unlocks.length === 0 && lockedCount === 0 ? (
        <p className="mt-3 text-xs font-medium text-qupu-muted">
          Belum ada video di subject ini. Cek halaman Video untuk yang baru.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {group.unlocks.map((u) => (
            <BadgeMedallion
              key={u.videoId}
              state="earned"
              label={u.videoTitle}
              colorHex={group.colorHex}
              href={`/videos/${u.videoSlug}`}
              badgeCount={u.badgeCount}
            />
          ))}
          {lockedCount > 0 ? (
            <BadgeMedallion state="locked" label={`+${lockedCount} badge lagi`} />
          ) : null}
        </div>
      )}
    </section>
  )
}
