// IKMC-20-EC-Q10 — post-answer explainer: "What does Loes see looking from above?"
//
// Animation beats:
//   0. intro    — 3D pyramid, no annotations
//   1. base     — highlight the square base outline in blue
//   2. laterals — show the 4 lateral edges folding down as diagonals
//   3. result   — reveal the correct top-view diagram (answer C)
//
// Reuses PyramidSolid from Pyramid10ECIllustration.
// Pure SVG + framer-motion, SSR-safe.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PyramidSolid } from './Pyramid10ECIllustration'
import { buildPyramid10ECSteps } from './pyramid10ECSteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const INK        = '#1F2937'

// ---------------------------------------------------------------------------
// Top-view SVG  (rendered once the result beat hits)
// Matches Option C exactly: square with 2 diagonals, backslash has double-line
// ---------------------------------------------------------------------------

function TopViewFinal() {
  // Same coords as TopViewDiagram in the illustration
  const SQ = 48, CTR = 64
  const TL = { x: CTR - SQ, y: CTR - SQ }
  const TR = { x: CTR + SQ, y: CTR - SQ }
  const BL = { x: CTR - SQ, y: CTR + SQ }
  const BR = { x: CTR + SQ, y: CTR + SQ }
  const MID = { x: CTR, y: CTR }

  // D1 backslash: TL→BR
  // D2 slash: BL→TR
  // Double-line offset for D1 (answer C): +3 px to the right (offsetSide right)
  const off = 3
  // Perpendicular of TL→BR direction: direction = (1,1)/√2, perp-right = (1,-1)/√2
  const px = off * (1 / Math.SQRT2)
  const py = off * (-1 / Math.SQRT2)

  return (
    <svg
      viewBox={`0 0 ${CTR * 2} ${CTR * 2}`}
      width={100}
      height={100}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Square */}
      <rect
        x={TL.x} y={TL.y}
        width={SQ * 2} height={SQ * 2}
        fill="white"
        stroke={GREEN}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* D2 slash (single/faint) */}
      <line x1={BL.x} y1={BL.y} x2={TR.x} y2={TR.y} stroke="#B0C4D8" strokeWidth={1.5} strokeLinecap="round" />
      {/* D1 backslash (primary) */}
      <line x1={TL.x} y1={TL.y} x2={BR.x} y2={BR.y} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      {/* D1 double-line offset */}
      <line
        x1={TL.x + px} y1={TL.y + py}
        x2={BR.x + px} y2={BR.y + py}
        stroke={INK} strokeWidth={1.6} strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx={MID.x} cy={MID.y} r={4} fill={INK} />
      {/* Corner dots */}
      {[TL, TR, BL, BR].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={INK} />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function Pyramid10ECExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildPyramid10ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampilan dari atas piramida persegi adalah persegi dengan dua garis diagonal — jawaban C.'
      : 'Explainer: the top-down view of a square pyramid is a square with both diagonals — answer C.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D pyramid + optional annotation overlays */}
        <div
          className="relative overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
          style={{ width: 220 }}
        >
          <PyramidSolid />

          {/* Base highlight overlay */}
          <AnimatePresence>
            {beat.showBase && (
              <motion.div
                key="base-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: BLUE,
                  pointerEvents: 'none',
                }}
              >
                {lang === 'id' ? 'Alas persegi' : 'Square base'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lateral edges label overlay */}
          <AnimatePresence>
            {beat.showLaterals && (
              <motion.div
                key="laterals-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: 6,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#B45309',
                  pointerEvents: 'none',
                }}
              >
                {lang === 'id' ? '4 sisi lateral → diagonal' : '4 lateral edges → diagonals'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Arrow + top-view reveal */}
        <AnimatePresence>
          {beat.showTopView && (
            <motion.div
              key="top-view"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="font-display text-xs font-bold"
                style={{ color: BLUE }}
              >
                {lang === 'id' ? 'Tampilan dari atas:' : 'Top-down view:'}
              </span>
              <div
                className="overflow-hidden rounded-lg border-2 bg-white p-2"
                style={{ borderColor: GREEN }}
              >
                <TopViewFinal />
              </div>
              <span
                className="font-display text-base font-extrabold"
                style={{ color: GREEN_TEXT }}
              >
                C
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
              : { background: BLUE_BG,  borderColor: BLUE,  color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
