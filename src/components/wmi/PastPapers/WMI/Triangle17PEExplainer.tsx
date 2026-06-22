// IKMC-23-PE-Q17 — post-answer explainer: triangle tiling to form a hexagon.
//
// Reuses StemTriangle from Triangle17PEIllustration.
// Animation beats (from triangle17PESteps):
//   0. intro   — stem triangle; identify the midpoint subdivision.
//   1. tile    — 2 of 6 sectors filled in the hexagon outline.
//   2. count   — all 6 sectors filled → complete hexagon.
//   3. option  — option A highlighted as the correct match.
//   4. result  — answer A confirmed.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StemTriangle } from './Triangle17PEIllustration'
import { buildTriangle17PESteps } from './triangle17PESteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const AMBER      = '#F59E0B'
const AMBER_BG   = '#FEF3C7'
const FILL       = '#F5C5B0'
const STROKE     = '#6B3020'
const SW         = 1.5
const ISW        = 1.0

// ── Geometry helpers ──────────────────────────────────────────────────────────
type Pt = { x: number; y: number }
function pt(x: number, y: number): Pt { return { x, y } }
function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}
function ptStr(p: Pt) { return `${p.x},${p.y}` }
function polyStr(pts: Pt[]) { return pts.map(ptStr).join(' ') }

function hexVertex(cx: number, cy: number, r: number, k: number): Pt {
  const a = (Math.PI / 3) * k - Math.PI / 2
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

// ── Progressive hexagon: fills sectorsShown out of 6 ─────────────────────────
interface ProgressHexProps {
  cx: number
  cy: number
  r: number
  sectorsShown: number
}

function ProgressHex({ cx, cy, r, sectorsShown }: ProgressHexProps) {
  const verts = Array.from({ length: 6 }, (_, k) => hexVertex(cx, cy, r, k))
  const center = pt(cx, cy)

  return (
    <g>
      {/* Outline always visible */}
      <polygon
        points={polyStr(verts)}
        fill="#F3F4F6"
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      {/* Fill sectors one by one */}
      {verts.map((v, k) => {
        const v2      = verts[(k + 1) % 6]
        const filled  = k < sectorsShown
        const M_cv    = lerp(center, v, 0.5)
        const M_vv2   = lerp(v, v2, 0.5)
        const M_v2c   = lerp(v2, center, 0.5)
        return (
          <g key={k}>
            {/* Sector fill */}
            <polygon
              points={polyStr([center, v, v2])}
              fill={filled ? FILL : 'none'}
            />
            {/* Sector border */}
            <line x1={center.x} y1={center.y} x2={v.x} y2={v.y}
              stroke={STROKE} strokeWidth={SW} />
            {/* Midpoint lines (only in filled sectors) */}
            {filled && (
              <>
                <line x1={M_cv.x}  y1={M_cv.y}  x2={M_vv2.x} y2={M_vv2.y} stroke={STROKE} strokeWidth={ISW} />
                <line x1={M_vv2.x} y1={M_vv2.y} x2={M_v2c.x} y2={M_v2c.y} stroke={STROKE} strokeWidth={ISW} />
                <line x1={M_v2c.x} y1={M_v2c.y} x2={M_cv.x}  y2={M_cv.y}  stroke={STROKE} strokeWidth={ISW} />
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}

// ── The explainer ─────────────────────────────────────────────────────────────

/**
 * Triangle17PEExplainer — post-answer walkthrough for IKMC-23-PE-Q17.
 *
 * Beats:
 *   0 (intro)   — stem triangle; midpoint subdivision identified.
 *   1 (tile)    — 2/6 sectors placed.
 *   2 (count)   — 6/6 sectors placed → complete hexagon.
 *   3 (option)  — option A highlighted as correct.
 *   4 (result)  — answer A confirmed.
 */
export default function Triangle17PEExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildTriangle17PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const showStem   = beat.phase === 'intro'
  const showHex    = beat.phase !== 'intro'
  const captionBg  = beat.result
    ? { background: GREEN_BG, borderColor: GREEN,  color: GREEN_TEXT }
    : { background: BLUE_BG,  borderColor: BLUE,   color: '#1E3A5F' }
  const eqBg = beat.focusCorrect
    ? { background: GREEN_BG,  borderColor: GREEN,  color: GREEN_TEXT }
    : { background: AMBER_BG,  borderColor: AMBER,  color: '#92400E' }

  const ariaLabel = lang === 'id'
    ? 'Penjelasan: 6 segitiga identik bersubdivisi X disusun mengelilingi titik pusat membentuk segi enam — jawaban A.'
    : 'Explainer: 6 identical X-subdivided triangles arranged around a centre point form a regular hexagon — answer A.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Visual: stem triangle (intro beat) or progressive hexagon (other beats) */}
        {showStem && (
          <svg viewBox="0 0 120 110" width={130} style={{ display: 'block' }} aria-hidden="true">
            <StemTriangle cx={60} cy={52} side={96} />
          </svg>
        )}
        {showHex && (
          <svg viewBox="0 0 110 110" width={150} style={{ display: 'block' }} aria-hidden="true">
            <ProgressHex cx={55} cy={55} r={48} sectorsShown={beat.sectorsShown} />
          </svg>
        )}

        {/* Equation chip */}
        {beat.equation !== '' && (
          <div
            className="rounded-full border-2 px-4 py-1 text-center font-display text-sm font-extrabold"
            style={beat.focusOption || beat.focusCorrect ? eqBg : { background: '#F3F4F6', borderColor: '#9CA3AF', color: '#374151' }}
          >
            {beat.equation}
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionBg}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
