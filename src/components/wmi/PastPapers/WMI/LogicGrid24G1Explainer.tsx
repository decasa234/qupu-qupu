import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { LogicGrid24G1, SHADED_CELLS } from './LogicGrid24G1Illustration'
import { buildLogicGrid24G1Steps } from './logicGrid24G1Steps'

const GREEN = '#10B981' // verdict / final-sum (echoes fill-qupu-* explainers)
const BLUE = '#30598A' // qupu-brand-blue working caption
const ORANGE = '#f0853a' // qupu-brand-orange spotlight ring (matches LIT clue tint)

// Mirror the primitive's layout so the spotlight overlay lines up exactly.
const PAD = 16
const CELL = 56
const GRID_N = 3
const BOARD = GRID_N * CELL
const CLUE_LINE = 19
const CLUE_GAP = 14
const VIEW_W = BOARD + PAD * 2
const VIEW_H = PAD + BOARD + CLUE_GAP + 6 * CLUE_LINE + PAD

const gx = (c: number) => PAD + c * CELL
const gy = (r: number) => PAD + r * CELL

function cellRC(key: string): { r: number; c: number } {
  return { r: Number(key[1]), c: Number(key[3]) }
}

export default function LogicGrid24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLogicGrid24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: isi 1–9 ke kisi 3×3 mengikuti petunjuk lalu jumlahkan dua kotak abu-abu — hasilnya ${story.answer}.`
      : `Explainer: fill 1–9 into the 3×3 grid by the clues, then add the two grey squares — the total is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-[200px]" style={{ maxWidth: '100%' }}>
          <LogicGrid24G1 solved={beat.solved} litClue={beat.litClue} />

          {/* Spotlight rings over the two shaded squares on the final sum beat. */}
          {beat.spotlightShaded && (
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {SHADED_CELLS.map((key) => {
                const { r, c } = cellRC(key)
                return (
                  <motion.rect
                    key={`ring-${key}`}
                    x={gx(c) + 2}
                    y={gy(r) + 2}
                    width={CELL - 4}
                    height={CELL - 4}
                    rx={5}
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth={4}
                    initial={{ opacity: 0.35, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 220,
                      damping: 12,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      repeatDelay: 0.3,
                    }}
                    style={{ transformOrigin: `${gx(c) + CELL / 2}px ${gy(r) + CELL / 2}px` }}
                  />
                )
              })}
            </svg>
          )}
        </div>

        {beat.result && (
          <div className="font-display text-2xl font-black tabular-nums" style={{ color: GREEN }}>
            {story.answer}
          </div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
