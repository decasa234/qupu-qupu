// Post-answer explainer for WMI-24F3A-Q6 (composite rectangle perimeter).
//
// Strategy: walk the perimeter, sum all KNOWN edges (144 cm), subtract from
// 168, split the remainder equally between the two ★ sides → ★ = 12 (D).
//
// The animation reuses CompositeRectFigure from the illustration, adding
// animated edge highlights to show which segments are being counted.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CompositeRectFigure, PX_PER_CM, BOTTOM_W_CM, BOTTOM_H_CM, TOP_W_CM, LEDGE_CM } from './CompositeRect24G3Illustration'
import { buildCompositeRect24G3Steps, type EdgeName } from './compositeRect24G3Steps'

// --- colour tokens (echoing qupu palette + illustration colours) -------------
const BRAND_BLUE = '#30598A'
const BRAND_BLUE_SHADOW = '#263B55'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const HIGHLIGHT = '#F59E0B'  // amber — active edge
const STAR_HIGHLIGHT = '#C026D3' // fuchsia — ★ sides

// --- geometry (mirrors CompositeRect24G3Illustration) -----------------------
const PAD_L = 48
const PAD_T = 36

const bW = BOTTOM_W_CM * PX_PER_CM
const bH = BOTTOM_H_CM * PX_PER_CM
const tW = TOP_W_CM * PX_PER_CM
const STAR_H_CM = 12
const tH = STAR_H_CM * PX_PER_CM
const ledgeW = LEDGE_CM * PX_PER_CM

const originX = PAD_L
const originY = PAD_T + tH
const topX = originX + ledgeW
const topY = PAD_T

// Segment endpoint lookup — each EdgeName maps to [x1,y1, x2,y2]
function segPoints(name: EdgeName): [number, number, number, number] {
  switch (name) {
    case 'bottom':
      return [originX, originY + bH, originX + bW, originY + bH]
    case 'rightBottom':
      return [originX + bW, originY, originX + bW, originY + bH]
    case 'rightLedge':
      return [topX + tW, topY + tH, originX + bW, topY + tH]
    case 'rightStar':
      return [topX + tW, topY, topX + tW, topY + tH]
    case 'top':
      return [topX, topY, topX + tW, topY]
    case 'leftStar':
      return [topX, topY + tH, topX, topY]
    case 'leftLedge':
      return [originX, topY + tH, topX, topY + tH]
    case 'leftBottom':
      return [originX, originY + bH, originX, originY]
  }
}

const STAR_SIDES: EdgeName[] = ['leftStar', 'rightStar']

// Animated highlight overlay on the SVG, showing the active edges.
function EdgeHighlights({ active }: { active: EdgeName[] }) {
  return (
    <>
      {active.map((name) => {
        const [x1, y1, x2, y2] = segPoints(name)
        const isStar = STAR_SIDES.includes(name)
        const color = isStar ? STAR_HIGHLIGHT : HIGHLIGHT
        return (
          <motion.line
            key={name}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 1, pathLength: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          />
        )
      })}
    </>
  )
}

// Running equation display beneath the figure.
function EquationRow({
  runningSum,
  phase,
}: {
  runningSum: number | null
  phase: string
}) {
  if (runningSum === null) return null

  const parts: { text: string; color: string }[] = []

  if (phase === 'edges' && runningSum === 82) {
    parts.push(
      { text: '50', color: BRAND_BLUE },
      { text: ' + ', color: '#6B7280' },
      { text: '22', color: BRAND_BLUE },
      { text: ' + ', color: '#6B7280' },
      { text: '10', color: BRAND_BLUE },
      { text: ' = ', color: '#6B7280' },
      { text: '82', color: HIGHLIGHT },
    )
  } else if (phase === 'edges' && runningSum === 144) {
    parts.push(
      { text: '82', color: BRAND_BLUE },
      { text: ' + 30 + 10 + 22 = ', color: '#6B7280' },
      { text: '144', color: HIGHLIGHT },
    )
  } else if (phase === 'remainder') {
    parts.push(
      { text: '168', color: BRAND_BLUE },
      { text: ' − ', color: '#6B7280' },
      { text: '144', color: BRAND_BLUE },
      { text: ' = ', color: '#6B7280' },
      { text: '24', color: STAR_HIGHLIGHT },
    )
  } else if (phase === 'result') {
    parts.push(
      { text: '24', color: STAR_HIGHLIGHT },
      { text: ' ÷ 2 = ', color: '#6B7280' },
      { text: '12', color: GREEN_INK },
    )
  }

  if (parts.length === 0) return null

  return (
    <motion.div
      key={phase + String(runningSum)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center gap-0 font-display text-xl font-black tabular-nums"
    >
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.color }}>
          {p.text}
        </span>
      ))}
    </motion.div>
  )
}

export default function CompositeRect24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCompositeRect24G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Strategy: walk the perimeter and add every known edge (144 cm), then subtract from 168 cm. Two ★ sides share 24 cm, so ★ = 12. Answer D.',
    'Strategi: jalan mengelilingi dan jumlahkan semua tepi yang diketahui (144 cm), lalu kurangi dari 168 cm. Dua sisi ★ berbagi 24 cm, jadi ★ = 12. Jawaban D.',
  )

  const PAD_R = 56
  const PAD_B = 32
  const svgW = PAD_L + bW + PAD_R
  const svgH = PAD_T + tH + bH + PAD_B

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="flex min-h-[320px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: '#FFF9F4', borderColor: '#FFD3B1' }}
      >
        {/* header banner */}
        <div
          className="relative flex w-full max-w-[340px] items-center justify-center gap-2 overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_BLUE_SHADOW }}
          />
          <span
            className="relative font-display text-sm font-extrabold"
            style={{ color: '#FFF2DF' }}
          >
            {t('Perimeter = 168 cm → find ★', 'Keliling = 168 cm → cari ★')}
          </span>
        </div>

        {/* figure with edge highlights overlaid */}
        <div className="relative w-full" style={{ maxWidth: Math.min(300, svgW) + 'px', margin: '0 auto' }}>
          <CompositeRectFigure showStarValue={beat.starValue ?? undefined} />

          {/* overlay SVG for edge highlights, perfectly sized and positioned */}
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            width={Math.min(300, svgW)}
            style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}
            aria-hidden="true"
          >
            <EdgeHighlights active={beat.highlight} />
          </svg>
        </div>

        {/* running equation */}
        <div className="min-h-[2rem] flex items-center justify-center w-full">
          <EquationRow runningSum={beat.runningSum} phase={beat.phase} />
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
