import type { ReactNode } from 'react'
import { Input } from './ui'

/*
 * Shared badge-range editor. The row grid (R-chip + Min/Max/Badge + delete) was
 * previously copy-pasted verbatim into AdminVideos and AdminSubjects; this is the
 * single implementation. The differing header content (subject swatch, "Apply
 * template" button, etc.) is passed in via `leading` / `headerActions`.
 */

export interface EditableBadgeRange {
  minCorrect: number
  maxCorrect: number | null
  badgeCount: number
}

export function BadgeRangeEditor({
  ranges,
  onAdd,
  onRemove,
  onUpdate,
  title = 'Badge ranges',
  subtitle,
  leading,
  headerActions,
  emptyHint = 'Belum ada range.',
  unlimitedMaxHint = false,
}: {
  ranges: EditableBadgeRange[]
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, patch: Partial<EditableBadgeRange>) => void
  title?: string
  subtitle?: ReactNode
  leading?: ReactNode
  headerActions?: ReactNode
  emptyHint?: string
  unlimitedMaxHint?: boolean
}) {
  return (
    <div className="rounded-xl border border-admin-line bg-admin-sunk p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {leading}
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-admin-ink">{title}</div>
            {subtitle && <div className="truncate text-[11px] text-admin-muted">{subtitle}</div>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {headerActions}
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg border border-admin-edge bg-white px-2.5 py-1 text-xs font-semibold text-admin-ink transition-colors hover:bg-admin-sunk"
          >
            + Range
          </button>
        </div>
      </div>

      {ranges.length === 0 ? (
        <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-admin-muted">{emptyHint}</div>
      ) : (
        <div className="mt-2 grid gap-2">
          {/* Column headers */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 px-2">
            <span className="w-9" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-admin-muted">Min</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-admin-muted">Maks</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-admin-muted">Badge</span>
            <span className="w-9" aria-hidden="true" />
          </div>
          {ranges.map((range, index) => (
            <div
              key={index}
              className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 rounded-lg bg-white p-2"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-admin-sunk font-mono text-[10px] font-bold uppercase text-admin-muted">
                R{index + 1}
              </span>
              <Input
                type="number"
                aria-label={`Range ${index + 1} min`}
                value={String(range.minCorrect)}
                onChange={(e) => onUpdate(index, { minCorrect: Number(e.target.value) })}
              />
              <Input
                type="number"
                aria-label={`Range ${index + 1} maks`}
                title={unlimitedMaxHint && index === ranges.length - 1 ? 'Kosong = tanpa batas' : undefined}
                value={range.maxCorrect === null ? '' : String(range.maxCorrect)}
                onChange={(e) =>
                  onUpdate(index, { maxCorrect: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
              <Input
                type="number"
                aria-label={`Range ${index + 1} badge`}
                value={String(range.badgeCount)}
                onChange={(e) => onUpdate(index, { badgeCount: Number(e.target.value) })}
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label="Hapus range"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 transition-colors hover:bg-red-50"
              >
                <i className="fa-solid fa-trash text-xs" aria-hidden="true" />
              </button>
            </div>
          ))}
          {unlimitedMaxHint && (
            <p className="text-[11px] text-admin-faint">Kosong di baris terakhir = tanpa batas.</p>
          )}
        </div>
      )}
    </div>
  )
}
