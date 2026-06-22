import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { KangPuzzleGrid, ARRANGEMENTS } from './Puzzle3PEIllustration'
import { buildPuzzle3PESteps } from './puzzle3PESteps'

// IKMC-20-PE-Q3 — "How are the pieces arranged?" (answer A)
//
// The explainer walks through the kangaroo piece identification beat-by-beat:
//   Beat 1 — top half: piece 4 (top-left, upper body/pouch), piece 3 (top-right, back)
//   Beat 2 — bottom half: piece 2 (bottom-left, head), piece 1 (bottom-right, legs)
//   Beat 3 — compare to option A
//   Beat 4 — confirm: arrangement 4/3/2/1 = answer A
//
// Reuses KangPuzzleGrid from the illustration for consistent rendering.

const BORDER  = '#30598A'
const GREEN   = '#10B981'
const AMBER   = '#D97706'
const HIGHLIGHT = '#FEF3C7'

function OptionChip({ label, arrangement, highlighted }: {
  label: 'A' | 'B' | 'C' | 'D' | 'E'
  arrangement: [number, number, number, number]
  highlighted: boolean
}) {
  const isAnswer = label === 'A'
  const border = highlighted ? (isAnswer ? GREEN : AMBER) : '#D1D5DB'
  const bg     = highlighted ? (isAnswer ? '#D1FAE5' : HIGHLIGHT) : '#F9FAFB'

  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-lg border-2 px-1.5 py-1"
      style={{ borderColor: border, background: bg }}
    >
      <div className="font-display text-xs font-black" style={{ color: highlighted ? (isAnswer ? GREEN : AMBER) : '#9CA3AF' }}>
        {label}
      </div>
      <svg viewBox="0 0 44 44" width={44} height={44} role="presentation">
        {([0, 1, 2, 3] as const).map((i) => {
          const row = Math.floor(i / 2)
          const col = i % 2
          const x   = 2 + col * 20
          const y   = 2 + row * 20
          return (
            <g key={i}>
              <rect x={x} y={y} width={20} height={20} fill="#FFF7ED" stroke={BORDER} strokeWidth={1.2} />
              <text
                x={x + 10}
                y={y + 14}
                textAnchor="middle"
                fontSize={10}
                fontWeight="bold"
                fontFamily="sans-serif"
                fill="#1F2937"
              >
                {arrangement[i]}
              </text>
            </g>
          )
        })}
        <rect x={2} y={2} width={40} height={40} fill="none" stroke={BORDER} strokeWidth={1.5} />
      </svg>
    </div>
  )
}

export default function Puzzle3PEExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildPuzzle3PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: piece 4 goes top-left (upper body), piece 3 top-right (back), piece 2 bottom-left (head), piece 1 bottom-right (legs). Only option A has this arrangement — answer A.',
    'Penjelasan: potongan 4 di kiri atas (badan atas), potongan 3 di kanan atas (punggung), potongan 2 di kiri bawah (kepala), potongan 1 di kanan bawah (kaki). Hanya pilihan A yang memiliki susunan ini — jawaban A.',
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Goal banner */}
        <div className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          {t('Which piece goes where?', 'Potongan mana di mana?')}
        </div>

        {/* Kangaroo puzzle grid */}
        <div className="relative">
          <KangPuzzleGrid arrangement={story.correctArrangement} />
          {/* Overlay highlight cells */}
          {beat.highlightCells.some(Boolean) && (
            <svg
              viewBox={`0 0 ${68 * 2 + 6 * 2} ${68 * 2 + 6 * 2}`}
              width={68 * 2 + 6 * 2}
              height={68 * 2 + 6 * 2}
              className="pointer-events-none absolute inset-0"
              style={{ mixBlendMode: 'multiply' }}
            >
              {([0, 1, 2, 3] as const).map((i) => {
                if (!beat.highlightCells[i]) return null
                const row = Math.floor(i / 2)
                const col = i % 2
                return (
                  <rect
                    key={i}
                    x={6 + col * 68}
                    y={6 + row * 68}
                    width={68}
                    height={68}
                    fill={beat.result ? '#6EE7B7' : '#FDE68A'}
                    opacity={0.45}
                  />
                )
              })}
            </svg>
          )}
        </div>

        {/* Option chips — show when comparing */}
        {beat.highlightOption && (
          <motion.div
            key={beat.highlightOption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <OptionChip
              label="A"
              arrangement={ARRANGEMENTS.A}
              highlighted={beat.highlightOption === 'A'}
            />
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[3.5rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BORDER, color: BORDER }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
