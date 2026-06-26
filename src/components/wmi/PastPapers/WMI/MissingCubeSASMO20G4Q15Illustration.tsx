// SASMO-20-G4-Q15
// "Manakah di antara pilihan berikut yang merupakan potongan yang hilang dari kubus?"
//
// Stem: large cube with missing top-front-right corner (three dark/light face triangles).
// Co-exports MissingCubeSASMO20G4Q15Option for CHOICE_RENDERERS.
//
// Adapted from CubeShapes14Illustration (same isometric projection).
// Imports isoProject from ./primitives/IsoCubes.
//
// Pure SVG, SSR-safe, no hooks, no framer-motion.
//
// Visual encoding (dark triangle = pattern on each face):
//   A: top=back,  left=upperRight, right=upperLeft
//   B: top=back,  left=lowerLeft,  right=lowerRight   ← CORRECT
//   C: top=front, left=upperRight,  right=upperLeft
//   D: top=back,  left=upperLeft,   right=upperRight
//   E: top=back,  left=lowerRight,  right=lowerLeft   (B's faces swapped)

import { isoProject } from './primitives/IsoCubes'
import type { WmiChoice } from '../../../../types/wmi'

// ── constants ─────────────────────────────────────────────────────────────────
const INK       = '#1F2937'
const SW        = 1.4

// Option cube colours (3 visible faces: light top, medium left, dark right)
const OPT_T     = '#DEDEDE'
const OPT_L     = '#B4B4B4'
const OPT_R     = '#909090'
const OPT_DARK  = '#3D3D3D'  // dark triangle overlay

// Stem colours
const STEM_NOTCH = '#C0C0C0'  // light triangle area (the "hole")
const STEM_DARK  = '#484848'  // dark solid area of outer face

// ── geometry helper ───────────────────────────────────────────────────────────

/** Returns typed arrays for the 3 visible faces of an iso-cube at (ox,oy) with edge S. */
function isoFaces(ox: number, oy: number, S: number) {
  const CX = S * 0.866
  const CY = S * 0.5
  const L  : [number,number] = [ox,         oy       ]
  const T  : [number,number] = [ox + CX,    oy - CY  ]
  const R  : [number,number] = [ox + 2*CX,  oy       ]
  const B  : [number,number] = [ox + CX,    oy + CY  ]
  const lTR: [number,number] = [ox + CX,    oy + CY  ]  // = B
  const lBR: [number,number] = [ox + CX,    oy + CY + S]
  const lBL: [number,number] = [ox,         oy + S   ]
  const rTR: [number,number] = [ox + 2*CX,  oy       ]  // = R
  const rBR: [number,number] = [ox + 2*CX,  oy + S   ]
  const rBL: [number,number] = [ox + CX,    oy + CY + S]
  return {
    top:   { L, T, R, B },
    left:  { TL: L,   TR: lTR, BR: lBR, BL: lBL },
    right: { TL: lTR, TR: rTR, BR: rBR, BL: rBL },
    CX, CY,
  }
}

type FaceSet = ReturnType<typeof isoFaces>

function p(coord: [number,number]) { return `${coord[0].toFixed(2)},${coord[1].toFixed(2)}` }
function polyStr(coords: [number,number][]): string { return coords.map(p).join(' ') }

// ── triangle selectors ────────────────────────────────────────────────────────

type TopHalf  = 'back' | 'front'
type SideHalf = 'upperRight' | 'lowerLeft' | 'upperLeft' | 'lowerRight'

function topTri(f: FaceSet['top'], half: TopHalf): [number,number][] {
  const { L, T, R, B } = f
  return half === 'back' ? [L, T, R] : [L, R, B]
}

function leftTri(f: FaceSet['left'], half: SideHalf): [number,number][] {
  const { TL, TR, BR, BL } = f
  if (half === 'upperRight') return [TL, TR, BR]
  if (half === 'lowerLeft')  return [TL, BL, BR]
  if (half === 'upperLeft')  return [TL, TR, BL]
  return [TR, BR, BL]                             // lowerRight
}

function rightTri(f: FaceSet['right'], half: SideHalf): [number,number][] {
  const { TL, TR, BR, BL } = f
  if (half === 'upperRight') return [TL, TR, BR]
  if (half === 'lowerLeft')  return [TL, BL, BR]
  if (half === 'upperLeft')  return [TL, TR, BL]
  return [TR, BR, BL]                             // lowerRight
}

// ── option configurations ─────────────────────────────────────────────────────

interface OptionCfg {
  top: TopHalf
  left: SideHalf
  right: SideHalf
}

/** Per-choice dark-triangle direction encoding. */
export const OPTION_CONFIGS: Record<string, OptionCfg> = {
  A: { top: 'back',  left: 'upperRight', right: 'upperLeft'  },
  B: { top: 'back',  left: 'lowerLeft',  right: 'lowerRight' },
  C: { top: 'front', left: 'upperRight', right: 'upperLeft'  },
  D: { top: 'back',  left: 'upperLeft',  right: 'upperRight' },
  E: { top: 'back',  left: 'lowerRight', right: 'lowerLeft'  },
}

// ── shared OptionCubeSVG (reused by Explainer) ────────────────────────────────

const OPT_S  = 44
const OPT_CX = OPT_S * 0.866
const OPT_CY = OPT_S * 0.5

/** Renders a single isometric cube piece with triangular face markings.
 *  Export is intentional so MissingCubeSASMO20G4Q15Explainer can reuse it. */
export function OptionCubeSVG({ cfg, dim = false }: { cfg: OptionCfg; dim?: boolean }) {
  // Use isoProject to get the left-tip of the top face (x=0,y=0,z=0,size=OPT_S)
  const { sx: ox, sy: oy } = isoProject(0, 0, 0, OPT_S)
  const f = isoFaces(ox, oy, OPT_S)

  const topFull  = polyStr([f.top.L, f.top.T, f.top.R, f.top.B])
  const leftFull = polyStr([f.left.TL, f.left.TR, f.left.BR, f.left.BL])
  const rightFull = polyStr([f.right.TL, f.right.TR, f.right.BR, f.right.BL])

  const tDark = polyStr(topTri(f.top, cfg.top))
  const lDark = polyStr(leftTri(f.left, cfg.left))
  const rDark = polyStr(rightTri(f.right, cfg.right))

  const alpha = dim ? 0.35 : 1

  return (
    <g opacity={alpha}>
      {/* Top face */}
      <polygon points={topFull}  fill={OPT_T} stroke={INK} strokeWidth={SW} />
      <polygon points={tDark}    fill={OPT_DARK} stroke="none" />
      <polygon points={topFull}  fill="none"  stroke={INK} strokeWidth={SW} />
      {/* Left face */}
      <polygon points={leftFull}  fill={OPT_L} stroke={INK} strokeWidth={SW} />
      <polygon points={lDark}     fill={OPT_DARK} stroke="none" />
      <polygon points={leftFull}  fill="none"  stroke={INK} strokeWidth={SW} />
      {/* Right face */}
      <polygon points={rightFull} fill={OPT_R} stroke={INK} strokeWidth={SW} />
      <polygon points={rDark}     fill={OPT_DARK} stroke="none" />
      <polygon points={rightFull} fill="none"  stroke={INK} strokeWidth={SW} />
    </g>
  )
}

// ── MissingCubeSASMO20G4Q15Option — CHOICE_RENDERERS export ─────────────────

const OPT_VB_X = -6
const OPT_VB_Y = -(OPT_CY + 6)
const OPT_VB_W = 2 * OPT_CX + 12
const OPT_VB_H = OPT_CY + OPT_S + 12

/**
 * MissingCubeSASMO20G4Q15Option — renders ONE answer choice (A–E) as an
 * isometric cube piece with triangular face markings.
 * Registered in CHOICE_RENDERERS['SASMO-20-G4-Q15'].
 */
export function MissingCubeSASMO20G4Q15Option({ choice }: { choice: WmiChoice }) {
  const cfg = OPTION_CONFIGS[choice.label]
  if (!cfg) return <span>{choice.text}</span>
  return (
    <span
      role="img"
      aria-label={`Pilihan ${choice.label} — potongan kubus`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`${OPT_VB_X} ${OPT_VB_Y} ${OPT_VB_W.toFixed(1)} ${OPT_VB_H.toFixed(1)}`}
        width={88}
        height={88}
        aria-hidden
        style={{ display: 'block' }}
      >
        <OptionCubeSVG cfg={cfg} />
      </svg>
    </span>
  )
}

// ── Stem illustration ─────────────────────────────────────────────────────────

const STEM_S  = 72
const STEM_CX = STEM_S * 0.866   // ≈ 62.35
const STEM_CY = STEM_S * 0.5     // = 36

// Use isoProject to compute stem origin (x=0,y=0,z=0)
const { sx: STEM_OX, sy: STEM_OY } = isoProject(0, 0, 0, STEM_S)
const STEM_F = isoFaces(STEM_OX, STEM_OY, STEM_S)

// Stem face points
const sTop  = STEM_F.top
const sLeft = STEM_F.left
const sRight = STEM_F.right

// Outer face full polygons
const stemTopFull   = polyStr([sTop.L,   sTop.T,   sTop.R,   sTop.B  ])
const stemLeftFull  = polyStr([sLeft.TL, sLeft.TR, sLeft.BR, sLeft.BL])
const stemRightFull = polyStr([sRight.TL,sRight.TR,sRight.BR,sRight.BL])

// Dark triangles (outer solid areas)
// Top:   dark = (L,T,R) = back/upper half
// Left:  dark = (TL,BL,BR) = lower-left half  (main-diagonal TL→BR)
// Right: dark = (TR,BR,BL) = lower-right half  (anti-diagonal TR→BL)
const stemTopDark   = polyStr([sTop.L,    sTop.T,    sTop.R             ])
const stemLeftDark  = polyStr([sLeft.TL,  sLeft.BL,  sLeft.BR           ])
const stemRightDark = polyStr([sRight.TR, sRight.BR, sRight.BL          ])

// Light notch triangles (the "hole" at front-right-top corner)
// Top notch:   (L,R,B) = front half  — includes B=(CX,CY) = front-right-top
// Left notch:  (TL,TR,BR) = upper-right  — includes TR=B = front-right-top
// Right notch: (TL,TR,BL) = upper-left  — includes TL=B = front-right-top
const stemTopNotch   = polyStr([sTop.L,   sTop.R,   sTop.B  ])
const stemLeftNotch  = polyStr([sLeft.TL, sLeft.TR, sLeft.BR])
const stemRightNotch = polyStr([sRight.TL,sRight.TR,sRight.BL])

const STEM_VB_X = STEM_OX - 8
const STEM_VB_Y = STEM_OY - STEM_CY - 8
const STEM_VB_W = 2 * STEM_CX + 16
const STEM_VB_H = STEM_CY + STEM_S + 16

/**
 * MissingCubeSASMO20G4Q15Illustration — the stem figure.
 *
 * Shows a large cube with the top-front-right corner piece missing.
 * Each of the three visible faces has a dark/light triangular split;
 * the three light notches converge at the missing corner (the point where
 * students must identify what piece fits).
 *
 * Does NOT show the answer or the individual pieces.
 */
export default function MissingCubeSASMO20G4Q15Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Kubus besar dengan sudut atas-kanan-depan yang hilang"
    >
      <svg
        viewBox={`${STEM_VB_X.toFixed(1)} ${STEM_VB_Y.toFixed(1)} ${STEM_VB_W.toFixed(1)} ${STEM_VB_H.toFixed(1)}`}
        width={Math.round(STEM_VB_W)}
        height={Math.round(STEM_VB_H)}
        aria-hidden
        style={{ display: 'block' }}
      >
        {/* ── Top face ── */}
        <polygon points={stemTopFull}   fill={STEM_NOTCH} stroke={INK} strokeWidth={SW} />
        <polygon points={stemTopDark}   fill={STEM_DARK}  stroke="none" />
        {/* diagonal divider: L to R (horizontal through top face) */}
        <line x1={sTop.L[0]} y1={sTop.L[1]} x2={sTop.R[0]} y2={sTop.R[1]} stroke={INK} strokeWidth={SW * 0.8} />
        <polygon points={stemTopFull}   fill="none" stroke={INK} strokeWidth={SW} />

        {/* ── Left face ── */}
        <polygon points={stemLeftFull}  fill={STEM_NOTCH} stroke={INK} strokeWidth={SW} />
        <polygon points={stemLeftDark}  fill={STEM_DARK}  stroke="none" />
        {/* diagonal divider: TL to BR */}
        <line
          x1={sLeft.TL[0]} y1={sLeft.TL[1]}
          x2={sLeft.BR[0]} y2={sLeft.BR[1]}
          stroke={INK} strokeWidth={SW * 0.8}
        />
        <polygon points={stemLeftFull}  fill="none" stroke={INK} strokeWidth={SW} />

        {/* ── Right face ── */}
        <polygon points={stemRightFull} fill={STEM_NOTCH} stroke={INK} strokeWidth={SW} />
        <polygon points={stemRightDark} fill={STEM_DARK}  stroke="none" />
        {/* diagonal divider: TR to BL */}
        <line
          x1={sRight.TR[0]} y1={sRight.TR[1]}
          x2={sRight.BL[0]} y2={sRight.BL[1]}
          stroke={INK} strokeWidth={SW * 0.8}
        />
        <polygon points={stemRightFull} fill="none" stroke={INK} strokeWidth={SW} />
      </svg>
    </div>
  )
}
