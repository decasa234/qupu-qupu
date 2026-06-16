/**
 * ViewTable24G3Explainer — WMI-24F3A-Q10
 *
 * Post-answer animation teaching the top-view / viewpoint reasoning:
 *   Jay stands behind the table and looks straight down.
 *   Each 3-D object collapses to its top-down footprint:
 *     - tall rectangular box   → rectangle
 *     - ball / sphere          → circle
 *     - small cube             → square
 *     - triangular prism       → triangle
 *   The four footprints in their left-to-right order match option D.
 *
 * One beat per object — we draw the 3-D silhouette then animate
 * the top-view shape appearing above it as an "unwrapped footprint".
 * The final beat assembles all four into the top-view grid (answer D).
 *
 * SSR-safe — no Math.random, no Date, pure render of props + lang.
 * Bilingual via the t() helper keyed off props.lang.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// ── Colour tokens (mirror the illustration palette) ───────────────────────────
const INK = '#1F2937'
const TABLE_TOP = '#D1D5DB'
const TABLE_EDGE = '#6B7280'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = GREEN
const GREEN_TEXT = '#065F46'

// ── Bilingual helper ──────────────────────────────────────────────────────────
type Lang = 'en' | 'id'
const T = (lang: Lang, en: string, id: string) => (lang === 'id' ? id : en)

// ── Beat definition ───────────────────────────────────────────────────────────
type ObjectKey = 'box' | 'ball' | 'cube' | 'prism'

interface Beat {
  /** Which object(s) to reveal the top-view footprint for (null = none yet). */
  revealed: ObjectKey[]
  /** Which object is actively animating in this beat (highlighted amber). */
  active: ObjectKey | null
  result: boolean
  hold: number
  caption: string
}

// ── Object metadata ───────────────────────────────────────────────────────────
// Each object occupies a column in the top-view grid (left → right order).
// Positions in the 340-wide SVG.
const OBJECTS: Array<{
  key: ObjectKey
  col: number         // column index 0-3
  label_en: string
  label_id: string
  topShape: 'rect' | 'circle' | 'square' | 'triangle'
}> = [
  { key: 'box',   col: 0, label_en: 'tall box → rectangle',      label_id: 'kotak tinggi → persegi panjang',  topShape: 'rect'     },
  { key: 'ball',  col: 1, label_en: 'ball → circle',              label_id: 'bola → lingkaran',               topShape: 'circle'   },
  { key: 'cube',  col: 2, label_en: 'small cube → square',        label_id: 'kubus kecil → persegi',           topShape: 'square'   },
  { key: 'prism', col: 3, label_en: 'triangular prism → triangle', label_id: 'prisma segitiga → segitiga',     topShape: 'triangle' },
]

// ── Storyboard builder ────────────────────────────────────────────────────────
function buildSteps(lang: Lang): Beat[] {
  const t = (en: string, id: string) => T(lang, en, id)

  const steps: Beat[] = []

  // Beat 0 — state the strategy
  steps.push({
    revealed: [],
    active: null,
    result: false,
    hold: 2400,
    caption: t(
      'Jay looks straight DOWN at the table. Each object shows only its top outline — its footprint from above.',
      'Jay melihat lurus ke BAWAH ke meja. Setiap benda hanya menampakkan garis atasnya — jejak tampak-atasnya.',
    ),
  })

  // Beats 1–4 — one object per beat
  for (const obj of OBJECTS) {
    steps.push({
      revealed: OBJECTS.slice(0, obj.col + 1).map((o) => o.key),
      active: obj.key,
      result: false,
      hold: 2200,
      caption: t(
        `Looking down: the ${obj.label_en}.`,
        `Dilihat dari atas: ${obj.label_id}.`,
      ),
    })
  }

  // Beat 5 — final answer
  steps.push({
    revealed: OBJECTS.map((o) => o.key),
    active: null,
    result: true,
    hold: 0,
    caption: t(
      'Four shapes — rectangle, circle, square, triangle — left to right. That layout matches option D.',
      'Empat bentuk — persegi panjang, lingkaran, persegi, segitiga — dari kiri ke kanan. Susunan itu cocok dengan pilihan D.',
    ),
  })

  return steps
}

// ── SVG constants ─────────────────────────────────────────────────────────────
const VW = 340
const VH = 220

// Table geometry (matches illustration)
const TBL = { x: 28, y: 118, w: 180, d: 60, legH: 50, legW: 10 }
const KX = 0.86
const KY = 0.5

function tableCorners() {
  const { x, y, w, d } = TBL
  const fl = { sx: x,             sy: y }
  const fr = { sx: x + w,         sy: y }
  const br = { sx: x + w + d*KX,  sy: y - d*KY }
  const bl = { sx: x + d*KX,      sy: y - d*KY }
  return { fl, fr, br, bl }
}

function tablePoint(fracX: number, fracY: number) {
  const { fl, fr, bl } = tableCorners()
  const frontPt = { sx: fl.sx + fracX*(fr.sx - fl.sx), sy: fl.sy + fracX*(fr.sy - fl.sy) }
  const backPt  = { sx: bl.sx + fracX*(fr.sx - fl.sx), sy: bl.sy + fracX*(fr.sy - fl.sy) }
  return {
    sx: frontPt.sx + fracY*(backPt.sx - frontPt.sx),
    sy: frontPt.sy + fracY*(backPt.sy - frontPt.sy),
  }
}

// Object base positions
const OBJ_PTS = {
  box:   tablePoint(0.18, 0.55),
  ball:  tablePoint(0.35, 0.45),
  cube:  tablePoint(0.54, 0.40),
  prism: tablePoint(0.75, 0.38),
}

// ── Static 3-D object silhouettes (simplified for animation context) ──────────

function TallBoxSolid({ cx, cy }: { cx: number; cy: number }) {
  const w = 22, h = 44, d = 12
  const dx = d*KX, dy = -d*KY
  const fx0 = cx - w/2, fy0 = cy - h
  const topPts = `${fx0},${fy0} ${fx0+w},${fy0} ${fx0+w+dx},${fy0+dy} ${fx0+dx},${fy0+dy}`
  const rightPts = `${fx0+w},${fy0} ${fx0+w},${cy} ${fx0+w+dx},${cy+dy} ${fx0+w+dx},${fy0+dy}`
  return (
    <g>
      <rect x={fx0} y={fy0} width={w} height={h} fill="white" stroke={INK} strokeWidth={1.5}/>
      <polygon points={rightPts} fill="#E5E7EB" stroke={INK} strokeWidth={1.2}/>
      <polygon points={topPts} fill="#F3F4F6" stroke={INK} strokeWidth={1.2}/>
    </g>
  )
}

function BallSolid({ cx, cy }: { cx: number; cy: number }) {
  return (
    <circle cx={cx} cy={cy} r={14} fill="white" stroke={INK} strokeWidth={1.5}/>
  )
}

function SmallCubeSolid({ cx, cy }: { cx: number; cy: number }) {
  const s = 18, d = 10
  const dx = d*KX, dy = -d*KY
  const fy0 = cy - s, fx0 = cx - s/2
  const topPts = `${fx0},${fy0} ${fx0+s},${fy0} ${fx0+s+dx},${fy0+dy} ${fx0+dx},${fy0+dy}`
  const rightPts = `${fx0+s},${fy0} ${fx0+s},${cy} ${fx0+s+dx},${cy+dy} ${fx0+s+dx},${fy0+dy}`
  return (
    <g>
      <rect x={fx0} y={fy0} width={s} height={s} fill="white" stroke={INK} strokeWidth={1.5}/>
      <polygon points={rightPts} fill="#E5E7EB" stroke={INK} strokeWidth={1.2}/>
      <polygon points={topPts} fill="#F3F4F6" stroke={INK} strokeWidth={1.2}/>
    </g>
  )
}

function TriPrismSolid({ cx, cy }: { cx: number; cy: number }) {
  const tw = 28, th = 36, depth = 12
  const p0x = cx, p0y = cy
  const p1x = cx - tw*0.6, p1y = cy
  const p2x = cx + tw*0.25, p2y = cy - th
  const dx = depth*KX, dy = -depth*KY
  const slopePts = `${p2x},${p2y} ${p2x+dx},${p2y+dy} ${p1x+dx},${p1y+dy} ${p1x},${p1y}`
  const rightPts = `${p0x},${p0y} ${p2x},${p2y} ${p2x+dx},${p2y+dy} ${p0x+dx},${p0y+dy}`
  return (
    <g>
      <polygon points={slopePts} fill="#F3F4F6" stroke={INK} strokeWidth={1.2}/>
      <polygon points={rightPts} fill="#E5E7EB" stroke={INK} strokeWidth={1.2}/>
      <polygon points={`${p0x},${p0y} ${p1x},${p1y} ${p2x},${p2y}`} fill="white" stroke={INK} strokeWidth={1.5}/>
    </g>
  )
}

// ── Top-view footprint shapes ─────────────────────────────────────────────────
// Drawn in a top-view grid at y=12 (top of SVG), centred per column.
// Each column is 44px wide; grid starts at x = tableLeft (28).
const GRID_Y = 12    // top of top-view row
const GRID_H = 32    // height of the grid row
const GRID_COL_W = 46
const GRID_COL_START = 30

function colCX(col: number) {
  return GRID_COL_START + col * GRID_COL_W + GRID_COL_W / 2
}

interface TopShapeProps {
  col: number
  shape: 'rect' | 'circle' | 'square' | 'triangle'
  active: boolean
  result: boolean
}

function TopShape({ col, shape, active, result }: TopShapeProps) {
  const cx = colCX(col)
  const cy = GRID_Y + GRID_H / 2

  const fill = result ? '#D1FAE5' : active ? '#FEF3C7' : '#DBEAFE'
  const stroke = result ? GREEN_BORDER : active ? AMBER : '#93C5FD'
  const sw = active || result ? 2.2 : 1.5

  let inner: React.ReactNode
  if (shape === 'rect') {
    inner = <rect x={cx - 14} y={cy - 9} width={28} height={18} rx={2} fill={fill} stroke={stroke} strokeWidth={sw}/>
  } else if (shape === 'circle') {
    inner = <circle cx={cx} cy={cy} r={11} fill={fill} stroke={stroke} strokeWidth={sw}/>
  } else if (shape === 'square') {
    inner = <rect x={cx - 11} y={cy - 11} width={22} height={22} rx={2} fill={fill} stroke={stroke} strokeWidth={sw}/>
  } else {
    // triangle pointing up
    const pts = `${cx},${cy - 12} ${cx - 13},${cy + 10} ${cx + 13},${cy + 10}`
    inner = <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw}/>
  }

  return (
    <motion.g
      key={`top-${col}`}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
    >
      {inner}
    </motion.g>
  )
}

// ── "Arrow" showing Jay's viewpoint downward ──────────────────────────────────
// A simple downward arrow from a small eye icon to the table.
function ViewArrow({ visible }: { visible: boolean }) {
  if (!visible) return null
  const x = 306, y1 = 28, y2 = 110
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={AMBER} strokeWidth={2} strokeDasharray="5 3" strokeLinecap="round" markerEnd="url(#av-arrow)"/>
      {/* small eye */}
      <ellipse cx={x} cy={y1 - 5} rx={8} ry={5} fill="none" stroke={AMBER} strokeWidth={1.8}/>
      <circle cx={x} cy={y1 - 5} r={2.5} fill={AMBER}/>
    </motion.g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ViewTable24G3Explainer(props: ExplainerProps) {
  const lang: Lang = props.lang ?? 'en'

  const steps = useMemo(() => buildSteps(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  const ariaLabel = T(
    lang,
    'Jay looks straight down at the table. The tall box looks like a rectangle, the ball looks like a circle, the small cube looks like a square, and the triangular prism looks like a triangle. That matches option D.',
    'Jay melihat lurus ke bawah ke meja. Kotak tinggi tampak seperti persegi panjang, bola tampak seperti lingkaran, kubus kecil tampak seperti persegi, dan prisma segitiga tampak seperti segitiga. Itu cocok dengan pilihan D.',
  )

  const { fl, fr, br, bl } = tableCorners()

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ display: 'block', maxWidth: 360 }}
          aria-hidden="true"
        >
          <defs>
            <marker id="av-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 7 3, 0 6" fill={AMBER}/>
            </marker>
          </defs>

          {/* ── Top-view label ── */}
          <text x={VW / 2 - 20} y={8} textAnchor="middle" fontSize="9" fill="#6B7280" fontWeight="600">
            {T(lang, 'Top view (Jay sees)', 'Tampak atas (Jay lihat)')}
          </text>

          {/* ── Top-view footprint grid background ── */}
          <rect
            x={GRID_COL_START - 4}
            y={GRID_Y - 2}
            width={GRID_COL_W * 4 + 8}
            height={GRID_H + 4}
            rx={6}
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth={1}
          />

          {/* ── Top-view footprints (animated in per beat) ── */}
          <AnimatePresence>
            {OBJECTS.map((obj) => {
              if (!beat.revealed.includes(obj.key)) return null
              return (
                <TopShape
                  key={obj.key}
                  col={obj.col}
                  shape={obj.topShape}
                  active={beat.active === obj.key}
                  result={beat.result}
                />
              )
            })}
          </AnimatePresence>

          {/* ── "Answer D" badge on final beat ── */}
          {beat.result && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <rect x={VW - 48} y={GRID_Y} width={40} height={GRID_H} rx={8} fill={GREEN} />
              <text x={VW - 28} y={GRID_Y + GRID_H / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="800" fill="white">
                D
              </text>
            </motion.g>
          )}

          {/* ── Separator line between top-view and table scene ── */}
          <line x1={10} y1={GRID_Y + GRID_H + 8} x2={VW - 10} y2={GRID_Y + GRID_H + 8} stroke="#E2E8F0" strokeWidth={1}/>

          {/* ── Table surface (static) ── */}
          {/* Legs */}
          {[fl, fr, br, bl].map((c, i) => (
            <rect key={i} x={c.sx - TBL.legW/2} y={c.sy} width={TBL.legW} height={TBL.legH} fill="#9CA3AF" stroke={TABLE_EDGE} strokeWidth={1.2}/>
          ))}
          {/* Front apron */}
          <polygon points={`${fl.sx},${fl.sy} ${fr.sx},${fr.sy} ${fr.sx},${fr.sy+7} ${fl.sx},${fl.sy+7}`} fill="#B0B7C1" stroke={TABLE_EDGE} strokeWidth={1.2}/>
          {/* Right apron */}
          <polygon points={`${fr.sx},${fr.sy} ${br.sx},${br.sy} ${br.sx},${br.sy+7} ${fr.sx},${fr.sy+7}`} fill="#9CA3AF" stroke={TABLE_EDGE} strokeWidth={1.2}/>
          {/* Tabletop */}
          <polygon points={`${fl.sx},${fl.sy} ${fr.sx},${fr.sy} ${br.sx},${br.sy} ${bl.sx},${bl.sy}`} fill={TABLE_TOP} stroke={TABLE_EDGE} strokeWidth={1.8}/>

          {/* ── Static 3-D objects on the table ── */}
          <TallBoxSolid cx={OBJ_PTS.box.sx}   cy={OBJ_PTS.box.sy}/>
          <BallSolid    cx={OBJ_PTS.ball.sx}  cy={OBJ_PTS.ball.sy - 14}/>
          <SmallCubeSolid cx={OBJ_PTS.cube.sx} cy={OBJ_PTS.cube.sy}/>
          <TriPrismSolid  cx={OBJ_PTS.prism.sx} cy={OBJ_PTS.prism.sy}/>

          {/* ── Amber "active" spotlight circle on the active object ── */}
          <AnimatePresence>
            {beat.active && (() => {
              const obj = OBJECTS.find((o) => o.key === beat.active)!
              const pt = OBJ_PTS[obj.key]
              const cy = obj.key === 'ball' ? pt.sy - 14 : pt.sy - (obj.key === 'box' ? 22 : obj.key === 'cube' ? 9 : 18)
              return (
                <motion.circle
                  key={beat.active}
                  cx={pt.sx}
                  cy={cy}
                  r={22}
                  fill="none"
                  stroke={AMBER}
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                />
              )
            })()}
          </AnimatePresence>

          {/* ── Dashed connector lines: active object → top-view cell ── */}
          <AnimatePresence>
            {beat.active && (() => {
              const obj = OBJECTS.find((o) => o.key === beat.active)!
              const pt = OBJ_PTS[obj.key]
              const objTopY = obj.key === 'ball'
                ? pt.sy - 28
                : obj.key === 'box'
                ? pt.sy - 44
                : obj.key === 'cube'
                ? pt.sy - 18
                : pt.sy - 36
              const gridBotY = GRID_Y + GRID_H + 8
              const gcx = colCX(obj.col)
              return (
                <motion.line
                  key={`conn-${beat.active}`}
                  x1={pt.sx}
                  y1={objTopY}
                  x2={gcx}
                  y2={gridBotY}
                  stroke={AMBER}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              )
            })()}
          </AnimatePresence>

          {/* ── Downward-view arrow (beat 0 only) ── */}
          <AnimatePresence>
            {index === 0 && <ViewArrow visible key="view-arrow"/>}
          </AnimatePresence>
        </svg>

        {/* ── Caption ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
                : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
