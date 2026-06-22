/**
 * IKMC-20-EC-Q23 — post-answer explainer: which key cannot be cut into
 * three different pentomino figures?  Answer: B.
 *
 * Shows all five key shapes side-by-side; highlights each in turn as the
 * animation steps through them, marking valid keys ✓ and key B ✗.
 *
 * Reuses KeyGrid from Keys23ECIllustration so the figures read as the
 * same scene coming alive.
 *
 * Beat sequence (from keys23ECSteps.ts):
 *   0. intro      — 15 = 3 × 5
 *   1. pentomino  — three different shapes needed
 *   2. keyA       — A valid ✓
 *   3. keyC       — C valid ✓
 *   4. keyD       — D valid ✓
 *   5. keyE       — E valid ✓
 *   6. keyB       — B impossible ✗
 *   7. result     — answer B
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { KeyGrid } from './Keys23ECIllustration'
import { buildKeys23ECSteps } from './keys23ECSteps'

// ─── colour tokens ────────────────────────────────────────────────────────────

const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const RED       = '#DC2626'
const RED_BG    = '#FEE2E2'
const RED_TXT   = '#7F1D1D'
const INK       = '#1F2937'

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// ─── KeyPanel ────────────────────────────────────────────────────────────────

interface KeyPanelProps {
  label: string
  active: boolean
  /** null = neutral, true = valid, false = impossible */
  verdict: boolean | null
}

function KeyPanel({ label, active, verdict }: KeyPanelProps) {
  let borderColor = '#E5E7EB'
  if (active && verdict === true)  borderColor = GREEN
  if (active && verdict === false) borderColor = RED
  if (active && verdict === null)  borderColor = BLUE

  const labelColor =
    active && verdict === true  ? GREEN :
    active && verdict === false ? RED   :
    active                      ? BLUE  :
    INK

  // import cells from illustration module — we re-declare them here locally
  // to keep the explainer self-contained and avoid a circular import.
  const CELLS: Record<string, [number, number][]> = {
    A: [
      [0,0],[1,0],[2,0],
      [0,1],      [2,1],
      [0,2],[1,2],[2,2],
      [0,3],[1,3],[2,3],
            [1,4],
      [0,5],[1,5],[2,5],
    ],
    B: [
      [0,0],[1,0],[2,0],
      [0,1],      [2,1],[3,1],
      [0,2],[1,2],[2,2],
            [1,3],[2,3],
            [1,4],
      [0,5],[1,5],[2,5],
    ],
    C: [
      [0,0],[1,0],[2,0],
      [0,1],      [2,1],[3,1],
      [0,2],[1,2],[2,2],
      [0,3],[1,3],
            [1,4],
      [0,5],[1,5],[2,5],
    ],
    D: [
            [1,0],[2,0],
      [0,1],      [2,1],
      [0,2],[1,2],[2,2],
      [0,3],[1,3],[2,3],
            [1,4],
            [1,5],
      [0,6],[1,6],[2,6],
    ],
    E: [
            [1,0],[2,0],[3,0],
      [0,1],      [2,1],[3,1],
            [1,2],[2,2],[3,2],
            [1,3],[2,3],
                  [2,4],
            [1,5],[2,5],[3,5],
    ],
  }

  const cells = CELLS[label] as [number, number][] | undefined
  if (!cells) return null

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 52,
        transition: 'border-color 0.25s',
      }}
    >
      <KeyGrid cells={cells} cs={14} />
      <span
        className="font-display text-xs font-bold"
        style={{ color: labelColor }}
      >
        {label}
      </span>
      <AnimatePresence>
        {active && verdict !== null && (
          <motion.div
            key={`verdict-${label}`}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.82 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[10px] font-bold"
            style={{
              background: verdict ? GREEN_BG : RED_BG,
              color:      verdict ? GREEN_TXT : RED_TXT,
              border: `1.5px solid ${verdict ? GREEN : RED}`,
            }}
          >
            {verdict ? '✓' : '✗'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main explainer ───────────────────────────────────────────────────────────

export default function Keys23ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildKeys23ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: RED_BG, borderColor: RED, color: RED_TXT }
    : beat.focus !== null && beat.valid === false
    ? { background: RED_BG, borderColor: RED, color: RED_TXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: setiap kunci punya 15 kotak = 3 × 5. Kunci A, C, D, E bisa dipotong menjadi 3 pentomino berbeda. Kunci B tidak bisa — selalu ada dua bagian yang bentuknya sama. Jawaban B.'
      : 'Explainer: each key has 15 squares = 3 × 5. Keys A, C, D, E can be cut into 3 different pentominoes. Key B cannot — two pieces always end up the same shape. Answer B.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five key panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {LABELS.map((label) => {
            const isActive = beat.focus === label
            const verdict = isActive ? beat.valid : null
            return (
              <KeyPanel
                key={label}
                label={label}
                active={isActive}
                verdict={verdict}
              />
            )
          })}
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.72, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.72, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{
                  background:
                    isResult || (beat.focus === 'B' && beat.valid === false)
                      ? RED
                      : beat.valid === true
                      ? GREEN
                      : BLUE,
                }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
