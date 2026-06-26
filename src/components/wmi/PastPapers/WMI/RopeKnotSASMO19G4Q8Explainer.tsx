// SASMO-19-G4-Q8 — Rope knot explainer
// Walks through each option A–E, explaining which are unknots and why E is the
// genuine overhand knot (3 alternating crossings lock together).
// SSR-safe: no framer-motion, no Math.random, no Date.
// Imports rope figures from the illustration file (shared rendering).

import { useState } from 'react'
import RopeKnotSASMO19G4Q8Illustration, {
  RopeKnotSASMO19G4Q8Option,
} from './RopeKnotSASMO19G4Q8Illustration'
import steps from './ropeKnotSASMO19G4Q8Steps'

// ── Beat-control hook ─────────────────────────────────────────────────────────

function useBeat(max: number) {
  const [beat, setBeat] = useState(1)
  const prev = () => setBeat((b) => Math.max(1, b - 1))
  const next = () => setBeat((b) => Math.min(max, b + 1))
  return { beat, prev, next, atStart: beat === 1, atEnd: beat === max }
}

// ── Colours ───────────────────────────────────────────────────────────────────
const ACCENT   = '#F97316'
const ELIM_CLR = '#DC2626'
const OK_CLR   = '#16A34A'

// ── Fake choice shim (for re-using RopeKnotSASMO19G4Q8Option) ────────────────
function makeChoice(label: string) {
  return { label, text: `(gambar ${label})` }
}

// ── Explainer ─────────────────────────────────────────────────────────────────

export default function RopeKnotSASMO19G4Q8Explainer({
  lang = 'id',
}: {
  lang?: 'en' | 'id'
}) {
  const { beat, prev, next, atStart, atEnd } = useBeat(steps.length)
  const step = steps[beat - 1]

  const title = lang === 'en' ? step.title_en : step.title_id
  const body  = lang === 'en' ? step.body_en  : step.body_id

  const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-6">

      {/* ── All 5 options row ── */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {LABELS.map((label) => {
          const isHighlight = step.highlight === label
          const isEliminated = step.eliminated && isHighlight
          const isAnswer = label === 'E' && beat === steps.length

          let borderColor = '#E5E7EB'
          if (isEliminated) borderColor = ELIM_CLR
          else if (isAnswer) borderColor = OK_CLR
          else if (isHighlight) borderColor = ACCENT

          return (
            <div
              key={label}
              className="flex flex-col items-center gap-1"
              style={{
                borderRadius: 10,
                border: `2px solid ${borderColor}`,
                padding: 4,
                opacity: isHighlight || !step.highlight ? 1 : 0.4,
                transition: 'opacity 0.2s, border-color 0.2s',
              }}
            >
              <RopeKnotSASMO19G4Q8Option choice={makeChoice(label)} />
              <span
                className="text-xs font-bold"
                style={{
                  color: isEliminated ? ELIM_CLR : isAnswer ? OK_CLR : '#374151',
                }}
              >
                {label}
                {isEliminated && ' ✗'}
                {isAnswer && ' ✓'}
              </span>
            </div>
          )
        })}
      </div>

      {/* ── Step text ── */}
      <div
        className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4"
        style={{ minHeight: 100 }}
      >
        <p className="mb-1 text-sm font-bold text-amber-900">{title}</p>
        <p className="text-sm leading-relaxed text-amber-800">{body}</p>
      </div>

      {/* ── Beat counter ── */}
      <p className="text-xs text-gray-400">
        {beat} / {steps.length}
      </p>

      {/* ── Navigation ── */}
      <div className="flex gap-3">
        <button
          onClick={prev}
          disabled={atStart}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition"
          style={{
            background: atStart ? '#E5E7EB' : ACCENT,
            color: atStart ? '#9CA3AF' : 'white',
            cursor: atStart ? 'default' : 'pointer',
          }}
        >
          {lang === 'en' ? '← Back' : '← Sebelumnya'}
        </button>
        <button
          onClick={next}
          disabled={atEnd}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition"
          style={{
            background: atEnd ? '#E5E7EB' : ACCENT,
            color: atEnd ? '#9CA3AF' : 'white',
            cursor: atEnd ? 'default' : 'pointer',
          }}
        >
          {lang === 'en' ? 'Next →' : 'Selanjutnya →'}
        </button>
      </div>
    </div>
  )
}
