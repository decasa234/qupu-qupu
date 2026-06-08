import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildShapeTransformSteps } from './shapeTransformSteps'
import type { ShapeTransformParams } from './shapeTransformSteps'
import { useBeatControl } from './useBeatControl'

// ─── constants ───────────────────────────────────────────────────────────────

const SVG_SIZE = 200
const CX = SVG_SIZE / 2   // 100
const CY = SVG_SIZE / 2   // 100

const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'
const ORANGE = '#F97316'

// ─── shape path helpers ───────────────────────────────────────────────────────

/**
 * Returns the SVG `d` path for the given shape glyph, centered at (CX, CY).
 * The shapes are deliberately asymmetric (arrow / pointing triangle) so
 * rotation and flipping are clearly visible.
 */
function shapePathFor(glyph: string): string | null {
  const R = 60

  if (glyph === '▲') {
    // Upward-pointing arrow with a notched tail (clearly asymmetric so turn is visible).
    // Tip at top, two shoulder points, notch, two base corners.
    const tipX = CX
    const tipY = CY - R
    const shoulderW = 28
    const shoulderY = CY + 10
    const notchDepth = 18
    const baseY = CY + R
    const baseHW = 18
    return [
      `M ${tipX} ${tipY}`,
      `L ${CX + shoulderW} ${shoulderY}`,
      `L ${CX + baseHW} ${shoulderY}`,
      `L ${CX + baseHW} ${baseY}`,
      `L ${CX} ${baseY - notchDepth}`,
      `L ${CX - baseHW} ${baseY}`,
      `L ${CX - baseHW} ${shoulderY}`,
      `L ${CX - shoulderW} ${shoulderY}`,
      'Z',
    ].join(' ')
  }

  if (glyph === '▶') {
    // Right-pointing arrow with notched left tail.
    const tipX = CX + R
    const tipY = CY
    const shoulderH = 28
    const shoulderX = CX - 10
    const notchDepth = 18
    const baseX = CX - R
    const baseHH = 18
    return [
      `M ${tipX} ${tipY}`,
      `L ${shoulderX} ${CY + shoulderH}`,
      `L ${shoulderX} ${CY + baseHH}`,
      `L ${baseX} ${CY + baseHH}`,
      `L ${baseX + notchDepth} ${CY}`,
      `L ${baseX} ${CY - baseHH}`,
      `L ${shoulderX} ${CY - baseHH}`,
      `L ${shoulderX} ${CY - shoulderH}`,
      'Z',
    ].join(' ')
  }

  if (glyph === '■') {
    // Square (symmetric — transform has no visual change, but animate it anyway)
    const half = R * 0.75
    return [
      `M ${CX - half} ${CY - half}`,
      `L ${CX + half} ${CY - half}`,
      `L ${CX + half} ${CY + half}`,
      `L ${CX - half} ${CY + half}`,
      'Z',
    ].join(' ')
  }

  // Result glyphs (▼ / ◀) — these only appear in the result beat as a static
  // glyph in the SVG, so we draw them directly.
  if (glyph === '▼') {
    const tipX = CX
    const tipY = CY + R
    const shoulderW = 28
    const shoulderY = CY - 10
    const notchDepth = 18
    const baseY = CY - R
    const baseHW = 18
    return [
      `M ${tipX} ${tipY}`,
      `L ${CX + shoulderW} ${shoulderY}`,
      `L ${CX + baseHW} ${shoulderY}`,
      `L ${CX + baseHW} ${baseY}`,
      `L ${CX} ${baseY + notchDepth}`,
      `L ${CX - baseHW} ${baseY}`,
      `L ${CX - baseHW} ${shoulderY}`,
      `L ${CX - shoulderW} ${shoulderY}`,
      'Z',
    ].join(' ')
  }

  if (glyph === '◀') {
    const tipX = CX - R
    const tipY = CY
    const shoulderH = 28
    const shoulderX = CX + 10
    const notchDepth = 18
    const baseX = CX + R
    const baseHH = 18
    return [
      `M ${tipX} ${tipY}`,
      `L ${shoulderX} ${CY + shoulderH}`,
      `L ${shoulderX} ${CY + baseHH}`,
      `L ${baseX} ${CY + baseHH}`,
      `L ${baseX - notchDepth} ${CY}`,
      `L ${baseX} ${CY - baseHH}`,
      `L ${shoulderX} ${CY - baseHH}`,
      `L ${shoulderX} ${CY - shoulderH}`,
      'Z',
    ].join(' ')
  }

  return null
}

// ─── component ────────────────────────────────────────────────────────────────

export default function ShapeTransformationRuleExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as ShapeTransformParams

  const story = useMemo(
    () => buildShapeTransformSteps(p.shape, p.transform, lang),
    [p.shape, p.transform, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const isTransform = beat.phase === 'transform'

  // The source shape path (used on beats 0 and 1)
  const sourcePath = useMemo(() => shapePathFor(p.shape ?? ''), [p.shape])
  // The result shape path (used on beat 2)
  const resultPath = useMemo(() => shapePathFor(story.resultGlyph), [story.resultGlyph])

  const fillColor = isResult ? GREEN_BORDER : BLUE_BORDER
  const strokeColor = isResult ? '#065F46' : '#1d3d63'

  // Bilingual aria label
  const ariaLabel =
    lang === 'id'
      ? `Aturan bentuk: ${p.shape ?? ''} diubah dengan ${p.transform === 'turn' ? 'putar' : 'balik'} menjadi ${story.resultGlyph}`
      : `Shape rule: apply ${p.transform} to ${p.shape ?? ''} — result is ${story.resultGlyph}`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          width={SVG_SIZE}
          height={SVG_SIZE}
          className="overflow-visible"
          aria-hidden="true"
        >
          {/* ── Result beat: static result glyph ── */}
          {isResult && resultPath && (
            <motion.path
              key="result-shape"
              d={resultPath}
              fill={GREEN_BORDER}
              stroke="#065F46"
              strokeWidth={2.5}
              strokeLinejoin="round"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              style={{ transformBox: 'view-box', transformOrigin: `${CX}px ${CY}px` }}
            />
          )}

          {/* ── Non-result beats: source shape with animation ── */}
          {!isResult && sourcePath && (
            <motion.path
              key="source-shape"
              d={sourcePath}
              fill={isTransform ? ORANGE : fillColor}
              stroke={isTransform ? '#9a3412' : strokeColor}
              strokeWidth={2.5}
              strokeLinejoin="round"
              /* Turn: animate rotate 0→90deg */
              animate={
                isTransform && p.transform === 'turn'
                  ? { rotate: 90 }
                  : isTransform && p.transform === 'flip'
                    ? { scaleX: -1 }
                    : { rotate: 0, scaleX: 1 }
              }
              initial={false}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              style={{ transformBox: 'view-box', transformOrigin: `${CX}px ${CY}px` }}
            />
          )}

          {/* ── Transform beat: direction indicator arrow ── */}
          {isTransform && !isResult && (
            <motion.g
              key="transform-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {p.transform === 'turn' ? (
                /* Clockwise arc arrow in top-right corner */
                <>
                  <path
                    d="M 150 35 A 20 20 0 0 1 175 60"
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                  {/* Arrowhead at end of arc */}
                  <polygon points="172,68 178,56 184,64" fill={ORANGE} />
                </>
              ) : (
                /* Horizontal double-headed arrow for flip */
                <>
                  <line x1={20} y1={15} x2={180} y2={15} stroke={ORANGE} strokeWidth={3} strokeLinecap="round" />
                  <polygon points="12,15 24,10 24,20" fill={ORANGE} />
                  <polygon points="188,15 176,10 176,20" fill={ORANGE} />
                </>
              )}
            </motion.g>
          )}
        </svg>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
