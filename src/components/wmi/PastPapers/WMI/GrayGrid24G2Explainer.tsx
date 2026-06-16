// GrayGrid24G2Explainer.tsx
// WMI-24F2A-Q4 post-answer animation: 8×9 grid → count total (72) →
// highlight & count 7 gray cells → subtract to get 65 white.
//
// Deterministic + SSR-safe. No Math.random / Date. Pure render of params.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  GRAY_CELLS,
  GRID_COLS,
  GRID_ROWS,
  GRID_TOTALS,
  GrayGridPrimitive,
} from './GrayGrid24G2Illustration'

// ---- colour tokens (matching fill-qupu-* palette) --------------------------
const BLUE = '#30598A'
const BLUE_LIGHT = '#E1EFFB'
const GREEN = '#059669'
const GREEN_LIGHT = '#D1FAE5'
const GRAY_FILL = '#9CA3AF'

// ---- bilingual helper -------------------------------------------------------
type Lang = 'en' | 'id'
const t = (lang: Lang, en: string, id: string) => (lang === 'id' ? id : en)

// ---- beats ------------------------------------------------------------------
interface Beat {
  phase: 'total' | 'gray' | 'answer'
  hold: number
  caption: string
}

function buildBeats(lang: Lang): Beat[] {
  return [
    {
      phase: 'total',
      hold: 2400,
      caption: t(
        lang,
        `Step 1: count ALL cells. ${GRID_ROWS} rows × ${GRID_COLS} columns = ${GRID_TOTALS.total} rectangles total.`,
        `Langkah 1: hitung SEMUA kotak. ${GRID_ROWS} baris × ${GRID_COLS} kolom = ${GRID_TOTALS.total} persegi panjang.`,
      ),
    },
    {
      phase: 'gray',
      hold: 2200,
      caption: t(
        lang,
        `Step 2: count the gray ones. There are ${GRID_TOTALS.gray} gray rectangles (shaded).`,
        `Langkah 2: hitung yang abu-abu. Ada ${GRID_TOTALS.gray} persegi panjang abu-abu.`,
      ),
    },
    {
      phase: 'answer',
      hold: 0,
      caption: t(
        lang,
        `${GRID_TOTALS.total} − ${GRID_TOTALS.gray} = ${GRID_TOTALS.white} white rectangles. Answer: E`,
        `${GRID_TOTALS.total} − ${GRID_TOTALS.gray} = ${GRID_TOTALS.white} persegi panjang putih. Jawaban: E`,
      ),
    },
  ]
}

// ---- grid with per-cell overrides -------------------------------------------
function AnimatedGrid({ phase }: { phase: Beat['phase'] }) {
  const overrides = useMemo<ReadonlyMap<string, string>>(() => {
    if (phase === 'total') return new Map()
    const m = new Map<string, string>()
    GRAY_CELLS.forEach(([r, c]) => {
      if (phase === 'gray') {
        m.set(`${r},${c}`, '#F59E0B') // amber highlight while counting
      } else {
        // answer phase: gray stays gray
        m.set(`${r},${c}`, GRAY_FILL)
      }
    })
    return m
  }, [phase])

  return <GrayGridPrimitive highlightGray={phase !== 'total'} overrides={overrides} />
}

// ---- equation bar -----------------------------------------------------------
function EquationBar({ phase }: { phase: Beat['phase'] }) {
  const show = phase === 'gray' || phase === 'answer'
  const showResult = phase === 'answer'

  return (
    <div className="flex items-center justify-center gap-2 font-display text-base font-extrabold">
      {/* total box */}
      <motion.div
        className="rounded-lg border-2 px-3 py-1"
        style={{ borderColor: BLUE, background: BLUE_LIGHT, color: BLUE }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, type: 'spring', stiffness: 260, damping: 22 }}
      >
        {GRID_TOTALS.total}
      </motion.div>

      {show && (
        <motion.span
          className="text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          −
        </motion.span>
      )}

      {show && (
        <motion.div
          className="rounded-lg border-2 px-3 py-1"
          style={{ borderColor: '#B45309', background: '#FEF3C7', color: '#92400E' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, type: 'spring', stiffness: 260, damping: 22 }}
        >
          {GRID_TOTALS.gray}
        </motion.div>
      )}

      {showResult && (
        <>
          <motion.span
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.2 }}
          >
            =
          </motion.span>
          <motion.div
            className="rounded-lg border-2 px-3 py-1"
            style={{ borderColor: GREEN, background: GREEN_LIGHT, color: '#065F46' }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.25, type: 'spring', stiffness: 240, damping: 18 }}
          >
            {GRID_TOTALS.white}
          </motion.div>
        </>
      )}
    </div>
  )
}

// ---- main export ------------------------------------------------------------
export default function GrayGrid24G2Explainer(props: ExplainerProps) {
  const lang: Lang = props.lang ?? 'en'

  const steps = useMemo(() => buildBeats(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[finalIndex]

  const ariaLabel = t(
    lang,
    `Grid subtraction: ${GRID_ROWS} rows times ${GRID_COLS} columns equals ${GRID_TOTALS.total} cells; minus ${GRID_TOTALS.gray} gray gives ${GRID_TOTALS.white} white. Answer E.`,
    `Pengurangan kisi: ${GRID_ROWS} baris kali ${GRID_COLS} kolom sama dengan ${GRID_TOTALS.total} kotak; dikurangi ${GRID_TOTALS.gray} abu-abu menghasilkan ${GRID_TOTALS.white} putih. Jawaban E.`,
  )

  const isAnswer = beat.phase === 'answer'
  const captionStyle = isAnswer
    ? { background: GREEN_LIGHT, borderColor: GREEN, color: '#065F46' }
    : { background: BLUE_LIGHT, borderColor: BLUE, color: BLUE }

  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Grid */}
        <AnimatedGrid phase={beat.phase} />

        {/* Equation bar */}
        <EquationBar phase={beat.phase} />

        {/* Caption */}
        <motion.div
          key={beat.phase}
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
