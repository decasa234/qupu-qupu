import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  AX, AY,
  BX, BY,
  CX, CY,
  DX, DY,
  EX, EY,
  FX, FY,
  COL,
} from './RectTriOSN07KQ13Illustration'
import { buildRectTriOSN07KQ13Steps } from './rectTriOSN07KQ13Steps'

// OSN-07-SD-KAB-Q13 — animated explainer.
//
// Animation beats:
//   0. intro     — label rectangle ABCD (10×8=80).
//   1. △EAF      — highlight bottom-left corner: ½×6×4=12.
//   2. △FBC      — highlight bottom-right corner: ½×4×8=16.
//   3. △DCE      — highlight top corner: ½×10×4=20.
//   4. result    — △ECF = 80−48 = 32 cm² (green).

// ── Colour tokens ─────────────────────────────────────────────────────────────

const GREEN      = '#10B981'
const BLUE       = '#1E5FA8'
const AMBER      = '#F59E0B'
const AMBER_FILL = '#FCD34D'
const AMBER_DARK = '#78350F'

// ── Layout ────────────────────────────────────────────────────────────────────

const FIG_W = Math.min(300, SVG_W)

// Polygon point strings
const TRI_PTS = `${EX},${EY} ${CX},${CY} ${FX},${FY}`   // △ECF (shaded)
const EAF_PTS = `${EX},${EY} ${AX},${AY} ${FX},${FY}`   // △EAF (bottom-left)
const FBC_PTS = `${FX},${FY} ${BX},${BY} ${CX},${CY}`   // △FBC (bottom-right)
const DCE_PTS = `${DX},${DY} ${CX},${CY} ${EX},${EY}`   // △DCE (top)

// Centroids for corner-triangle area labels
// △EAF: ((40+40+148)/3, (106+178+178)/3) = (76, 154)
const EAF_LX = 76, EAF_LY = 154
// △FBC: ((148+220+220)/3, (178+178+34)/3) = (196, 130)
const FBC_LX = 196, FBC_LY = 130
// △DCE: ((40+220+40)/3, (34+34+106)/3) = (100, 58)
const DCE_LX = 100, DCE_LY = 58
// △ECF centroid: ((40+220+148)/3, (106+34+178)/3) = (136, 106)
const ECF_LX = 136, ECF_LY = 110

// ── Main explainer ────────────────────────────────────────────────────────────

export default function RectTriOSN07KQ13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'

  const story = useMemo(() => buildRectTriOSN07KQ13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kurangi tiga segitiga sudut dari luas persegi panjang: 80 − 12 − 16 − 20 = 32 cm².'
      : 'Explainer: subtract three corner triangles from the rectangle: 80 − 12 − 16 − 20 = 32 cm².'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Shaded triangle ECF — green on result beat */}
          <polygon
            points={TRI_PTS}
            fill={isResult ? '#D1FAE5' : COL.SHADE}
            stroke="none"
          />

          {/* Rectangle border */}
          <rect
            x={DX}
            y={DY}
            width={BX - AX}
            height={AY - DY}
            fill="none"
            stroke={COL.RECT}
            strokeWidth={2.5}
          />

          {/* Triangle outline */}
          <polygon
            points={TRI_PTS}
            fill="none"
            stroke={isResult ? GREEN : COL.RECT}
            strokeWidth={isResult ? 2.5 : 2}
            strokeLinejoin="round"
          />

          {/* Vertex labels */}
          <text x={DX - 7}  y={DY - 8}  fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="end">D</text>
          <text x={CX + 7}  y={CY - 8}  fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="start">C</text>
          <text x={AX - 7}  y={AY + 14} fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="end">A</text>
          <text x={BX + 7}  y={BY + 14} fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="start">B</text>
          <text x={EX - 10} y={EY + 5}  fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="end">E</text>
          <text x={FX}      y={FY + 14} fontSize={13} fontWeight={700} fill={COL.TEXT} textAnchor="middle">F</text>

          {/* Corner triangle overlays */}

          {/* △EAF — bottom-left */}
          <AnimatePresence>
            {beat.showEAF && (
              <motion.g
                key="eaf"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <polygon
                  points={EAF_PTS}
                  fill={AMBER_FILL}
                  fillOpacity={0.72}
                  stroke={AMBER}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                <text
                  x={EAF_LX}
                  y={EAF_LY}
                  fontSize={12}
                  fontWeight={800}
                  fill={AMBER_DARK}
                  textAnchor="middle"
                >
                  12
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* △FBC — bottom-right */}
          <AnimatePresence>
            {beat.showFBC && (
              <motion.g
                key="fbc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <polygon
                  points={FBC_PTS}
                  fill={AMBER_FILL}
                  fillOpacity={0.72}
                  stroke={AMBER}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                <text
                  x={FBC_LX}
                  y={FBC_LY}
                  fontSize={12}
                  fontWeight={800}
                  fill={AMBER_DARK}
                  textAnchor="middle"
                >
                  16
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* △DCE — top */}
          <AnimatePresence>
            {beat.showDCE && (
              <motion.g
                key="dce"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <polygon
                  points={DCE_PTS}
                  fill={AMBER_FILL}
                  fillOpacity={0.72}
                  stroke={AMBER}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                <text
                  x={DCE_LX}
                  y={DCE_LY}
                  fontSize={12}
                  fontWeight={800}
                  fill={AMBER_DARK}
                  textAnchor="middle"
                >
                  20
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Result label on △ECF */}
          <AnimatePresence>
            {beat.showResult && (
              <motion.g
                key="result-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              >
                <text
                  x={ECF_LX}
                  y={ECF_LY}
                  fontSize={15}
                  fontWeight={800}
                  fill={GREEN}
                  textAnchor="middle"
                >
                  32 cm²
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Equation badge */}
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

        {/* Caption */}
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
