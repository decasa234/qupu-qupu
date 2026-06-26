// SASMO-19-G3-Q7 — animated explainer for the rocket mirror image question.
//
// Animation flow:
//   0. Show the reference rocket (intro).
//   1. Draw the mirror axis.
//   2. Reveal Option A (the correct mirror) beside the reference.
//   3. Check each option A–E; mark A as correct, B–E as wrong.
//   4. Crown A as the answer.
//
// Adapted from PencilMirrorSASMO19G2Q12Explainer (same question structure).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import RocketMirrorSASMO19G3Q7Illustration, {
  RocketMirrorSASMO19G3Q7Option,
} from './RocketMirrorSASMO19G3Q7Illustration'
import { buildRocketMirrorSteps } from './rocketMirrorSASMO19G3Q7Steps'

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const
const GREEN  = '#10B981'
const RED    = '#EF4444'
const GOLD   = '#F59E0B'

export default function RocketMirrorSASMO19G3Q7Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildRocketMirrorSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const fakeChoice = (label: string) => ({
    label,
    text: label === 'A' ? 'Bayangan cermin' : `Pilihan ${label}`,
  })

  return (
    <div
      className="mx-auto w-full max-w-[520px] select-none"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: temukan bayangan cermin roket — jawabannya A, kiri-kanan bertukar.'
          : 'Explainer: find the mirror image of the rocket — answer A, left-right swapped.'
      }
    >
      <div className="flex flex-col items-center gap-4">

        {/* ── Main figure area ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          {/* Reference (always visible) */}
          <div className="flex flex-col items-center gap-1">
            <RocketMirrorSASMO19G3Q7Illustration />
            <span className="text-xs text-gray-500">
              {lang === 'id' ? 'Gambar asli' : 'Original'}
            </span>
          </div>

          {/* Mirror axis (axis + flip phases) */}
          {(beat.showAxis || beat.showFlip) && (
            <svg width="16" height="180" aria-hidden="true">
              <line
                x1="8" y1="10" x2="8" y2="170"
                stroke="#6B7280" strokeWidth={2} strokeDasharray="5,3"
              />
              <text x="8" y="6" textAnchor="middle" fontSize="9" fill="#6B7280">
                {lang === 'id' ? 'cermin' : 'mirror'}
              </text>
            </svg>
          )}

          {/* Mirror image: Option A (flip + result phases) */}
          {(beat.showFlip || beat.phase === 'result') && (
            <div className="flex flex-col items-center gap-1">
              <RocketMirrorSASMO19G3Q7Option choice={fakeChoice('A')} />
              <span className="text-xs font-semibold text-emerald-600">A ✓</span>
            </div>
          )}
        </div>

        {/* ── Option grid (check phase) ─────────────────────────────────────── */}
        {beat.phase === 'check' && (
          <div className="flex flex-wrap justify-center gap-2">
            {LABELS.map((label) => {
              const isActive  = beat.checkLabel === label
              const isCorrect = isActive && beat.checkPass === true
              const isDimmed  = !isActive && beat.checkLabel !== null

              return (
                <div
                  key={label}
                  style={{
                    opacity:    isDimmed ? 0.35 : 1,
                    outline:    isActive ? `3px solid ${isCorrect ? GREEN : RED}` : 'none',
                    borderRadius: 8,
                    padding:    2,
                    transition: 'opacity 0.3s, outline 0.2s',
                  }}
                >
                  <RocketMirrorSASMO19G3Q7Option choice={fakeChoice(label)} />
                </div>
              )
            })}
          </div>
        )}

        {/* ── Result crown ─────────────────────────────────────────────────── */}
        {beat.phase === 'result' && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2"
            style={{ background: '#FEF3C7', border: `2px solid ${GOLD}` }}
          >
            <span style={{ fontSize: 20 }}>A</span>
            <span className="text-sm font-semibold" style={{ color: '#92400E' }}>
              {lang === 'id'
                ? 'Bayangan cermin kiri-kanan'
                : 'Left-right mirror image'}
            </span>
          </div>
        )}

        {/* ── Caption ─────────────────────────────────────────────────────── */}
        <p className="text-center text-sm text-gray-700 px-2">{beat.caption}</p>
      </div>
    </div>
  )
}
