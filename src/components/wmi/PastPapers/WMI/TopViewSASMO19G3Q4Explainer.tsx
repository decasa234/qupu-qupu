// SASMO-19-G3-Q4 post-answer explainer.
// "Find the top view of the figure on the right." — answer: C
//
// Animation beats:
//   intro      — 3D figure shown; "imagine looking down"
//   left_side  — left cubes highlighted in amber
//   right_side — right cube + cylinder highlighted in amber
//   top_view   — 2D flat top-view grid shown
//   answer     — top-view with circle cell highlighted in green

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { isoProject } from './primitives/IsoCubes'
import { buildTopViewSASMO19G3Q4Steps } from './topViewSASMO19G3Q4Steps'
import type { TopViewPhase } from './topViewSASMO19G3Q4Steps'

const SIZE = 24
const CX = SIZE * 0.866
const CY = SIZE * 0.5
const INK = '#1F2937'

const COL_DEFAULT = '#D6EBF7'
const COL_LEFT_F  = '#8FC6E8'
const COL_RIGHT_F = '#5BA8D4'
const COL_AMBER_T = '#FDE68A'
const COL_AMBER_L = '#F59E0B'
const COL_AMBER_R = '#D97706'
const COL_DIM     = '#CBD5E1'
const COL_GREEN   = '#34D399'
const COL_GREEN_L = '#059669'

// ---------------------------------------------------------------------------
// Cube spec (position + color override)
// ---------------------------------------------------------------------------

interface CubeSpec { x: number; y: number; z: number; topC: string; leftC: string; rightC: string }

function makeCubes(phase: TopViewPhase): CubeSpec[] {
  const dim    = { topC: COL_DIM,     leftC: COL_DIM,     rightC: COL_DIM }
  const normal = { topC: COL_DEFAULT, leftC: COL_LEFT_F,  rightC: COL_RIGHT_F }
  const amber  = { topC: COL_AMBER_T, leftC: COL_AMBER_L, rightC: COL_AMBER_R }

  const leftCoords  = [{x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:0,z:1},{x:1,y:0,z:1}]
  const rightCoords = [{x:2,y:0,z:0}]

  if (phase === 'left_side') {
    return [
      ...leftCoords.map((c) => ({ ...c, ...amber })),
      ...rightCoords.map((c) => ({ ...c, ...dim })),
    ]
  }
  if (phase === 'right_side') {
    return [
      ...leftCoords.map((c) => ({ ...c, ...dim })),
      ...rightCoords.map((c) => ({ ...c, ...amber })),
    ]
  }
  // intro, top_view, answer: all normal colours
  return [
    ...leftCoords.map((c) => ({ ...c, ...normal })),
    ...rightCoords.map((c) => ({ ...c, ...normal })),
  ]
}

// ---------------------------------------------------------------------------
// ISO cube face group (for the explainer's 3D view)
// ---------------------------------------------------------------------------

function CubeFace({ spec }: { spec: CubeSpec }) {
  const { sx, sy } = isoProject(spec.x, spec.y, spec.z, SIZE)
  const topPts  = `${sx},${sy} ${sx+CX},${sy-CY} ${sx+2*CX},${sy} ${sx+CX},${sy+CY}`
  const leftPts = `${sx},${sy} ${sx+CX},${sy+CY} ${sx+CX},${sy+CY+SIZE} ${sx},${sy+SIZE}`
  const rightPts = `${sx+CX},${sy+CY} ${sx+2*CX},${sy} ${sx+2*CX},${sy+SIZE} ${sx+CX},${sy+CY+SIZE}`
  return (
    <>
      <polygon points={leftPts}  fill={spec.leftC}  stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
      <polygon points={rightPts} fill={spec.rightC} stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
      <polygon points={topPts}   fill={spec.topC}   stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
    </>
  )
}

// ---------------------------------------------------------------------------
// ISO cylinder (same as Illustration)
// ---------------------------------------------------------------------------

interface CylColors { fill: string; topFill: string }
function IsoCyl({ vx, vy, vz, rx = 8, ry = 5, h = SIZE, fill, topFill }: {
  vx: number; vy: number; vz: number; rx?: number; ry?: number; h?: number
} & CylColors) {
  const { sx, sy } = isoProject(vx, vy, vz, SIZE)
  const cx = sx + CX
  const base_y = sy
  const top_y  = base_y - h
  const body = [
    `M ${cx-rx},${base_y}`,
    `L ${cx-rx},${top_y}`,
    `L ${cx+rx},${top_y}`,
    `L ${cx+rx},${base_y}`,
    `A ${rx},${ry} 0 0,1 ${cx-rx},${base_y}`,
    'Z',
  ].join(' ')
  return (
    <>
      <path d={body} fill={fill} stroke={INK} strokeWidth={1.2} strokeLinejoin="round"/>
      <ellipse cx={cx} cy={top_y} rx={rx} ry={ry}
               fill={topFill} stroke={INK} strokeWidth={1.2}/>
    </>
  )
}

// ---------------------------------------------------------------------------
// Top-view 2D grid (shown in beats top_view + answer)
// Matches option C: 2 cells (left wide 80px, right narrow 40px) + circle right
// ---------------------------------------------------------------------------

const TV_W = 120, TV_H = 72, TV_DIV = 80
const TV_CX = 100, TV_CY = 36, TV_R = 16

function TopViewGrid({ highlight }: { highlight: boolean }) {
  const bg    = highlight ? '#D1FAE5' : '#F8FAFC'
  const cirF  = highlight ? COL_GREEN : '#D6EBF7'
  const ink   = INK
  return (
    <svg viewBox={`0 0 ${TV_W} ${TV_H}`} width={TV_W} height={TV_H}
         style={{ display: 'block' }} aria-hidden="true">
      <rect x={0} y={0} width={TV_W} height={TV_H} fill={bg} stroke={ink} strokeWidth={1.5}/>
      <line x1={TV_DIV} y1={0} x2={TV_DIV} y2={TV_H} stroke={ink} strokeWidth={1.5}/>
      <circle cx={TV_CX} cy={TV_CY} r={TV_R}
              fill={cirF} stroke={ink} strokeWidth={1.5}/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------

export default function TopViewSASMO19G3Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildTopViewSASMO19G3Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Painter's sort order (y desc → z asc → x asc; all y=0)
  const cubeSpecs = makeCubes(beat.phase)
  const sorted = [...cubeSpecs].sort(
    (a, b) => b.y - a.y || a.z - b.z || a.x - b.x,
  )

  const showTopView = beat.phase === 'top_view' || beat.phase === 'answer'
  const cylPhase = beat.phase === 'right_side' ? 'amber' : 'normal'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan tampak atas: lihat bangun 3D dari atas — dua sel, lingkaran di kanan = pilihan C.'
      : 'Top-view explainer: look at the 3D figure from above — two cells, circle right = option C.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D figure OR 2D top-view */}
        <motion.div
          key={showTopView ? 'topview' : '3d'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
        >
          {showTopView ? (
            <TopViewGrid highlight={beat.phase === 'answer'} />
          ) : (
            <svg
              viewBox="-8 -44 100 112"
              width="200"
              style={{ display: 'block', overflow: 'visible' }}
              aria-hidden="true"
            >
              {sorted.map((spec, i) => (
                <CubeFace key={i} spec={spec} />
              ))}
              <IsoCyl
                vx={2} vy={0} vz={0}
                fill={cylPhase === 'amber' ? COL_AMBER_L : '#8FC6E8'}
                topFill={cylPhase === 'amber' ? COL_AMBER_T : '#D6EBF7'}
              />
            </svg>
          )}
        </motion.div>

        {/* Answer badge */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-3xl font-black"
            style={{ color: COL_GREEN_L }}
          >
            C
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: COL_GREEN_L, color: '#065F46' }
              : { background: '#FEF3C7', borderColor: '#D97706',   color: '#92400E' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
