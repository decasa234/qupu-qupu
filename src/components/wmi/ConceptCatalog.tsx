// src/components/wmi/ConceptCatalog.tsx
//
// Lists every available concept for the WMI course, split into "Belum dikuasai"
// (not started + in progress) and "Sudah dikuasai" (mastered). Each row is a
// link that drills THAT specific concept, and shows a progress bar toward the
// mastery target so kids see what's left to learn.
import { Link } from 'react-router-dom'
import type { WmiConceptProgress, WmiConceptProgressSummary } from '../../types/wmi'

export default function ConceptCatalog({ summary }: { summary: WmiConceptProgressSummary }) {
  const mastered = summary.concepts.filter((c) => c.status === 'mastered')
  // Not-yet-cleared: in-progress first (closest to done), then untouched.
  const remaining = summary.concepts
    .filter((c) => c.status !== 'mastered')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'in_progress' ? -1 : 1
      return b.progress - a.progress
    })

  return (
    <div className="space-y-5">
      <Group
        title="Belum dikuasai"
        icon="fa-solid fa-seedling"
        count={remaining.length}
        emptyText="Semua konsep sudah dikuasai. Hebat!"
        concepts={remaining}
        masteryTarget={summary.masteryTarget}
      />
      <Group
        title="Sudah dikuasai"
        icon="fa-solid fa-circle-check"
        count={mastered.length}
        emptyText="Belum ada konsep yang dikuasai — ayo mulai!"
        concepts={mastered}
        masteryTarget={summary.masteryTarget}
      />
    </div>
  )
}

function Group({
  title,
  icon,
  count,
  emptyText,
  concepts,
  masteryTarget,
}: {
  title: string
  icon: string
  count: number
  emptyText: string
  concepts: WmiConceptProgress[]
  masteryTarget: number
}) {
  return (
    <section>
      <div className="flex items-center gap-2 px-1">
        <i className={`${icon} text-sm text-qupu-brand-orange`} aria-hidden="true" />
        <h3 className="font-display text-sm font-black uppercase tracking-[0.12em] text-qupu-brand-blue">
          {title}
        </h3>
        <span className="rounded-full bg-qupu-cream px-2 py-0.5 text-[11px] font-black text-qupu-brand-blue">
          {count}
        </span>
      </div>
      {concepts.length === 0 ? (
        <p className="mt-2 rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
          {emptyText}
        </p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {concepts.map((concept) => (
            <ConceptRow key={concept.slug} concept={concept} masteryTarget={masteryTarget} />
          ))}
        </div>
      )}
    </section>
  )
}

function ConceptRow({
  concept,
  masteryTarget,
}: {
  concept: WmiConceptProgress
  masteryTarget: number
}) {
  const mastered = concept.status === 'mastered'
  const pct = Math.round(concept.progress * 100)

  return (
    <Link
      to={`/latihan/wmi/konsep?concept=${concept.slug}`}
      className="block rounded-[1.25rem] bg-white p-3.5 shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_0_#FFD3B1]"
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.9rem] text-base text-white ${
            mastered
              ? 'bg-[#58A700]'
              : concept.status === 'in_progress'
                ? 'bg-qupu-brand-orange'
                : 'bg-qupu-brand-blue/30'
          }`}
          aria-hidden="true"
        >
          <i
            className={
              mastered
                ? 'fa-solid fa-circle-check'
                : concept.status === 'in_progress'
                  ? 'fa-solid fa-hourglass-half'
                  : 'fa-solid fa-hourglass-start'
            }
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate font-display text-sm font-extrabold text-qupu-brand-blue">
              {concept.nameId}
            </h4>
            {concept.grades.length > 0 && (
              <span className="flex-shrink-0 rounded-full bg-qupu-cream px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-qupu-brand-blue/70">
                Gr {concept.grades.join(',')}
              </span>
            )}
          </div>
          {concept.descriptionId && (
            <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-qupu-muted">
              {concept.descriptionId}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              mastered ? 'bg-[#E3F4D7] text-[#3F7A00]' : 'bg-qupu-cream text-qupu-brand-orange'
            }`}
          >
            {mastered ? 'Dikuasai' : `${concept.correct}/${masteryTarget}`}
          </span>
          <i className="fa-solid fa-chevron-right text-[10px] text-qupu-muted/50" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-qupu-cream">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            mastered ? 'bg-[#58A700]' : 'bg-qupu-brand-orange'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  )
}
