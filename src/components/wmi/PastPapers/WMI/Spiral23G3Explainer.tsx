import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Spiral23G3 } from './Spiral23G3Illustration'
import {
  buildSpiral23G3Steps,
  type ShapeKind,
  type Tone,
  type Figure,
} from './spiral23G3Steps'

// WMI-23F3A-Q15 — clockwise-outward spiral of heptagons & squares (white/gray/
// black). The two top-row blanks are spiral positions 15 & 16. We deduce TWO
// independent repeating cycles and extend them: the SHAPE cycle [sq,sq,hept,
// hept,hept] makes 15 a heptagon and 16 a square; the COLOR cycle [white,white,
// gray,black] makes 15 white and 16 gray. Combine → white heptagon + gray square
// = option B. The bound Spiral23G3 primitive shows the same scene; on the final
// beat `reveal` fills the two "?" cells. Each beat carries one idea; the winner
// lands last with hold 0.

// Tone hexes match the bound Spiral23G3 figure exactly so the cycle strips read
// as the same scene coming alive (white = outline only, gray, warm near-black).
const WHITE_FILL = '#FFFFFF'
const GRAY_FILL = '#9CA3AF'
const BLACK_FILL = '#2B2622'
const STROKE = '#2B2622'
const GREEN = '#10B981' // winning verdict
const BLUE = '#30598A' // fill-qupu-brand-blue — neutral caption frame
const FOCUS = '#f0853a' // fill-qupu-orange — the cycle highlight ring

const TONE_FILL: Record<Tone, string> = {
  white: WHITE_FILL,
  gray: GRAY_FILL,
  black: BLACK_FILL,
}

// Regular heptagon points (7 vertices) inscribed in radius r about (cx, cy),
// flat-ish top via the -90° start angle. Deterministic — no randomness.
function heptagonPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 7; i++) {
    const a = (-90 + (360 / 7) * i) * (Math.PI / 180)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** One monochrome figure (square or regular heptagon) in a size×size box. */
function CycleGlyph({
  shape,
  tone,
  size = 30,
  lit = false,
}: {
  shape: ShapeKind
  tone: Tone
  size?: number
  lit?: boolean
}) {
  const pad = 3
  const r = size / 2 - pad
  const c = size / 2
  const fill = TONE_FILL[tone]
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {lit && (
        <rect
          x={1}
          y={1}
          width={size - 2}
          height={size - 2}
          rx={6}
          fill="none"
          stroke={FOCUS}
          strokeWidth={2.5}
        />
      )}
      {shape === 'square' ? (
        <rect
          x={c - r}
          y={c - r}
          width={r * 2}
          height={r * 2}
          fill={fill}
          stroke={STROKE}
          strokeWidth={2}
        />
      ) : (
        <polygon points={heptagonPoints(c, c, r)} fill={fill} stroke={STROKE} strokeWidth={2} />
      )}
    </svg>
  )
}

/** A solved "?-cell → figure" chip for position 15 or 16. */
function SolvedChip({ fig, label }: { fig: Figure; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-display text-[10px] font-bold text-slate-500">{label}</span>
      <div className="rounded-lg border-2 border-emerald-400 bg-emerald-50 p-1">
        <CycleGlyph shape={fig.shape} tone={fig.tone} size={32} />
      </div>
    </div>
  )
}

export default function Spiral23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildSpiral23G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: trace the clockwise spiral, then read two repeating cycles — shapes [square, square, heptagon, heptagon, heptagon] and colours [white, white, gray, black]. Extending both, cell 15 is a white heptagon and cell 16 is a gray square — option ${story.answerLabel}.`,
    `Penjelasan: telusuri spiral searah jarum jam, lalu baca dua siklus berulang — bentuk [persegi, persegi, segitujuh, segitujuh, segitujuh] dan warna [putih, putih, abu-abu, hitam]. Dengan memperluas keduanya, sel 15 adalah segitujuh putih dan sel 16 adalah persegi abu-abu — pilihan ${story.answerLabel}.`,
  )

  const showShapeStrip = beat.phase === 'shape'
  const showColorStrip = beat.phase === 'color'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The bound primitive — the same spiral scene, brought to life. */}
        <div className="flex justify-center">
          <Spiral23G3 reveal={beat.reveal} />
        </div>

        {/* SHAPE cycle strip — period-5 [sq, sq, hept, hept, hept]. */}
        <AnimatePresence mode="wait">
          {showShapeStrip && (
            <motion.div
              key="shape-strip"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-display text-[11px] font-extrabold uppercase tracking-wide text-amber-700">
                {t('shape cycle', 'siklus bentuk')}
              </span>
              <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-1.5">
                {story.shapeCycle.map((s, i) => (
                  <CycleGlyph key={i} shape={s} tone="white" size={30} lit={i === beat.shapeFocus} />
                ))}
              </div>
            </motion.div>
          )}

          {/* COLOR cycle strip — period-4 [white, white, gray, black]. */}
          {showColorStrip && (
            <motion.div
              key="color-strip"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="font-display text-[11px] font-extrabold uppercase tracking-wide text-amber-700">
                {t('colour cycle', 'siklus warna')}
              </span>
              <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2 py-1.5">
                {story.colorCycle.map((tone, i) => (
                  // A neutral square so the colour reads on its own.
                  <CycleGlyph key={i} shape="square" tone={tone} size={30} lit={i === beat.colorFocus} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Solved chips for the two blanks as they get pinned down. */}
        {beat.showSolved && (
          <motion.div
            key={`solved-${beat.showSolved}-${beat.result ? 'r' : 'p'}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="flex items-center gap-3"
          >
            {(beat.showSolved === 15 || beat.showSolved === 'both') && (
              <SolvedChip fig={story.fig15} label={t('cell 15', 'sel 15')} />
            )}
            {(beat.showSolved === 16 || beat.showSolved === 'both') && (
              <SolvedChip fig={story.fig16} label={t('cell 16', 'sel 16')} />
            )}
            {beat.result && (
              <div className="rounded-lg border-2 border-emerald-400 bg-emerald-100 px-3 py-2 font-display text-lg font-black text-emerald-700">
                {story.answerLabel}
              </div>
            )}
          </motion.div>
        )}

        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
