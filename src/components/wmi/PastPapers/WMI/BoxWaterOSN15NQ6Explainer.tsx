// BoxWaterOSN15NQ6Explainer — OSN-15-SD-NAS-Q6
//
// Animated explainer for the box-water tipping problem.
// Reuses BoxWaterFigure from the illustration so the animation reads
// as the static scene coming alive.
//
// Beat sequence:
//   0. intro   — both boxes as in the illustration.
//   1. volume  — glow upright water, show 10×10×32 = 3200 cm³.
//   2. base    — amber overlay on lying box, show 10×40 = 400 cm².
//   3. height  — reveal water at 8 cm in lying box.
//   4. result  — green 8 cm answer.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BoxWaterFigure,
  SVG_W, SVG_H,
  UPR, LIE,
  UPRWATER, LIEWATER,
  DEP, COLOR,
} from './BoxWaterOSN15NQ6Illustration'
import { buildBoxWaterOSN15NQ6Steps } from './boxWaterOSN15NQ6Steps'

const GREEN  = '#10B981'
const AMBER  = '#F59E0B'

export default function BoxWaterOSN15NQ6Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const isId = lang === 'id'

  const story = useMemo(() => buildBoxWaterOSN15NQ6Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { x: ux, y: uy, w: uw, h: uh } = UPR
  const { x: lx, y: ly, w: lw, h: lh } = LIE
  const bracketX = ux + uw + DEP.x + 5

  const captionStyle = beat.result
    ? { background: '#D1FAE5', borderColor: GREEN,   color: '#065F46' }
    : { background: '#EFF6FF', borderColor: '#3B82F6', color: '#1E40AF' }

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="flex flex-col items-center gap-3">

        {/* ── SVG figure ──────────────────────────────────────────────── */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* ── Upright box ─────────────────────────────────────────── */}
          <BoxWaterFigure
            x={ux} y={uy} w={uw} h={uh}
            waterH={UPRWATER}
            waterColor={beat.highlightUprightWater ? AMBER : COLOR.water}
          />

          {/* Amber glow overlay on upright water */}
          <AnimatePresence>
            {beat.highlightUprightWater && (
              <motion.rect
                key="upright-glow"
                x={ux} y={uy + uh - UPRWATER} width={uw} height={UPRWATER}
                fill={AMBER} opacity={0}
                animate={{ opacity: 0.22 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          {/* "40 cm" height label (left, rotated) */}
          <text
            x={ux - 18} y={uy + uh / 2 + 4}
            textAnchor="middle" fontSize={11} fill={COLOR.dim}
            transform={`rotate(-90,${ux - 18},${uy + uh / 2 + 4})`}
          >40 cm</text>
          {/* "10 cm" width label */}
          <text x={ux + uw / 2} y={uy + uh + 14}
            textAnchor="middle" fontSize={11} fill={COLOR.dim}>10 cm</text>
          {/* "32 cm" water bracket */}
          <line x1={bracketX} y1={uy + uh - UPRWATER}
                x2={bracketX} y2={uy + uh}
            stroke={COLOR.dim} strokeWidth={1} />
          <line x1={bracketX - 3} y1={uy + uh - UPRWATER}
                x2={bracketX + 3} y2={uy + uh - UPRWATER}
            stroke={COLOR.dim} strokeWidth={1} />
          <line x1={bracketX - 3} y1={uy + uh}
                x2={bracketX + 3} y2={uy + uh}
            stroke={COLOR.dim} strokeWidth={1} />
          <text x={bracketX + 6} y={uy + uh - UPRWATER / 2 + 4}
            fontSize={11} fill={COLOR.label} fontWeight="600">32 cm</text>
          {/* position label */}
          <text x={ux + uw / 2} y={uy + uh + 28}
            textAnchor="middle" fontSize={11} fill={COLOR.label} fontStyle="italic">
            {isId ? 'Posisi berdiri' : 'Upright'}
          </text>

          {/* ── Arrow ──────────────────────────────────────────────── */}
          <text x={186} y={98} textAnchor="middle" fontSize={26} fill="#94A3B8">→</text>

          {/* ── Lying box ───────────────────────────────────────────── */}
          <BoxWaterFigure
            x={lx} y={ly} w={lw} h={lh}
            waterH={beat.showLieWater ? LIEWATER : 0}
            waterColor={beat.showResult ? GREEN : COLOR.water}
            questionMark={!beat.showLieWater}
            highlightBase={beat.highlightLieBase}
          />

          {/* "40 cm" width label */}
          <text x={lx + lw / 2} y={ly + lh + 14}
            textAnchor="middle" fontSize={11} fill={COLOR.dim}>40 cm</text>
          {/* "10 cm" height label (left, rotated) */}
          <text
            x={lx - 18} y={ly + lh / 2 + 4}
            textAnchor="middle" fontSize={11} fill={COLOR.dim}
            transform={`rotate(-90,${lx - 18},${ly + lh / 2 + 4})`}
          >10 cm</text>
          {/* position label */}
          <text x={lx + lw / 2} y={ly + lh + 28}
            textAnchor="middle" fontSize={11} fill={COLOR.label} fontStyle="italic">
            {isId ? 'Posisi rebah' : 'On its side'}
          </text>

          {/* "8 cm" answer label on lying box */}
          <AnimatePresence>
            {beat.showLieWater && (
              <motion.text
                key="answer-label"
                x={lx + lw + DEP.x + 11} y={ly + lh / 2 + 4}
                fontSize={12} fontWeight="700"
                fill={beat.showResult ? GREEN : COLOR.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                8 cm
              </motion.text>
            )}
          </AnimatePresence>

          {/* Base area label inside lying box on highlight */}
          <AnimatePresence>
            {beat.highlightLieBase && (
              <motion.text
                key="base-label"
                x={lx + lw / 2} y={ly + lh / 2 + 6}
                textAnchor="middle" fontSize={11} fontWeight="bold" fill={AMBER}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                10 × 40
              </motion.text>
            )}
          </AnimatePresence>
        </svg>

        {/* ── Equation bar ────────────────────────────────────────────── */}
        {beat.equation && (
          <div style={{
            fontSize: 16, fontWeight: 700, color: beat.result ? GREEN : '#1E293B',
            textAlign: 'center', padding: '2px 0',
          }}>
            {beat.equation}
          </div>
        )}

        {/* ── Caption ─────────────────────────────────────────────────── */}
        <div style={{
          ...captionStyle,
          fontSize: 13, textAlign: 'center',
          padding: '8px 14px', borderRadius: 8,
          border: `1.5px solid ${captionStyle.borderColor}`,
          maxWidth: 400,
        }}>
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
