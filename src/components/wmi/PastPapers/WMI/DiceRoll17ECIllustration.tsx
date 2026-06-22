// DiceRoll17ECIllustration.tsx
// IKMC-20-EC-Q17 — "A standard dice rolls to the right across 6 squares.
// What is the total of the three faces marked with ??"
//
// Static problem figure: die starts on square 1 (top=1, front=2, right=3),
// rolls 5 times rightward to square 6. The final die shows top/front/right
// as "?" (problem asks for their sum).
//
// Adapted from DieSumsG3Illustration (isometric die primitive) and
// PentRoll24G3Illustration (curved arrows).
// Pure render — no Math.random, no Date, no hooks. SSR-safe.

import React from 'react'

// ── palette ──────────────────────────────────────────────────────────────────

const INK = '#1F2937'
const FACE_TOP = '#FFFFFF'
const FACE_FRONT = '#F8FAFC'
const FACE_RIGHT = '#E2E8F0'
const FACE_STROKE = INK
const TRACK_FILL = '#F1F5F9'
const TRACK_STROKE = '#64748B'
const ARROW_COLOR = '#475569'
const QUESTION_COLOR = '#1D4ED8'
const SQUARE_LABEL_COLOR = '#64748B'

// ── layout constants ─────────────────────────────────────────────────────────

const VIEW_W = 520
const VIEW_H = 160

// 6 squares across the bottom, each square = 64 wide
const N_SQUARES = 6
const SQ_W = 64
const SQ_H = 50
const TRACK_LEFT = 40
const TRACK_TOP = VIEW_H - SQ_H - 10

// Die geometry — isometric projection showing top, front, right
// Each die is centered above its square
const DIE_HALF = 18  // half-width of die face projected
const DIE_H = 22     // height of the iso body projection
const DIE_TOP_H = 11 // height of top parallelogram

// Pip layout on a unit face [0..1]²
const PIPS: Record<number, Array<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [[0.3, 0.3], [0.7, 0.7]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.3, 0.3], [0.7, 0.3], [0.3, 0.7], [0.7, 0.7]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.3, 0.22], [0.3, 0.5], [0.3, 0.78], [0.7, 0.22], [0.7, 0.5], [0.7, 0.78]],
}

// ── Die face tracking ─────────────────────────────────────────────────────────

// Standard die: opposite faces sum to 7 (1↔6, 2↔5, 3↔4).
// Initial orientation: top=1, front=2, right=3, bot=6, back=5, left=4.
// Roll RIGHT: new_top = old_left, new_right = old_top, new_bot = old_right, new_left = old_bot
// (front and back do not change during rightward rolls)

interface DieOrientation { top: number; bot: number; front: number; back: number; right: number; left: number }

const INITIAL: DieOrientation = { top: 1, bot: 6, front: 2, back: 5, right: 3, left: 4 }

function rollRight(o: DieOrientation): DieOrientation {
  return { top: o.left, bot: o.right, right: o.top, left: o.bot, front: o.front, back: o.back }
}

// Compute orientation at each square (index 0..5 = squares 1..6)
const ORIENTATIONS: DieOrientation[] = Array.from({ length: N_SQUARES }, (_, i) => {
  let o = INITIAL
  for (let r = 0; r < i; r++) o = rollRight(o)
  return o
})

// ── Isometric Die component ───────────────────────────────────────────────────

interface IsoDieProps {
  cx: number   // center-x of die over floor
  cy: number   // y of die base (floor line)
  orientation: DieOrientation
  /** If true, draw "?" text on all three visible faces instead of pips */
  showQuestion?: boolean
}

function IsoDie({ cx, cy, orientation, showQuestion = false }: IsoDieProps) {
  const half = DIE_HALF
  const topH = DIE_TOP_H
  const bodyH = DIE_H

  // Six key points of the isometric cube
  // T = top-back corner, TL = top-left, TR = top-right, TF = top-front
  // BL = bottom-left, BR = bottom-right, BF = bottom-front
  const baseY = cy - 4  // base of the die (sits on floor)
  const TF_Y = baseY - bodyH
  const TL: [number, number] = [cx - half, TF_Y - topH]
  const TR: [number, number] = [cx + half, TF_Y - topH]
  const TT: [number, number] = [cx, TF_Y - topH * 2]
  const TF_L: [number, number] = [cx - half, TF_Y]
  const TF_R: [number, number] = [cx + half, TF_Y]
  const TF_F: [number, number] = [cx, TF_Y]
  const BL: [number, number] = [cx - half, baseY]
  const BR: [number, number] = [cx + half, baseY]
  const BF: [number, number] = [cx, baseY]

  const pts = (arr: Array<[number, number]>) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  // Map from face-local [u,v] ∈ [0..1]² to SVG coords
  // Top face rhombus: TT (back), TR (right), TF_F (front), TL (left)
  const mapTop = ([u, v]: [number, number]): [number, number] => {
    const x = TT[0] + (TR[0] - TT[0]) * u + (TL[0] - TT[0]) * v
    const y = TT[1] + (TR[1] - TT[1]) * u + (TL[1] - TT[1]) * v
    return [x, y]
  }
  // Left face parallelogram: TL (top-back-left), TF_L (top-front-left), BL (bot-front-left)
  const mapLeft = ([u, v]: [number, number]): [number, number] => {
    // parallelogram: top-left TL, top-right TF_L, bot-right (shifted), bot-left BL
    const x = TL[0] + (TF_L[0] - TL[0]) * u + (BL[0] - TL[0]) * v
    const y = TL[1] + (TF_L[1] - TL[1]) * u + (BL[1] - TL[1]) * v
    return [x, y]
  }
  // Right face: TF_R, TR, BR, BF
  const mapRight = ([u, v]: [number, number]): [number, number] => {
    // u=0→left (TF_R→BF), u=1→right (TR→BR), v=0→top, v=1→bottom
    const x = TF_R[0] + (TR[0] - TF_R[0]) * u + (BF[0] - TF_R[0]) * v
    const y = TF_R[1] + (TR[1] - TF_R[1]) * u + (BF[1] - TF_R[1]) * v
    return [x, y]
  }

  const PIP_R = 2.2

  // Draw pips or "?" on a face
  function FacePips({ faceVal, mapper, color = INK }: { faceVal: number; mapper: (p: [number, number]) => [number, number]; color?: string }) {
    if (showQuestion) return null
    const positions = PIPS[faceVal] ?? []
    return (
      <g>
        {positions.map((p, i) => {
          const [x, y] = mapper(p)
          return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={PIP_R} fill={color} />
        })}
      </g>
    )
  }

  const topFace = pts([TT, TR, TF_F, TL])
  const leftFace = pts([TL, TF_L, BL, [TL[0] + BL[0] - TF_L[0], TL[1] + BL[1] - TF_L[1]]])
  const rightFace = pts([TF_R, TR, BR, BF])

  // Question mark label for "?" face — place at face centroid
  function QMark({ ax, ay }: { ax: number; ay: number }) {
    return (
      <text
        x={ax.toFixed(1)} y={ay.toFixed(1)}
        textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={900}
        fill={QUESTION_COLOR}
      >?</text>
    )
  }

  // Centroids of the three faces
  const topCentX = (TT[0] + TR[0] + TF_F[0] + TL[0]) / 4
  const topCentY = (TT[1] + TR[1] + TF_F[1] + TL[1]) / 4
  const leftCentX = (TL[0] + TF_L[0] + BL[0] + TL[0] + BL[0] - TF_L[0]) / 4
  const leftCentY = (TL[1] + TF_L[1] + BL[1] + TL[1] + BL[1] - TF_L[1]) / 4
  const rightCentX = (TF_R[0] + TR[0] + BR[0] + BF[0]) / 4
  const rightCentY = (TF_R[1] + TR[1] + BR[1] + BF[1]) / 4

  return (
    <g>
      {/* Left face */}
      <polygon
        points={leftFace}
        fill={FACE_FRONT} stroke={FACE_STROKE} strokeWidth={1.5} strokeLinejoin="round"
      />
      {showQuestion
        ? <QMark ax={leftCentX} ay={leftCentY} />
        : <FacePips faceVal={orientation.front} mapper={mapLeft} />
      }

      {/* Right face */}
      <polygon
        points={rightFace}
        fill={FACE_RIGHT} stroke={FACE_STROKE} strokeWidth={1.5} strokeLinejoin="round"
      />
      {showQuestion
        ? <QMark ax={rightCentX} ay={rightCentY} />
        : <FacePips faceVal={orientation.right} mapper={mapRight} />
      }

      {/* Top face */}
      <polygon
        points={topFace}
        fill={FACE_TOP} stroke={FACE_STROKE} strokeWidth={1.5} strokeLinejoin="round"
      />
      {showQuestion
        ? <QMark ax={topCentX} ay={topCentY} />
        : <FacePips faceVal={orientation.top} mapper={mapTop} />
      }
    </g>
  )
}

// ── Curved roll arrow ─────────────────────────────────────────────────────────

function RollArrow({ fromX, toX, y }: { fromX: number; toX: number; y: number }) {
  const midX = (fromX + toX) / 2
  const cpY = y - 22
  const arrowId = `dra-${Math.round(fromX)}`

  return (
    <>
      <defs>
        <marker id={arrowId} markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0.5 L0,5.5 L6,3 Z" fill={ARROW_COLOR} />
        </marker>
      </defs>
      <path
        d={`M ${fromX.toFixed(1)},${y.toFixed(1)} Q ${midX.toFixed(1)},${cpY.toFixed(1)} ${(toX - 4).toFixed(1)},${y.toFixed(1)}`}
        fill="none"
        stroke={ARROW_COLOR}
        strokeWidth={1.6}
        markerEnd={`url(#${arrowId})`}
      />
    </>
  )
}

// ── Shared exports for explainer ──────────────────────────────────────────────

export { INITIAL, rollRight, ORIENTATIONS, IsoDie, RollArrow }

export const SCENE = {
  VIEW_W,
  VIEW_H,
  N_SQUARES,
  SQ_W,
  SQ_H,
  TRACK_LEFT,
  TRACK_TOP,
  DIE_HALF,
  DIE_H,
  DIE_TOP_H,
  FACE_TOP,
  FACE_FRONT,
  FACE_RIGHT,
  FACE_STROKE,
  TRACK_FILL,
  TRACK_STROKE,
  ARROW_COLOR,
  QUESTION_COLOR,
  INK,
} as const

// ── Main illustration ─────────────────────────────────────────────────────────

export default function DiceRoll17ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebuah dadu standar diletakkan di kotak pertama (atas=1, depan=2, kanan=3) ' +
        'kemudian berguling ke kanan melewati 6 kotak. ' +
        'Dadu di kotak terakhir menampilkan tanda tanya pada ketiga sisi yang terlihat.'
      }
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: 500, display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />

        {/* Floor track squares */}
        {Array.from({ length: N_SQUARES }, (_, i) => {
          const x = TRACK_LEFT + i * SQ_W
          const y = TRACK_TOP
          return (
            <rect
              key={`sq-${i}`}
              x={x} y={y} width={SQ_W} height={SQ_H}
              fill={TRACK_FILL} stroke={TRACK_STROKE} strokeWidth={1.5}
            />
          )
        })}

        {/* Curved roll arrows between squares */}
        {Array.from({ length: N_SQUARES - 1 }, (_, i) => {
          const fromCx = TRACK_LEFT + i * SQ_W + SQ_W / 2
          const toCx = TRACK_LEFT + (i + 1) * SQ_W + SQ_W / 2
          const arrowY = TRACK_TOP - 6
          return <RollArrow key={`arr-${i}`} fromX={fromCx} toX={toCx} y={arrowY} />
        })}

        {/* Dice at each square */}
        {ORIENTATIONS.map((orientation, i) => {
          const cx = TRACK_LEFT + i * SQ_W + SQ_W / 2
          const isLast = i === N_SQUARES - 1
          return (
            <IsoDie
              key={`die-${i}`}
              cx={cx}
              cy={TRACK_TOP}
              orientation={orientation}
              showQuestion={isLast}
            />
          )
        })}

        {/* Square number labels (small, below track) */}
        {Array.from({ length: N_SQUARES }, (_, i) => {
          const cx = TRACK_LEFT + i * SQ_W + SQ_W / 2
          const y = TRACK_TOP + SQ_H + 12
          return (
            <text
              key={`lbl-${i}`}
              x={cx.toFixed(1)} y={y.toFixed(1)}
              textAnchor="middle" dominantBaseline="central"
              fontSize={11} fontWeight={600}
              fill={SQUARE_LABEL_COLOR}
            >
              {i + 1}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
