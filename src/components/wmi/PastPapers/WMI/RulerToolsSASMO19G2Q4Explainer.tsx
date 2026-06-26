// Explainer for SASMO-19-G2-Q4
// "Find the difference in length between the saw and the screwdriver."
//
// Animation beats (5 total):
//   0 — Intro:        both tools visible, no measurements.
//   1 — Saw:          saw highlighted blue, brace "10 cm".
//   2 — Screwdriver:  screwdriver highlighted green, brace "11 − 7 = 4 cm".
//   3 — Diff:         both highlighted, diff annotation "10 − 4 = 6 cm".
//   4 — Result:       green result badge.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SawShape,
  ScrewdriverShape,
  AlignDash,
  MeasureBrace,
  SVG_W,
  RULER_Y,
  SAW_TOP,
  SAW_BOT,
  SDW_TOP,
  SDW_BOT,
  SAW_CM0,
  SAW_CM1,
  SDW_CM0,
  SDW_CM1,
  xAt,
} from './RulerToolsSASMO19G2Q4Illustration'
import { AxisLine, AxisTick } from './primitives/NumberLine'
import {
  buildRulerToolsSASMO19G2Q4Steps,
} from './rulerToolsSASMO19G2Q4Steps'

const FONT = 'ui-sans-serif, system-ui, sans-serif'
const INK = '#1F2937'
const BLUE = '#2563EB'
const GREEN = '#059669'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'

// Explainer SVG is taller to fit braces below the ruler
const EXP_H = 240

const ticks = Array.from({ length: 13 }, (_, i) => i)
const X0_AXIS = 20
const X1_AXIS = xAt(12)

export default function RulerToolsSASMO19G2Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildRulerToolsSASMO19G2Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const ariaLabel = T(
    'Explainer: saw is 10 cm long, screwdriver is 4 cm long (from 7 to 11 cm), difference is 10 minus 4 equals 6 cm, answer A.',
    'Penjelasan: gergaji 10 cm, obeng 4 cm (dari 7 ke 11 cm), selisih 10 dikurangi 4 sama dengan 6 cm, jawaban A.',
  )

  const sawHL = beat.highlight === 'saw' || beat.highlight === 'both'
  const screwHL = beat.highlight === 'screwdriver' || beat.highlight === 'both'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${EXP_H}`}
        width={SVG_W}
        style={{ display: 'block' }}
        aria-label={ariaLabel}
      >
        {/* Alignment dashes */}
        <AlignDash x={xAt(SAW_CM0)} y0={SAW_TOP + 6} y1={RULER_Y} color={sawHL ? BLUE : '#D1D5DB'} />
        <AlignDash x={xAt(SDW_CM0)} y0={SDW_TOP + 4} y1={RULER_Y} color={screwHL ? GREEN : '#D1D5DB'} />
        <AlignDash x={xAt(SAW_CM1)} y0={SAW_TOP + 6} y1={RULER_Y} color={sawHL ? BLUE : '#D1D5DB'} />
        <AlignDash x={xAt(SDW_CM1)} y0={SDW_TOP + 4} y1={RULER_Y} color={screwHL ? GREEN : '#D1D5DB'} />

        {/* Tools */}
        <SawShape highlight={sawHL} />
        <ScrewdriverShape highlight={screwHL} />

        {/* Ruler */}
        <AxisLine x0={X0_AXIS} x1={X1_AXIS} lineY={RULER_Y} />
        {ticks.map((v) => (
          <AxisTick key={v} x={xAt(v)} lineY={RULER_Y} label={String(v)} />
        ))}
        <text x={X1_AXIS + 14} y={RULER_Y + 4} textAnchor="start" fontSize={10} fill={INK} fontFamily={FONT}>
          cm
        </text>

        {/* Saw brace */}
        <AnimatePresence>
          {beat.showSawBrace && (
            <motion.g
              key="saw-brace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <MeasureBrace
                x0={xAt(SAW_CM0)}
                x1={xAt(SAW_CM1)}
                y={RULER_Y + 18}
                label="10 cm"
                color={BLUE}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Screwdriver brace */}
        <AnimatePresence>
          {beat.showScrewBrace && (
            <motion.g
              key="screw-brace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <MeasureBrace
                x0={xAt(SDW_CM0)}
                x1={xAt(SDW_CM1)}
                y={RULER_Y + 40}
                label={T('11 − 7 = 4 cm', '11 − 7 = 4 cm')}
                color={GREEN}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Difference annotation */}
        <AnimatePresence>
          {beat.showDiff && (
            <motion.g
              key="diff"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <rect
                x={xAt(SAW_CM0)}
                y={RULER_Y + 65}
                width={xAt(SAW_CM1) - xAt(SAW_CM0)}
                height={26}
                rx={5}
                fill={beat.result ? GREEN_BG : '#EFF6FF'}
                stroke={beat.result ? GREEN : BLUE}
                strokeWidth={1.5}
              />
              <text
                x={(xAt(SAW_CM0) + xAt(SAW_CM1)) / 2}
                y={RULER_Y + 83}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fill={beat.result ? GREEN_INK : BLUE}
                fontFamily={FONT}
              >
                {T('10 − 4 = 6 cm', '10 − 4 = 6 cm')}
              </text>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Result badge */}
        <AnimatePresence>
          {beat.result && (
            <motion.g
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <rect
                x={xAt(SAW_CM1) + 10}
                y={RULER_Y + 62}
                width={70}
                height={30}
                rx={6}
                fill={GREEN}
              />
              <text
                x={xAt(SAW_CM1) + 45}
                y={RULER_Y + 82}
                textAnchor="middle"
                fontSize={14}
                fontWeight={800}
                fill="white"
                fontFamily={FONT}
              >
                {T('A: 6 cm', 'A: 6 cm')}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Caption */}
      <motion.p
        key={beat.phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: 14,
          color: beat.result ? GREEN_INK : INK,
          fontFamily: FONT,
          textAlign: 'center',
          maxWidth: SVG_W,
          margin: 0,
          padding: '0 8px',
        }}
      >
        {beat.caption}
      </motion.p>
    </div>
  )
}
