// HKIMO-20-P1H-Q16 — post-answer animation.
//
// Reuses FIG1_CUBES / FIG2_CUBES from the illustration and the ISO_GOLD_PALETTE
// from the IsoCubes primitive.  Animation beats (see cubeScaleHK20P1Q16Steps.ts):
//   0. intro       — both figures static.
//   1. fig1-count  — Figure 1 rendered in gold; "7 cubes".
//   2. scale       — ×3 scale label between figures.
//   3. fig2-count  — Figure 2 in gold; "7 × 3 = 21".
//   4. result      — equation in green; answer confirmed.

import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import { FIG1_CUBES, FIG2_CUBES } from './CubeScaleHK20P1Q16Illustration'
import {
  buildCubeScaleHK20P1Q16Steps,
  type Lang,
} from './cubeScaleHK20P1Q16Steps'

const GREEN = '#10B981'
const GOLD  = '#F59E0B'

export default function CubeScaleHK20P1Q16Explainer({
  lang = 'en',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const beats = buildCubeScaleHK20P1Q16Steps((lang ?? 'en') as Lang)
  const beat = beats[
    useBeatControl(beats.length - 1, {
      step,
      playing,
      onStepCount,
      onStepChange,
      onPlayEnd,
      holds: beats.map((b) => b.hold),
    })
  ]

  const fig1Palette = beat.highlightFig1 ? ISO_GOLD_PALETTE : ISO_BLUE_PALETTE
  const fig2Palette = beat.highlightFig2 ? ISO_GOLD_PALETTE : ISO_BLUE_PALETTE
  const eqColor     = beat.result ? GREEN : GOLD

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Figures row */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', justifyContent: 'center' }}>
        {/* Figure 1 */}
        <div style={{ textAlign: 'center' }}>
          <IsoCubes
            cubes={FIG1_CUBES}
            size={22}
            cellGap={1}
            palette={fig1Palette}
            label={lang === 'id' ? 'Bangun 1 — 7 kubus' : 'Figure 1 — 7 cubes'}
          />
          <div style={{ fontSize: 11, marginTop: 4, color: '#6B7280' }}>
            {lang === 'id' ? 'Bangun 1' : 'Figure 1'}
          </div>
        </div>

        {/* Scale label */}
        <AnimatePresence>
          {beat.showScale && (
            <motion.div
              key="scale"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                alignSelf: 'center',
                fontSize: 20,
                fontWeight: 700,
                color: GOLD,
                padding: '0 4px',
              }}
            >
              ×3
            </motion.div>
          )}
        </AnimatePresence>

        {/* Figure 2 */}
        <div style={{ textAlign: 'center' }}>
          <IsoCubes
            cubes={FIG2_CUBES}
            size={13}
            cellGap={1}
            palette={fig2Palette}
            label={lang === 'id' ? 'Bangun 2' : 'Figure 2'}
          />
          <div style={{ fontSize: 11, marginTop: 4, color: '#6B7280' }}>
            {lang === 'id' ? 'Bangun 2' : 'Figure 2'}
          </div>
        </div>
      </div>

      {/* Equation */}
      <AnimatePresence mode="wait">
        {beat.equation && (
          <motion.div
            key={beat.equation}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: eqColor,
              letterSpacing: '0.02em',
            }}
          >
            {beat.equation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            fontSize: 13,
            color: '#374151',
            textAlign: 'center',
            maxWidth: 340,
            lineHeight: 1.5,
          }}
        >
          {beat.caption}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
