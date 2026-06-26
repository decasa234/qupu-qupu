// RectPolySIMOC19G4Q25Explainer — SIMOC-19-G4-Q25 post-answer explainer.
//
// Walks through:
//   0  bare polygon (intro)
//   1  highlight b,d,f,h orange → horizontal constraint b=d+f+h
//   2  highlight a,c,e,g blue  → vertical constraint c=a+e-g
//   3  3-rectangle decomposition overlay (formula)
//   4  optimal assignment values (a=7,b=8,c=6,d=2,e=3,f=1,g=4,h=5)
//   5  calculation → 50

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  POLY_PTS,
  SIDE_LABELS,
} from './RectPolySIMOC19G4Q25Illustration'
import { buildRectPolySIMOC19G4Q25Steps } from './rectPolySIMOC19G4Q25Steps'

// ── colours ──────────────────────────────────────────────────────────────────
const ORANGE     = '#F59E0B'
const BLUE       = '#3B82F6'
const GREEN      = '#10B981'
const AMBER_FILL = '#FEF3C7'
const BLUE_FILL  = '#DBEAFE'
const GREEN_FILL = '#D1FAE5'
const RESULT_CLR = '#065F46'

// ── geometry ─────────────────────────────────────────────────────────────────
const VBW = 230
const VBH = 230

// Optimal value assignments
const ASSIGN: Record<string, number> = { a: 7, b: 8, c: 6, d: 2, e: 3, f: 1, g: 4, h: 5 }

// Which sides are horizontal vs vertical
const H_SIDES = new Set(['b', 'd', 'f', 'h'])
const V_SIDES = new Set(['a', 'c', 'e', 'g'])

// Edge segments for highlight lines [x1, y1, x2, y2, label]
function edgeCoords(): { label: string; x1: number; y1: number; x2: number; y2: number }[] {
  const edges = [
    { label: 'a', fi: 0, ti: 1 },
    { label: 'h', fi: 1, ti: 2 },
    { label: 'g', fi: 2, ti: 3 },
    { label: 'f', fi: 3, ti: 4 },
    { label: 'e', fi: 4, ti: 5 },
    { label: 'd', fi: 5, ti: 6 },
    { label: 'c', fi: 6, ti: 7 },
    { label: 'b', fi: 7, ti: 0 },
  ]
  return edges.map(({ label, fi, ti }) => ({
    label,
    x1: POLY_PTS[fi][0],
    y1: POLY_PTS[fi][1],
    x2: POLY_PTS[ti][0],
    y2: POLY_PTS[ti][1],
  }))
}

// ── component ─────────────────────────────────────────────────────────────────

export default function RectPolySIMOC19G4Q25Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRectPolySIMOC19G4Q25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const edges = useMemo(edgeCoords, [])
  const pts = POLY_PTS.map(([x, y]) => `${x},${y}`).join(' ')

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: poligon persegi panjang sisi a–h, tetapkan 1–8 untuk luas maksimal 50.'
      : 'Explainer: rectilinear polygon sides a–h, assign 1–8 for maximum area 50.'

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* SVG figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <svg
            viewBox={`0 0 ${VBW} ${VBH}`}
            width={VBW}
            height={VBH}
            role="presentation"
            style={{ display: 'block' }}
          >
            {/* ── Layer 0: formula decomposition rectangles ── */}
            {beat.showFormula && (
              <motion.g
                key="formula"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
              >
                {/* Lower strip: b(a-g), x=20..200, y=90..200 */}
                <rect x={20} y={90} width={180} height={110} fill={GREEN_FILL} fillOpacity={0.7} />
                {/* Upper right: g·h, x=120..200, y=20..90 */}
                <rect x={120} y={20} width={80} height={70} fill={BLUE_FILL} fillOpacity={0.8} />
                {/* Left ear: d·e, x=20..80, y=55..90 */}
                <rect x={20} y={55} width={60} height={35} fill={AMBER_FILL} fillOpacity={0.9} />
                {/* Labels inside rectangles */}
                <text x={110} y={155} textAnchor="middle" fontSize={11} fontWeight={700} fill="#065F46" fontFamily="sans-serif">b·(a−g)</text>
                <text x={160} y={59}  textAnchor="middle" fontSize={11} fontWeight={700} fill={BLUE}  fontFamily="sans-serif">g·h</text>
                <text x={50}  y={76}  textAnchor="middle" fontSize={11} fontWeight={700} fill="#92400E" fontFamily="sans-serif">d·e</text>
              </motion.g>
            )}

            {/* ── Layer 1: base polygon (always visible) ── */}
            <polygon
              points={pts}
              fill="none"
              stroke="#1E3A5F"
              strokeWidth={2.5}
              strokeLinejoin="miter"
            />

            {/* ── Layer 2: highlighted edges ── */}
            {(beat.highlightH || beat.highlightV) && (
              <motion.g
                key={`hl-${beat.phase}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {edges.map(({ label, x1, y1, x2, y2 }) => {
                  const isH = H_SIDES.has(label) && beat.highlightH
                  const isV = V_SIDES.has(label) && beat.highlightV
                  if (!isH && !isV) return null
                  return (
                    <line
                      key={label}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isH ? ORANGE : BLUE}
                      strokeWidth={5}
                      strokeLinecap="round"
                      opacity={0.75}
                    />
                  )
                })}
              </motion.g>
            )}

            {/* ── Layer 3: vertex dots ── */}
            {POLY_PTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3.5} fill="#1E3A5F" />
            ))}

            {/* ── Layer 4: side labels ── */}
            {SIDE_LABELS.map(({ id, x, y, anchor }) => {
              const showVal = beat.showAssign
              const val = ASSIGN[id]
              return (
                <g key={id}>
                  <text
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    fontSize={15}
                    fontStyle="italic"
                    fontFamily="Georgia, 'Times New Roman', serif"
                    fill="#1E3A5F"
                    fontWeight={700}
                  >
                    {id}
                  </text>
                  {showVal && (
                    <motion.text
                      key={`val-${id}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      x={x}
                      y={y + 14}
                      textAnchor={anchor}
                      fontSize={12}
                      fontWeight={800}
                      fill={beat.result ? RESULT_CLR : GREEN}
                      fontFamily="sans-serif"
                    >
                      ={val}
                    </motion.text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Answer badge (result beat only) */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-4xl font-black tabular-nums"
            style={{ color: RESULT_CLR }}
          >
            50
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: RESULT_CLR }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
