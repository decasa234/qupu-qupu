// SEAMO-16-A-Q10 — animated explainer: minimum flower-petal colouring.
//
// Beats:
//   0. Intro      — uncoloured flower; count 5 petals.
//   1. Try 2      — alternate Red/Green around the ring.
//   2. Conflict   — petal 5 clashes with petal 1 (both Red); highlight in amber.
//   3. Try 3      — assign Blue to petal 5; all checks pass.
//   4. Result     — minimum = 3 colours → answer B.
//
// Imports FlowerPetal and PETAL_COUNT from FlowerPetals16A10Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FlowerPetal, PETAL_COUNT } from './FlowerPetals16A10Illustration'
import {
  buildFlowerPetals16A10Steps,
  COLOR_R,
  COLOR_G,
  COLOR_B,
  COLOR_NONE,
} from './flowerPetals16A10Steps'

// ---------------------------------------------------------------------------
// Layout constants (must match Illustration)
// ---------------------------------------------------------------------------
const CX = 110
const CY = 110
const CENTRE_R = 34
const SVG_SIZE = 220

const PURPLE = '#341857'
const AMBER  = '#F59E0B'
const GREEN  = '#10B981'

// Petal number label positions (placed slightly outside each petal tip)
const LABEL_ORBIT = 96   // distance from centre to label

function petalLabelPos(i: number): { x: number; y: number } {
  const angle = (2 * Math.PI * i) / PETAL_COUNT - Math.PI / 2
  return {
    x: CX + LABEL_ORBIT * Math.cos(angle),
    y: CY + LABEL_ORBIT * Math.sin(angle),
  }
}

// ---------------------------------------------------------------------------
// Legend bar — shows which colour swatch = which number
// ---------------------------------------------------------------------------
function ColorLegend({ lang }: { lang: 'en' | 'id' }) {
  const items = [
    { fill: COLOR_R, label: lang === 'id' ? 'Warna 1 (Merah)' : 'Colour 1 (Red)' },
    { fill: COLOR_G, label: lang === 'id' ? 'Warna 2 (Hijau)' : 'Colour 2 (Green)' },
    { fill: COLOR_B, label: lang === 'id' ? 'Warna 3 (Biru)' : 'Colour 3 (Blue)' },
  ]
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map(({ fill, label }) => (
        <span key={fill} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: PURPLE }}>
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: fill,
              border: '1.5px solid #6B7280',
            }}
          />
          {label}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function FlowerPetals16A10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildFlowerPetals16A10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const conflictSet = new Set(beat.conflictPetals)
  const showLegend  = beat.phase === 'try2' || beat.phase === 'conflict' || beat.phase === 'try3' || beat.phase === 'result'
  const showThird   = beat.phase === 'try3' || beat.phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: warnai 5 kelopak bunga — 2 warna gagal (siklus ganjil) — minimal 3 warna diperlukan → Jawaban B.'
      : 'Explainer: colour 5 petals — 2 colours fail (odd cycle) — minimum 3 colours needed → Answer B.'

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Flower SVG ───────────────────────────────────────────────── */}
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          width="100%"
          style={{ maxWidth: SVG_SIZE }}
          aria-hidden="true"
        >
          {/* Petals */}
          {Array.from({ length: PETAL_COUNT }, (_, i) => {
            const fill    = beat.petalFills[i] ?? COLOR_NONE
            const isConfl = conflictSet.has(i)
            return (
              <g key={i}>
                <FlowerPetal
                  index={i}
                  fill={fill}
                  stroke={isConfl ? AMBER : '#9CA3AF'}
                  strokeWidth={isConfl ? 3.5 : 1.8}
                />
                {/* Amber glow ring on conflict petals */}
                {isConfl && (
                  <FlowerPetal
                    index={i}
                    fill="none"
                    stroke={AMBER}
                    strokeWidth={5}
                    opacity={0.35}
                  />
                )}
                {/* Petal number label */}
                {(() => {
                  const pos = petalLabelPos(i)
                  return (
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight={800}
                      fill={isConfl ? AMBER : PURPLE}
                    >
                      {i + 1}
                    </text>
                  )
                })()}
              </g>
            )
          })}

          {/* Yellow centre */}
          <circle
            cx={CX}
            cy={CY}
            r={CENTRE_R}
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth={2}
          />

          {/* Centre label */}
          {beat.phase === 'intro' && (
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={800}
              fill={PURPLE}
            >
              5
            </text>
          )}

          {/* Tick marks on each petal when 3-colour solution is correct */}
          {(beat.phase === 'try3' || beat.phase === 'result') && (
            Array.from({ length: PETAL_COUNT }, (_, i) => {
              const angle = (2 * Math.PI * i) / PETAL_COUNT - Math.PI / 2
              const tx = CX + 66 * Math.cos(angle)
              const ty = CY + 66 * Math.sin(angle)
              return (
                <text
                  key={i}
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={900}
                  fill={GREEN}
                >
                  ✓
                </text>
              )
            })
          )}
        </svg>

        {/* ── Colour legend ─────────────────────────────────────────── */}
        {showLegend && <ColorLegend lang={lang} />}

        {/* ── Colour count badge ──────────────────────────────────── */}
        {showThird && (
          <div
            className="flex items-center gap-2 rounded-xl border-2 px-4 py-1 font-display text-sm font-extrabold"
            style={{ background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }}
          >
            <span>
              {lang === 'id' ? '3 warna cukup' : '3 colours suffice'}
            </span>
          </div>
        )}

        {/* ── Caption ───────────────────────────────────────────────── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
