// Post-answer explainer for WMI-24P3A-Q17 (2024 Grade-3 Semifinal).
//
// Teaches "spot the max rate per square, then scale up":
//   1. One square -> 4 right angles (corners).
//   2. Two squares crossing -> at most 16.
//   3. 16 for 2 squares = 16 per square at the most.
//   4. Four squares, every pair crossing -> 4 x 16.
//   5. = 64 right angles -> answer E.
//
// Reuses the illustrator's <Square> primitive so the scene matches the static
// figure. A small badge shows the running maximum. SSR-safe + deterministic.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ANSWER_MAX, Q17_VIEW_W, Square } from './P24G3Q17Illustration'
import { buildP24G3Q17Steps } from './p24G3Q17Steps'

const INK = '#374151'
const GREEN = '#10B981'
const GREENS = ['#A7D7B0', '#9BCFA6', '#8AC79A', '#7BBF8E']

const VIEW_H = 210
const S = 78

// Top-left corners for up to four squares, fanned so every pair overlaps.
const POS: Array<[number, number]> = [
  [Q17_VIEW_W / 2 - S / 2, 64], // 1st centred
  [Q17_VIEW_W / 2 - S / 2 + 34, 64 + 30],
  [Q17_VIEW_W / 2 - S / 2 - 38, 64 + 26],
  [Q17_VIEW_W / 2 - S / 2 + 2, 64 + 56],
]

export default function P24G3Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 1 persegi 4 sudut siku-siku, 2 persegi maksimum 16, jadi 16 per persegi, 4 x 16 = ${ANSWER_MAX} sudut, jawaban E.`
      : `Explainer: 1 square 4 right angles, 2 squares max 16, so 16 per square, 4 x 16 = ${ANSWER_MAX} right angles, answer E.`

  // Centre the cluster horizontally for 1- or 2-square beats.
  const count = beat.squares
  const single = count === 1

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${Q17_VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: Q17_VIEW_W, display: 'block' }} aria-hidden="true">
          {Array.from({ length: count }).map((_, i) => {
            const [px, py] = single ? [Q17_VIEW_W / 2 - S / 2, 70] : POS[i]
            return <Square key={i} x={px} y={py} s={S} fill={GREENS[i % GREENS.length]} strokeWidth={2.2} />
          })}

          {/* running-maximum badge */}
          {beat.badge != null && (
            <g>
              <rect x={Q17_VIEW_W - 92} y={14} width={78} height={34} rx={10} fill={beat.result ? GREEN : '#F59E0B'} />
              <text
                x={Q17_VIEW_W - 53}
                y={31}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={900}
                fill="#fff"
              >
                {beat.badge}
              </text>
              <text x={Q17_VIEW_W - 53} y={56} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>
                {lang === 'id' ? 'sudut maks' : 'max angles'}
              </text>
            </g>
          )}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
