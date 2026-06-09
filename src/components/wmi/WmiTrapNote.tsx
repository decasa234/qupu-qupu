import type { BreakdownTrap } from '../../types/wmi'

type Lang = 'en' | 'id'

// A small "watch out" note shown after the answer is revealed, surfacing the
// question-designer's trap: the tempting wrong answer and why it fails.
export default function WmiTrapNote({ trap, lang }: { trap: BreakdownTrap; lang: Lang }) {
  const why = lang === 'id' ? trap.why_id : trap.why_en
  const label = lang === 'id' ? 'Hati-hati' : 'Watch out'
  return (
    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
      <i className="fa-solid fa-triangle-exclamation mt-0.5 text-amber-500" aria-hidden="true" />
      <div className="text-sm">
        <span className="font-display font-extrabold text-amber-700">{label}: </span>
        <span className="text-amber-900">
          {why} <span className="font-bold">({trap.wrong})</span>
        </span>
      </div>
    </div>
  )
}
