import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  COL_L,
  COL_R,
  COL_LL,
  ROW_Y,
  LINE_Y,
  LINE_X1,
  LINE_X2,
  RES_Y,
  COLOR,
} from './ColAdd22A10Illustration'
import { buildColAdd22A10Steps } from './colAdd22A10Steps'

// SEAMO-22-A-Q10 — post-answer animation.
// Reuses the layout constants from the illustration; animates beat-by-beat
// how AA + BB + CC = ABC forces A=1, B=9, C=8 → 198.
//
// Animation beats:
//   0. intro     — static column layout.
//   1. expand    — highlight all three addend rows, show 11A+11B+11C chip.
//   2. simplify  — highlight result row, show B+10C=89A.
//   3. try-a     — highlight all rows, show A=1→C=8,B=9.
//   4. verify    — show all rows + result + check mark, show 11+99+88=198.
//   5. result    — highlight result row, green answer chip.

const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'
const AMBER = '#D97706'
const FONT = 'ui-sans-serif, system-ui, sans-serif'
const FIG_W = Math.min(260, SVG_W)

/** Render a bold letter with optional colour. */
function L({
  cx, cy, ch, color = COLOR.LETTER,
}: { cx: number; cy: number; ch: string; color?: string }) {
  return (
    <text
      x={cx} y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={22}
      fontWeight={800}
      fill={color}
      fontFamily={FONT}
    >
      {ch}
    </text>
  )
}

/** Render a row with optional digit labels substituted in. */
function AddendRow({
  cy, tens, units, highlight, digitTens, digitUnits,
}: {
  cy: number
  tens: string
  units: string
  highlight: boolean
  digitTens?: string
  digitUnits?: string
}) {
  const ink = highlight ? ORANGE : COLOR.LETTER
  return (
    <>
      <L cx={COL_L} cy={cy} ch={digitTens ?? tens} color={ink} />
      <L cx={COL_R} cy={cy} ch={digitUnits ?? units} color={ink} />
    </>
  )
}

export default function ColAdd22A10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildColAdd22A10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // In verify/result beats show the actual digit values in the figure
  const showDigits = beat.phase === 'verify' || beat.phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: AA=11A, BB=11B, CC=11C, sehingga 11(A+B+C)=100A+10B+C → B+10C=89A; coba A=1: C=8, B=9; cek 11+99+88=198 — jawaban C.'
      : 'Explainer: AA=11A, BB=11B, CC=11C so 11(A+B+C)=100A+10B+C → B+10C=89A; try A=1: C=8, B=9; verify 11+99+88=198 — answer C.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* plus sign */}
          <text
            x={46} y={ROW_Y[2]}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={700}
            fill={COLOR.PLUS}
            fontFamily={FONT}
          >
            +
          </text>

          {/* Row A */}
          <AddendRow
            cy={ROW_Y[0]}
            tens="A" units="A"
            highlight={beat.highlightA}
            digitTens={showDigits ? '1' : undefined}
            digitUnits={showDigits ? '1' : undefined}
          />

          {/* Row B */}
          <AddendRow
            cy={ROW_Y[1]}
            tens="B" units="B"
            highlight={beat.highlightB}
            digitTens={showDigits ? '9' : undefined}
            digitUnits={showDigits ? '9' : undefined}
          />

          {/* Row C */}
          <AddendRow
            cy={ROW_Y[2]}
            tens="C" units="C"
            highlight={beat.highlightC}
            digitTens={showDigits ? '8' : undefined}
            digitUnits={showDigits ? '8' : undefined}
          />

          {/* rule line */}
          <line
            x1={LINE_X1} y1={LINE_Y}
            x2={LINE_X2} y2={LINE_Y}
            stroke={COLOR.LINE} strokeWidth={2} strokeLinecap="round"
          />

          {/* Result row */}
          <AnimatePresence>
            {beat.highlightResult ? (
              <motion.g
                key="result-hi"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                {showDigits ? (
                  <>
                    <L cx={COL_LL} cy={RES_Y} ch="1" color={GREEN} />
                    <L cx={COL_L}  cy={RES_Y} ch="9" color={GREEN} />
                    <L cx={COL_R}  cy={RES_Y} ch="8" color={GREEN} />
                  </>
                ) : (
                  <>
                    <L cx={COL_LL} cy={RES_Y} ch="A" color={BLUE} />
                    <L cx={COL_L}  cy={RES_Y} ch="B" color={BLUE} />
                    <L cx={COL_R}  cy={RES_Y} ch="C" color={BLUE} />
                  </>
                )}
              </motion.g>
            ) : (
              <motion.g key="result-normal" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                <L cx={COL_LL} cy={RES_Y} ch="A" />
                <L cx={COL_L}  cy={RES_Y} ch="B" />
                <L cx={COL_R}  cy={RES_Y} ch="C" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* check mark overlay */}
          <AnimatePresence>
            {beat.showCheck && (
              <motion.text
                key="check"
                x={SVG_W - 24}
                y={RES_Y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={20}
                fontWeight={900}
                fill={GREEN}
                fontFamily={FONT}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              >
                ✓
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
