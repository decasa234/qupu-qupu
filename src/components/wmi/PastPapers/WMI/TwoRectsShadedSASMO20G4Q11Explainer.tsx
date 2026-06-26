// SASMO-20-G4-Q11 — post-answer animated explainer.
// Reuses TwoRectsShadedBase + layout constants from the Illustration.
// Beats: intro → ABCD highlight → PQRS highlight → result (30 = 30, answer A).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W, SVG_H,
  C,
  ABCD, ABCD_TRIS, AB_MY,
  PQRS, PQRS_TRIS, PQ_MX,
  TwoRectsShadedBase,
} from './TwoRectsShadedSASMO20G4Q11Illustration'
import { buildTwoRectsShadedSASMO20G4Q11Steps } from './twoRectsShadedSASMO20G4Q11Steps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const AMBER_OV = 'rgba(251,191,36,0.45)'
const GREEN_OV = 'rgba(16,185,129,0.45)'
const AMBER    = '#F59E0B'
const GREEN    = '#10B981'
const BLUE     = '#1D4ED8'

const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
const TR   = { duration: 0.3 }

// ── Default export ────────────────────────────────────────────────────────────

export default function TwoRectsShadedSASMO20G4Q11Explainer(props: ExplainerProps) {
  const lang    = (props.lang ?? 'id') as 'en' | 'id'
  const story   = useMemo(() => buildTwoRectsShadedSASMO20G4Q11Steps(lang), [lang])
  const index   = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ov       = beat.result ? GREEN_OV : AMBER_OV
  const eqColor  = beat.result ? GREEN : BLUE
  const capColor = beat.result ? 'text-emerald-700' : 'text-slate-700'

  const { x: ax, y: ay, w: aw, h: ah } = ABCD
  const { x: px, y: py, w: pw, h: ph } = PQRS

  return (
    <div
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan SASMO 2020 G4 Q11: daerah yang diarsir ABCD = PQRS = 30 cm²'
          : 'Explainer SASMO 2020 G4 Q11: shaded area ABCD = PQRS = 30 cm²'
      }
    >
      <div className="flex flex-col items-center gap-3">

        {/* ── Figure ── */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />
          <TwoRectsShadedBase />

          {/* ── ABCD overlay ── */}
          <AnimatePresence>
            {beat.hlAbcd && (
              <motion.g key="hl-abcd" {...FADE} transition={TR}>
                <polygon points={ABCD_TRIS.upperL} fill={ov} stroke="none" />
                <polygon points={ABCD_TRIS.upperR} fill={ov} stroke="none" />
                <polygon points={ABCD_TRIS.lowerL} fill={ov} stroke="none" />
                <polygon points={ABCD_TRIS.lowerR} fill={ov} stroke="none" />
                {/* "30 cm²" badge */}
                <rect x={ax + aw / 2 - 32} y={ay + ah / 2 - 12} width={64} height={22} rx={5} fill={beat.result ? GREEN : AMBER} />
                <text
                  x={ax + aw / 2} y={ay + ah / 2 + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={11} fontWeight="700" fill="white"
                  fontFamily="system-ui,sans-serif"
                >
                  30 cm²
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* ── PQRS overlay ── */}
          <AnimatePresence>
            {beat.hlPqrs && (
              <motion.g key="hl-pqrs" {...FADE} transition={TR}>
                <polygon points={PQRS_TRIS.leftArr}     fill={ov} stroke="none" />
                <polygon points={PQRS_TRIS.midLeftArr}  fill={ov} stroke="none" />
                <polygon points={PQRS_TRIS.midRightArr} fill={ov} stroke="none" />
                <polygon points={PQRS_TRIS.rightArr}    fill={ov} stroke="none" />
                {/* "30 cm²" badge */}
                <rect x={px + pw / 2 - 32} y={py + ph / 2 - 12} width={64} height={22} rx={5} fill={beat.result ? GREEN : AMBER} />
                <text
                  x={px + pw / 2} y={py + ph / 2 + 1}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={11} fontWeight="700" fill="white"
                  fontFamily="system-ui,sans-serif"
                >
                  30 cm²
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* ── Equation pill ── */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-full px-4 py-1 text-sm font-black tabular-nums text-white"
                style={{ background: eqColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Caption ── */}
        <AnimatePresence mode="wait">
          <motion.p
            key={beat.phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={`text-center text-sm font-medium px-2 ${capColor}`}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

      </div>
    </div>
  )
}
