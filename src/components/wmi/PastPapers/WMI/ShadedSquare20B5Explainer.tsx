// ShadedSquare20B5Explainer.tsx — SEAMO-20-B-Q5
//
// Animated step-by-step explainer for the "two shaded regions x and y" question.
// Each beat highlights one of the shaded regions and reveals the algebra.
//
// Uses the ShadedSquareFigure primitive from the illustration file.
// Animation is driven by `useBeatControl` (standard house pattern).
// SSR-safe: no random, no Date.

import { ShadedSquareFigure } from './ShadedSquare20B5Illustration'
import steps from './shadedSquare20B5Steps'

// ── Beat control hook (minimal, SSR-safe) ────────────────────────────────────
// Copied from the house pattern (FlagpoleCastle22Explainer, etc.)
import { useState, useCallback } from 'react'

function useBeatControl(total: number) {
  const [beat, setBeat] = useState(0)
  const next = useCallback(() => setBeat((b) => Math.min(b + 1, total - 1)), [total])
  const prev = useCallback(() => setBeat((b) => Math.max(b - 1, 0)), [])
  const reset = useCallback(() => setBeat(0), [])
  return { beat, next, prev, reset, isFirst: beat === 0, isLast: beat === total - 1 }
}

// ── Explainer component ──────────────────────────────────────────────────────

interface Props {
  lang?: 'en' | 'id'
}

export default function ShadedSquare20B5Explainer({ lang = 'id' }: Props) {
  const { beat, next, prev, isFirst, isLast } = useBeatControl(steps.length)
  const step = steps[beat]

  const title = lang === 'en' ? step.title_en : step.title_id
  const body  = lang === 'en' ? step.body_en  : step.body_id

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Figure — updates highlight and a-label per beat */}
      <ShadedSquareFigure
        highlightRegion={step.highlight}
        showAValue={step.showAValue}
      />

      {/* Step text */}
      <div className="w-full max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="mb-1 text-sm font-bold text-amber-800">{title}</p>
        <p className="whitespace-pre-line text-sm text-gray-700">{body}</p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={prev}
          disabled={isFirst}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-40"
        >
          ← Prev
        </button>
        <span className="text-xs text-gray-500">
          {beat + 1} / {steps.length}
        </span>
        <button
          onClick={next}
          disabled={isLast}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
