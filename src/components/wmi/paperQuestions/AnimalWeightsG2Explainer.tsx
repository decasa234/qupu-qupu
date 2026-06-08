import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  PIG,
  MONKEY,
  COW,
  ELEPHANT,
  SeesawPanel,
  CELL_W,
} from './AnimalWeightsG2Illustration'
import type { AnimalEmoji } from './AnimalWeightsG2Illustration'
import { buildAnimalWeightsG2Steps } from './animalWeightsG2Steps'

const GREEN = '#10B981'
const PURPLE = '#341857'

/** The four answer orderings as drawn in the figure. C is correct. */
const OPTIONS: { label: 'A' | 'B' | 'C' | 'D'; order: AnimalEmoji[] }[] = [
  { label: 'A', order: [ELEPHANT, PIG, COW, MONKEY] },
  { label: 'B', order: [COW, ELEPHANT, PIG, MONKEY] },
  { label: 'C', order: [ELEPHANT, COW, PIG, MONKEY] }, // correct
  { label: 'D', order: [ELEPHANT, COW, MONKEY, PIG] },
]

export default function AnimalWeightsG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildAnimalWeightsG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari jungkat-jungkit, urutan terberat ke teringan adalah gajah, sapi, babi, monyet — pilihan C.'
      : 'Explainer: from the seesaws, the heaviest-to-lightest order is elephant, cow, pig, monkey — option C.'

  return (
    <div className="mx-auto w-full max-w-[600px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The three seesaws, with the active one glowing. */}
        <SeesawPanel glowIndex={beat.glowIndex} />

        {/* The chained heaviest → lightest order, when available. */}
        {beat.chain.length > 0 && (
          <svg viewBox={`0 0 ${CELL_W * 3} 60`} width="100%" style={{ maxWidth: CELL_W * 3 }} aria-hidden="true">
            {beat.chain.map((emoji, i) => {
              const x = 90 + i * 130
              return (
                <g key={i}>
                  <text x={x} y={30} fontSize={30} textAnchor="middle" dominantBaseline="central">
                    {emoji}
                  </text>
                  {i < beat.chain.length - 1 && (
                    <text x={x + 65} y={30} fontSize={24} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={PURPLE}>
                      {'>'}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}

        {/* Answer options A B C D — each one an ordering. */}
        <svg viewBox={`0 0 ${CELL_W * 3} 220`} width="100%" style={{ maxWidth: CELL_W * 3 }} aria-hidden="true">
          {OPTIONS.map((opt, r) => {
            const y = 30 + r * 48
            const chosen = beat.highlightOption === opt.label
            return (
              <g key={opt.label}>
                {chosen && (
                  <rect x={6} y={y - 22} width={CELL_W * 3 - 12} height={44} rx={10} fill="none" stroke={GREEN} strokeWidth={3} />
                )}
                <text x={28} y={y} fontSize={18} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={chosen ? '#065F46' : PURPLE}>
                  {opt.label}
                </text>
                {opt.order.map((emoji, i) => (
                  <text key={i} x={90 + i * 120} y={y} fontSize={26} textAnchor="middle" dominantBaseline="central">
                    {emoji}
                  </text>
                ))}
              </g>
            )
          })}
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
