// src/components/wmi/ConceptCatalog.tsx
//
// Concept catalog for the WMI course. Instead of one long vertical list, it
// segments concepts into horizontal-scroll rows to keep the page short:
//   1. "Latih dulu"     — not-yet-mastered, weakest first (fewest correct, most
//                          struggle) so kids train where they're weakest.
//   2. "Sudah dikuasai" — mastered concepts.
// Each tile links to a drill of that specific concept.
import { Link } from 'react-router-dom'
import type { WmiConceptProgress, WmiConceptProgressSummary } from '../../types/wmi'

export default function ConceptCatalog({ summary }: { summary: WmiConceptProgressSummary }) {
  const mastered = summary.concepts.filter((c) => c.status === 'mastered')

  // Weakest-first: fewest correct answers first; among ties, the concept tried
  // more (more struggle) comes first.
  const toPractice = summary.concepts
    .filter((c) => c.status !== 'mastered')
    .sort((a, b) => (a.correct !== b.correct ? a.correct - b.correct : b.attempts - a.attempts))

  return (
    <div className="space-y-5">
      <Segment
        title="Latih dulu"
        subtitle="Mulai dari yang paling perlu dilatih."
        icon="fa-solid fa-bolt"
        count={toPractice.length}
        emptyText="Semua konsep sudah dikuasai. Hebat!"
        concepts={toPractice}
        masteryTarget={summary.masteryTarget}
      />
      <Segment
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

function Segment({
  title,
  subtitle,
  icon,
  count,
  emptyText,
  concepts,
  masteryTarget,
}: {
  title: string
  subtitle?: string
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
      {subtitle && <p className="mt-0.5 px-1 text-[11px] font-semibold text-qupu-muted">{subtitle}</p>}

      {concepts.length === 0 ? (
        <p className="mt-2 rounded-[1.25rem] bg-qupu-shell px-4 py-3 text-xs font-semibold text-qupu-muted">
          {emptyText}
        </p>
      ) : (
        <div className="-mx-1 mt-3 flex snap-x gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {concepts.map((concept) => (
            <ConceptTile key={concept.slug} concept={concept} masteryTarget={masteryTarget} />
          ))}
        </div>
      )}
    </section>
  )
}

function ConceptTile({
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
      className="flex w-[150px] flex-shrink-0 snap-start flex-col rounded-[1.25rem] bg-white p-3 shadow-[0_3px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform active:translate-y-0.5 active:shadow-[0_1px_0_0_#FFD3B1]"
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-[0.8rem] text-base text-white ${
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
        <span
          className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
            mastered ? 'bg-[#E3F4D7] text-[#3F7A00]' : 'bg-qupu-cream text-qupu-brand-orange'
          }`}
        >
          {mastered ? 'Dikuasai' : `${concept.correct}/${masteryTarget}`}
        </span>
      </div>

      <h4 className="mt-2 line-clamp-2 min-h-[2.3em] font-display text-[13px] font-extrabold leading-tight text-qupu-brand-blue">
        {concept.nameId}
      </h4>

      {concept.grades.length > 0 && (
        <span className="mt-1 inline-flex w-fit rounded-full bg-qupu-cream px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-qupu-brand-blue/70">
          Gr {concept.grades.join(',')}
        </span>
      )}

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-qupu-cream">
        <div
          className={`h-full rounded-full ${mastered ? 'bg-[#58A700]' : 'bg-qupu-brand-orange'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  )
}
