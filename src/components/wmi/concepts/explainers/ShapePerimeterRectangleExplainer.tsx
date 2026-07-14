import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildRectPerimeterSteps } from './rectPerimeterSteps'
import { useBeatControl } from './useBeatControl'

const BLUE_OUTLINE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'

// Map pixel value from domain [2,15] → [52, 160]
function domainToPx(v: number): number {
  return 52 + (160 - 52) * ((Math.max(2, Math.min(15, v)) - 2) / 13)
}

export default function ShapePerimeterRectangleExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { w: number; h: number }
  const story = useMemo(
    () => buildRectPerimeterSteps(p?.w, p?.h, lang),
    [p?.w, p?.h, lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { w, h } = story

  // SVG layout — keep rect centered in a fixed 280×220 viewBox
  const rw = domainToPx(w)
  const rh = domainToPx(h)
  const vbW = 280
  const vbH = 220
  const rx = (vbW - rw) / 2
  const ry = (vbH - rh) / 2

  // Corners: top-left → top-right → bottom-right → bottom-left
  const tl: [number, number] = [rx, ry]
  const tr: [number, number] = [rx + rw, ry]
  const br: [number, number] = [rx + rw, ry + rh]
  const bl: [number, number] = [rx, ry + rh]

  // Each edge as an SVG <line> — top(w), right(h), bottom(w), left(h)
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number; label: string }> = [
    { x1: tl[0], y1: tl[1], x2: tr[0], y2: tr[1], label: `${w}` },
    { x1: tr[0], y1: tr[1], x2: br[0], y2: br[1], label: `${h}` },
    { x1: br[0], y1: br[1], x2: bl[0], y2: bl[1], label: `${w}` },
    { x1: bl[0], y1: bl[1], x2: tl[0], y2: tl[1], label: `${h}` },
  ]

  // Label positions relative to each edge
  const labelPositions = [
    { x: rx + rw / 2, y: ry - 10, anchor: 'middle' as const },         // top
    { x: rx + rw + 14, y: ry + rh / 2, anchor: 'middle' as const },    // right
    { x: rx + rw / 2, y: ry + rh + 20, anchor: 'middle' as const },    // bottom
    { x: rx - 14, y: ry + rh / 2, anchor: 'middle' as const },         // left
  ]

  const traced = beat.edgesTraced
  const isResult = beat.result

  const ariaLabel =
    lang === 'id'
      ? `Cara menghitung keliling persegi panjang ${w} × ${h}: telusuri keempat sisinya lalu jumlahkan.`
      : `Strategy to find the perimeter of a ${w}×${h} rectangle: trace all four sides and add them up.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* SVG rectangle */}
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          width={vbW}
          height={vbH}
          style={{ maxWidth: '100%' }}
          aria-hidden="true"
        >
          {/* Ghost outline (full rect, muted) */}
          <rect
            x={rx}
            y={ry}
            width={rw}
            height={rh}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={4}
          />

          {/* Animated traced edges */}
          {edges.map((edge, i) => {
            const isActive = i < traced
            const isJustTraced = i === traced - 1
            return (
              <motion.line
                key={i}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={isActive ? ORANGE : 'transparent'}
                strokeWidth={6}
                strokeLinecap="round"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  pathLength: isActive ? 1 : 0,
                }}
                transition={
                  isJustTraced
                    ? { duration: 0.35, ease: 'easeOut' }
                    : { duration: 0 }
                }
              />
            )
          })}

          {/* Dimension labels — show for traced edges, orange; ghost for untraced */}
          {edges.map((edge, i) => {
            const isActive = i < traced
            const pos = labelPositions[i]
            const isLeftOrRight = i === 1 || i === 3
            return (
              <text
                key={`lbl-${i}`}
                x={pos.x}
                y={pos.y}
                textAnchor={pos.anchor}
                dominantBaseline="middle"
                fontSize={13}
                fontWeight="bold"
                fontFamily="Nunito, sans-serif"
                fill={isActive ? ORANGE : '#CBD5E1'}
                transform={isLeftOrRight ? `rotate(-90 ${pos.x} ${pos.y})` : undefined}
              >
                {edge.label} cm
              </text>
            )
          })}

          {/* Running total badge — appear after at least 1 edge traced */}
          {traced > 0 && (
            <motion.g
              key={`total-${traced}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
              style={{ transformOrigin: `${vbW / 2}px ${ry + rh / 2}px` }}
            >
              <rect
                x={vbW / 2 - 38}
                y={ry + rh / 2 - 18}
                width={76}
                height={36}
                rx={8}
                fill={isResult ? '#D1FAE5' : '#E1EFFB'}
                stroke={isResult ? GREEN : BLUE_OUTLINE}
                strokeWidth={2}
              />
              <text
                x={vbW / 2}
                y={ry + rh / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={15}
                fontWeight="bold"
                fontFamily="Nunito, sans-serif"
                fill={isResult ? '#065F46' : BLUE_OUTLINE}
              >
                {beat.running} cm
              </text>
            </motion.g>
          )}
        </svg>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE_OUTLINE, color: BLUE_OUTLINE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
