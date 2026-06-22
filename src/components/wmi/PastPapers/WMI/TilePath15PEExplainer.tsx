import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TileFrame, STAGE_DATA, TILE_FILL, TILE_STROKE, INK, CELL } from './TilePath15PEIllustration'
import { buildTilePath15PESteps } from './tilePath15PESteps'

// IKMC-22-PE-Q15 — tile-path explainer.
// Mirrors the static TilePath15PEIllustration (same TileFrame primitive, same colours)
// and brings it alive beat by beat:
//   0. State the goal.
//   1. Show the outer square dimension (side 7).
//   2. Highlight the border area = 7² − 5² = 24 unit cells.
//   3. Remind that one tile covers 2 unit cells (spotlight side-1 example).
//   4. Divide: 24 ÷ 2 = 12.
//   5. Announce answer C = 12 tiles.

const BLUE = '#30598A'
const ORANGE = '#D97706'
const GREEN = '#10B981'

// Geometry mirrors the static figure (same CELL, same outer sizes)
const outerSideUnits = (inner: number) => inner + 2
const stageSizePx = (inner: number) => outerSideUnits(inner) * CELL
const MAX_STAGE_PX = Math.max(...STAGE_DATA.map((s) => stageSizePx(s.side)))
const GAP = 36
const PAD = 12

const STAGE_SIZES = STAGE_DATA.map((s) => stageSizePx(s.side))
const SVG_W = STAGE_SIZES.reduce((a, b) => a + b, 0) + GAP * (STAGE_DATA.length - 1) + PAD * 2
const SVG_H = MAX_STAGE_PX + 28 + PAD * 2

// Compute x offsets of each stage in the strip
function stageOffsets(): number[] {
  const offsets: number[] = []
  let cursor = PAD
  STAGE_DATA.forEach((s, i) => {
    offsets.push(cursor)
    cursor += STAGE_SIZES[i] + GAP
  })
  return offsets
}
const OFFSETS = stageOffsets()

export default function TilePath15PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTilePath15PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { inner, outer, borderArea, tileArea, answer } = story

  return (
    <div
      className="mx-auto w-full max-w-[460px]"
      role="img"
      aria-label={t(
        `Border area = ${outer}² − ${inner}² = ${borderArea} cells. Each tile covers ${tileArea} cells, so ${borderArea} ÷ ${tileArea} = ${answer} tiles (answer C).`,
        `Luas jalur = ${outer}² − ${inner}² = ${borderArea} kotak. Setiap ubin menutupi ${tileArea} kotak, jadi ${borderArea} ÷ ${tileArea} = ${answer} ubin (jawaban C).`,
      )}
    >
      <div className="flex flex-col items-center gap-3">

        {/* Stage strip — three examples coming alive */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <defs>
            <marker id="tpExArrowR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L6,3 L0,6 Z" fill={ORANGE} />
            </marker>
            <marker id="tpExArrowL" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M6,0 L0,3 L6,6 Z" fill={INK} />
            </marker>
          </defs>

          {STAGE_DATA.map((stage, i) => {
            const ox = OFFSETS[i]
            const sz = STAGE_SIZES[i]
            const focused = beat.focusStage === i
            const highlight = focused && beat.highlightBorder
            const showTiles = stage.tiles > 0

            const tileCountLabel =
              stage.tiles > 0
                ? `${stage.tiles} ${t('tiles', 'ubin')}`
                : beat.result
                  ? `${answer} ${t('tiles', 'ubin')}`
                  : `? ${t('tiles', 'ubin')}`

            return (
              <motion.g
                key={i}
                initial={false}
                animate={{
                  opacity: beat.focusStage === -1 || focused ? 1 : 0.45,
                  scale: focused ? 1.04 : 1,
                }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{ transformOrigin: `${ox + sz / 2}px ${PAD + MAX_STAGE_PX / 2}px` }}
              >
                <TileFrame
                  stage={stage}
                  ox={ox}
                  oy={PAD}
                  showTiles={showTiles}
                  highlightArea={highlight}
                  countLabel={tileCountLabel}
                />
                {/* focus ring */}
                {focused && (
                  <rect
                    x={ox - 5}
                    y={PAD - 5}
                    width={sz + 10}
                    height={sz + 10}
                    rx={6}
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                )}
                {/* side label above */}
                <text
                  x={ox + sz / 2}
                  y={PAD - 4}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontSize={10}
                  fontWeight={700}
                  fill={focused ? ORANGE : INK}
                  className="font-display"
                >
                  {stage.label}
                </text>

                {/* arrow to next stage */}
                {i < STAGE_DATA.length - 1 && (
                  <line
                    x1={ox + sz + 6}
                    y1={PAD + MAX_STAGE_PX / 2}
                    x2={ox + sz + GAP - 6}
                    y2={PAD + MAX_STAGE_PX / 2}
                    stroke={ORANGE}
                    strokeWidth={1.8}
                    markerEnd="url(#tpExArrowR)"
                  />
                )}
              </motion.g>
            )
          })}

          {/* Tile legend — small 2×1 tile shown when phase is 'tile' */}
          {beat.phase === 'tile' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <rect
                x={SVG_W - PAD - CELL * 2}
                y={PAD + MAX_STAGE_PX + 2}
                width={CELL * 2}
                height={CELL}
                fill={TILE_FILL}
                stroke={TILE_STROKE}
                strokeWidth={1}
              />
              <text
                x={SVG_W - PAD - CELL * 2 - 4}
                y={PAD + MAX_STAGE_PX + CELL / 2 + 2}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={9}
                fontWeight={700}
                fill={INK}
                className="font-display"
              >
                {t('1 tile = 2 cells', '1 ubin = 2 kotak')}
              </text>
            </motion.g>
          )}
        </svg>

        {/* Formula meter */}
        {beat.showFormula && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
            style={{ background: '#E1EFFB', borderColor: BLUE, color: BLUE }}
          >
            {beat.phase === 'tile' || beat.phase === 'divide' || beat.phase === 'result'
              ? t(
                  `${outer}² − ${inner}² = ${borderArea} cells ÷ ${tileArea} = ${answer} tiles`,
                  `${outer}² − ${inner}² = ${borderArea} kotak ÷ ${tileArea} = ${answer} ubin`,
                )
              : t(
                  `${outer}² − ${inner}² = ${borderArea} unit cells`,
                  `${outer}² − ${inner}² = ${borderArea} kotak satuan`,
                )}
          </motion.div>
        )}

        {/* Result chip */}
        {beat.result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="rounded-lg border-2 px-4 py-1 text-center font-display text-base font-extrabold"
            style={{ background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }}
          >
            {t(`Answer C = ${answer} tiles`, `Jawaban C = ${answer} ubin`)}
          </motion.div>
        )}

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
