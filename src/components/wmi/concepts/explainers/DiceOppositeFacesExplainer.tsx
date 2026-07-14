import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDiceOppositeSteps } from './diceOppositeSteps'
import { useBeatControl } from './useBeatControl'

interface DiceOppositeParams {
  t: number
  f: number
  r: number
}

const BLUE = '#2f6df0'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

// Standard pip layouts for faces 1–6.
// Each value is an array of [cx, cy] coordinates within a 60×60 grid.
const PIP_POSITIONS: Record<number, [number, number][]> = {
  1: [[30, 30]],
  2: [
    [18, 18],
    [42, 42],
  ],
  3: [
    [18, 18],
    [30, 30],
    [42, 42],
  ],
  4: [
    [18, 18],
    [42, 18],
    [18, 42],
    [42, 42],
  ],
  5: [
    [18, 18],
    [42, 18],
    [30, 30],
    [18, 42],
    [42, 42],
  ],
  6: [
    [18, 14],
    [42, 14],
    [18, 30],
    [42, 30],
    [18, 46],
    [42, 46],
  ],
}

// Isometric die: three visible faces (top, front, right) drawn as an isometric
// projection using SVG polygons. The die sits in a 200×170 viewport.
function IsometricDie({
  top,
  front,
  right,
  highlight,
}: {
  top: number
  front: number
  right: number
  highlight: 'none' | 'top' | 'front' | 'right' | 'all'
}) {
  // Isometric anchor: the front-bottom-left corner of the die cube.
  // We'll project a cube of side=70 in isometric perspective.
  const S = 70 // side length in projected space

  // Isometric basis vectors (2D):
  //   right →  [cos(30°), sin(30°)] = [√3/2, 0.5]
  //   left  →  [-cos(30°), sin(30°)]
  //   up    →  [0, -1] (vertical)
  const cx = 100 // center-x of viewport
  const baseY = 148 // bottom of the cube front-edge

  // The six vertices of the visible cube in isometric 2D:
  //  A = front-bottom-left  (origin)
  //  B = front-bottom-right
  //  C = back-bottom-right
  //  D = front-top-left
  //  E = front-top-right  (= top of front face, right of top face left)
  //  F = top              (apex)
  //  G = back-top-right

  const h = S * 0.5        // iso height step = S * sin(30°)
  const w = S * 0.866      // iso width step = S * cos(30°)

  // Points:
  const A = [cx - w, baseY] as [number, number]
  const B = [cx, baseY + h] as [number, number]
  const C = [cx + w, baseY] as [number, number]
  const D = [cx - w, baseY - S] as [number, number]
  const E = [cx, baseY - S + h] as [number, number]
  const F = [cx, baseY - S - h] as [number, number]
  const G = [cx + w, baseY - S] as [number, number]

  // Face polygons (each drawn as a <polygon>):
  //   Top face:   D → F → G → E
  //   Front face: A → B → E → D
  //   Right face: B → C → G → E

  const topPoly    = [D, F, G, E]
  const frontPoly  = [A, B, E, D]
  const rightPoly  = [B, C, G, E]

  const pts = (poly: [number, number][]) =>
    poly.map(([x, y]) => `${x},${y}`).join(' ')

  const topHL    = highlight === 'top' || highlight === 'all'
  const frontHL  = highlight === 'front' || highlight === 'all'
  const rightHL  = highlight === 'right' || highlight === 'all'

  const topFill   = topHL   ? '#DBEAFE' : '#EFF6FF'
  const frontFill = frontHL ? '#DBEAFE' : '#F0F4FF'
  const rightFill = rightHL ? '#DBEAFE' : '#E8EFFE'

  const hlStroke = '#2f6df0'
  const normStroke = '#30598A'

  // Pip positions inside each isometric face parallelogram are mapped via
  // bilinear interpolation. We pre-compute corners and lerp.
  // For top face pip layout:
  const topCorners = { tl: D, tr: F, bl: E, br: G }
  // For front face:
  const frontCorners = { tl: D, tr: E, bl: A, br: B }
  // For right face:
  const rightCorners = { tl: E, tr: G, bl: B, br: C }

  return (
    <svg viewBox="0 0 200 170" width="200" height="170" aria-hidden="true">
      {/* Top face */}
      <polygon
        points={pts(topPoly)}
        fill={topFill}
        stroke={topHL ? hlStroke : normStroke}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {/* Front face */}
      <polygon
        points={pts(frontPoly)}
        fill={frontFill}
        stroke={frontHL ? hlStroke : normStroke}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {/* Right face */}
      <polygon
        points={pts(rightPoly)}
        fill={rightFill}
        stroke={rightHL ? hlStroke : normStroke}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* Pips on top face */}
      <IsoPips value={top} corners={topCorners} pipColor={topHL ? hlStroke : PURPLE} />
      {/* Pips on front face */}
      <IsoPips value={front} corners={frontCorners} pipColor={frontHL ? hlStroke : PURPLE} />
      {/* Pips on right face */}
      <IsoPips value={right} corners={rightCorners} pipColor={rightHL ? hlStroke : PURPLE} />
    </svg>
  )
}

// Map a [0..1, 0..1] coordinate inside a parallelogram face to 2D screen coords.
function isoPoint(
  u: number,
  v: number,
  corners: { tl: [number, number]; tr: [number, number]; bl: [number, number]; br: [number, number] },
): [number, number] {
  const [tlx, tly] = corners.tl
  const [trx, try_] = corners.tr
  const [blx, bly] = corners.bl
  const [brx, bry] = corners.br
  const x = tlx * (1 - u) * (1 - v) + trx * u * (1 - v) + blx * (1 - u) * v + brx * u * v
  const y = tly * (1 - u) * (1 - v) + try_ * u * (1 - v) + bly * (1 - u) * v + bry * u * v
  return [x, y]
}

// Standard pip (u, v) positions in [0..1]² space (padded from edges).
const PIP_UV: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.28, 0.28],
    [0.72, 0.72],
  ],
  3: [
    [0.28, 0.28],
    [0.5, 0.5],
    [0.72, 0.72],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.5, 0.5],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  6: [
    [0.28, 0.2],
    [0.72, 0.2],
    [0.28, 0.5],
    [0.72, 0.5],
    [0.28, 0.8],
    [0.72, 0.8],
  ],
}

function IsoPips({
  value,
  corners,
  pipColor,
}: {
  value: number
  corners: { tl: [number, number]; tr: [number, number]; bl: [number, number]; br: [number, number] }
  pipColor: string
}) {
  const uvs = PIP_UV[value] ?? PIP_UV[1]
  return (
    <>
      {uvs.map(([u, v], i) => {
        const [px, py] = isoPoint(u, v, corners)
        return <circle key={i} cx={px} cy={py} r={3.2} fill={pipColor} />
      })}
    </>
  )
}

// A flat face tile (square die face for the pair reveal).
function FlatFace({
  value,
  label,
  faceColor,
  borderColor,
  textColor,
}: {
  value: number
  label: string
  faceColor: string
  borderColor: string
  textColor: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 60 60"
        width="52"
        height="52"
        aria-hidden="true"
        style={{ borderRadius: 8, border: `2.5px solid ${borderColor}`, background: faceColor }}
      >
        {(PIP_POSITIONS[value] ?? PIP_POSITIONS[1]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={4.5} fill={textColor} />
        ))}
      </svg>
      <span className="font-display text-xs font-bold" style={{ color: textColor }}>
        {label}
      </span>
    </div>
  )
}

export default function DiceOppositeFacesExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as DiceOppositeParams
  const story = useMemo(
    () => buildDiceOppositeSteps(p.t, p.f, p.r, lang),
    [p.t, p.f, p.r, lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { t, f, r, tOpp, fOpp, rOpp, hidden } = story
  const phase = beat.phase

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: each hidden face is 7 − its shown face (${t}→${tOpp}, ${f}→${fOpp}, ${r}→${rOpp}); add them to find the hidden total (${hidden}).`,
    `Strategi: setiap sisi tersembunyi adalah 7 − sisi yang terlihat (${t}→${tOpp}, ${f}→${fOpp}, ${r}→${rOpp}); jumlahkan untuk mendapat total tersembunyi (${hidden}).`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[16.25rem] flex-col items-center gap-3">

        {/* === BEAT: rule — show the 3 pair cards === */}
        {phase === 'rule' && (
          <motion.div
            key="rule-pairs"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3"
          >
            {([
              [1, 6],
              [2, 5],
              [3, 4],
            ] as [number, number][]).map(([a, b]) => (
              <div
                key={`${a}-${b}`}
                className="flex items-center gap-1 rounded-xl border-2 bg-white px-3 py-2 font-display font-extrabold"
                style={{ borderColor: BLUE, color: PURPLE }}
              >
                <span style={{ color: BLUE }}>{a}</span>
                <span style={{ color: MUTED }}>+</span>
                <span style={{ color: BLUE }}>{b}</span>
                <span style={{ color: MUTED }}>=</span>
                <span>7</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* === BEAT: visible — show isometric die with all three faces lit === */}
        {phase === 'visible' && (
          <motion.div
            key="iso-die"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          >
            <IsometricDie top={t} front={f} right={r} highlight="all" />
          </motion.div>
        )}

        {/* === BEAT: opposites — each shown face drops to its hidden opposite (7 − shown) === */}
        {phase === 'opposites' && (
          <motion.div
            key="opposites"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-5"
          >
            {(
              [
                [t, tOpp, T('top', 'atas')],
                [f, fOpp, T('front', 'depan')],
                [r, rOpp, T('right', 'kanan')],
              ] as [number, number, string][]
            ).map(([vis, opp, lbl], i) => (
              <motion.div
                key={lbl}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.2, type: 'spring', stiffness: 320, damping: 24 }}
                className="flex flex-col items-center gap-1"
              >
                <FlatFace
                  value={vis}
                  label={lbl}
                  faceColor="#EFF6FF"
                  borderColor={BLUE}
                  textColor={PURPLE}
                />
                <div className="flex flex-col items-center leading-none">
                  <span className="font-display text-[0.6875rem] font-bold" style={{ color: MUTED }}>
                    7 − {vis}
                  </span>
                  <span className="text-lg font-extrabold leading-none" style={{ color: GREEN }}>
                    ↓
                  </span>
                </div>
                <FlatFace
                  value={opp}
                  label={`${opp}`}
                  faceColor="#F0FDF4"
                  borderColor={GREEN}
                  textColor="#065F46"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* === BEAT: add — sum the three hidden (opposite) faces === */}
        {phase === 'add' && (
          <motion.div
            key="add-eq"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3">
              <FlatFace value={tOpp} label={`${tOpp}`} faceColor="#F0FDF4" borderColor={GREEN} textColor="#065F46" />
              <span className="font-display text-lg font-extrabold" style={{ color: MUTED }}>+</span>
              <FlatFace value={fOpp} label={`${fOpp}`} faceColor="#F0FDF4" borderColor={GREEN} textColor="#065F46" />
              <span className="font-display text-lg font-extrabold" style={{ color: MUTED }}>+</span>
              <FlatFace value={rOpp} label={`${rOpp}`} faceColor="#F0FDF4" borderColor={GREEN} textColor="#065F46" />
            </div>
            <div className="font-display text-xl font-extrabold">
              <span style={{ color: GREEN }}>{tOpp}</span>
              <span style={{ color: MUTED }}> + </span>
              <span style={{ color: GREEN }}>{fOpp}</span>
              <span style={{ color: MUTED }}> + </span>
              <span style={{ color: GREEN }}>{rOpp}</span>
              <span style={{ color: MUTED }}> = </span>
              <span style={{ color: PURPLE }}>{hidden}</span>
            </div>
          </motion.div>
        )}

        {/* === BEAT: result — big answer chip === */}
        {phase === 'result' && (
          <motion.div
            key="result-chip"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="flex h-16 min-w-[4rem] items-center justify-center rounded-2xl border-[3px] px-5 font-display text-4xl font-extrabold"
            style={{ borderColor: GREEN, color: '#065F46', background: '#D1FAE5' }}
          >
            {hidden}
          </motion.div>
        )}

        {/* Caption strip */}
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
