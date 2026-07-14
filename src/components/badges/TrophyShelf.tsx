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

const MAX_PER_ROW = 15
const MIN_COLS = 5

// Map a subject name/slug keyword to one of the landing-page mascot images.
// Returns null when no good match — caller renders a small color dot fallback.
function getSubjectMascot(name: string, slug: string): string | null {
  const haystack = `${name} ${slug}`.toLowerCase()
  if (/matem|aljab|hitung|angka|math/.test(haystack)) return '/category-matematika.png'
  if (/litera|baca|lagu|huruf|abjad/.test(haystack)) return '/category-literasi.png'
  if (/tebak|gambar/.test(haystack)) return '/category-tebak-gambar.png'
  if (/odd|one[\s-]?out/.test(haystack)) return '/category-odd-one-out.png'
  if (/pengetahuan|umum|sains|dunia/.test(haystack)) return '/category-pengetahuan.png'
  return null
}

export default function TrophyShelf({ group }: { group: SubjectBadgeGroup }) {
  const earnedCount = group.unlocks.reduce((acc, u) => acc + u.badgeCount, 0)
  const lockedCount = Math.max(0, group.totalBadges - earnedCount)
  const chip = PREDIKAT_FROM_RATIO(earnedCount, group.totalBadges)
  const mascot = getSubjectMascot(group.name, group.slug)

  const tileCount = group.unlocks.length + (lockedCount > 0 ? 1 : 0)
  // Items grow to fill the row when there are few; cap at MAX_PER_ROW so the
  // 16th tile wraps to a second row instead of shrinking everything further.
  // MIN_COLS keeps tiles compact so a card with 2 tiles doesn't render
  // jumbo-sized badges and stretch the card height.
  const gridCols = Math.min(MAX_PER_ROW, Math.max(MIN_COLS, tileCount))

  // Pastel bg derived from subject color (very faint tint via 1A alpha = ~10%).
  // Border uses 70% alpha to keep the dashed line lively but not screaming.
  const borderColor = `${group.colorHex}B3`
  const tintTop = `${group.colorHex}26`
  const tintBottom = `${group.colorHex}0D`

  return (
    <section
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border-[3px] border-dashed p-4 shadow-[5px_6px_0_0_#FFD3B1] transition-all duration-200 hover:-translate-y-1"
      style={{
        borderColor,
        backgroundImage: `linear-gradient(160deg, ${tintTop} 0%, ${tintBottom} 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {mascot ? (
            <img
              src={mascot}
              alt=""
              draggable={false}
              className="h-12 w-12 shrink-0 select-none object-contain"
            />
          ) : (
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white"
              style={{ backgroundColor: group.colorHex }}
            />
          )}
          <div>
            <div className="font-display text-base font-extrabold leading-tight text-qupu-brand-blue">
              {group.name}
            </div>
            <div className="text-[0.625rem] font-bold uppercase tracking-[0.1em] text-qupu-muted">
              {earnedCount} / {group.totalBadges} badge
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-extrabold uppercase tracking-[0.08em] ${chip.bgClass} ${chip.textClass}`}
        >
          {chip.label}
        </span>
      </div>

      {group.unlocks.length === 0 && lockedCount === 0 ? (
        <p className="mt-4 text-xs font-medium text-qupu-muted">
          Belum ada video di subject ini. Cek halaman Video untuk yang baru.
        </p>
      ) : (
        <div
          className="mt-3 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
        >
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
            <BadgeMedallion state="locked" label={`+${lockedCount} lagi`} />
          ) : null}
        </div>
      )}
    </section>
  )
}
