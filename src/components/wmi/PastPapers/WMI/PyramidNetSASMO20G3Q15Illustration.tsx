// SASMO-20-G3-Q15 — "Gambar manakah di bawah ini yang dapat membentuk piramida
// yang ditunjukkan di sebelah kanan?" (Which flat net folds into the given pyramid?)
// Answer: B.
//
// Stem: 3-D triangular pyramid (tetrahedron) in front-right oblique view, showing
//   two clown-face side faces:
//     Left face  = Face 2: green hat, NO hat-dot, green BOW TIE.
//     Right face = Face 1: green hat, RED DOT on hat tip, NO bow tie.
//
// Net (Options A–E): large ▽ equilateral triangle subdivided by midpoints into
//   4 equilateral triangles:
//     • 3 corner flaps (T_topL, T_topR, T_bot) — fold up to become side faces.
//     • 1 central ▲ (T_ctr) — becomes the tetrahedron base (fold creases dashed).
//   Only option B has Face 1 (hatDot=true, bowTie=false) and Face 2
//   (hatDot=false, bowTie=true) correctly placed so they fold onto the pyramid.
//
// Co-exports:
//   PyramidNetSASMO20G3Q15Option — renders ONE choice net (A–E) for CHOICE_RENDERERS.
//   ClownFace, NetOption, geometry constants — imported by the Explainer.
//
// No primitive in PRIMITIVE-INDEX matches this type. Fresh pure-SVG, SSR-safe.

import type { ReactElement } from 'react'
import type { WmiChoice } from '../../../../types/wmi'

// ── Palette ──────────────────────────────────────────────────────────────────
export const INK    = '#1F2937'
export const SKIN   = '#F5D59A'
export const HAT_C  = '#2A7A48'
export const NOSE_C = '#D93030'
export const EYE_W  = '#FFFFFF'
export const EYE_P  = '#1F2937'
export const W_DOT  = '#FFFFFF'
export const TRI_BG = '#EFEFEF'
export const CTR_BG = '#E1ECDB'
export const FOLD_C = '#B0B0B0'
export const NET_BD = '#37474F'
export const PYR_LF = '#C4D9EE'
export const PYR_RF = '#DCEEF8'

// ── ClownFace ─────────────────────────────────────────────────────────────────
// Renders a clown face centered at (cx, cy) with face-circle radius r.
// Hat extends above the face; bow tie extends below (when bowTie=true).
// Wrap in <g clipPath="url(#...)"> to constrain to the triangle.
export function ClownFace({
  cx, cy, r, hatDot, bowTie,
}: {
  cx: number; cy: number; r: number
  hatDot: boolean; bowTie: boolean
}): ReactElement {
  const hw     = r * 0.65
  const hBaseY = cy - r * 0.85
  const hTipY  = hBaseY - r * 0.72

  return (
    <g>
      {/* Hat */}
      <polygon
        points={`${cx},${hTipY} ${cx - hw},${hBaseY} ${cx + hw},${hBaseY}`}
        fill={HAT_C} stroke={INK} strokeWidth={0.6}
      />
      {/* Hat-tip dot (Face 1 only) */}
      {hatDot && (
        <circle cx={cx} cy={hTipY - r * 0.13} r={r * 0.12}
          fill={NOSE_C} stroke={INK} strokeWidth={0.4} />
      )}
      {/* Face */}
      <circle cx={cx} cy={cy} r={r} fill={SKIN} stroke={INK} strokeWidth={0.7} />
      {/* Left eye (pupils shifted right → "eyes right") */}
      <circle cx={cx - r * 0.3} cy={cy - r * 0.15} r={r * 0.17}
        fill={EYE_W} stroke={INK} strokeWidth={0.45} />
      <circle cx={cx - r * 0.24} cy={cy - r * 0.15} r={r * 0.08} fill={EYE_P} />
      {/* Right eye */}
      <circle cx={cx + r * 0.3} cy={cy - r * 0.15} r={r * 0.17}
        fill={EYE_W} stroke={INK} strokeWidth={0.45} />
      <circle cx={cx + r * 0.36} cy={cy - r * 0.15} r={r * 0.08} fill={EYE_P} />
      {/* Nose */}
      <circle cx={cx} cy={cy + r * 0.15} r={r * 0.18} fill={NOSE_C} />
      {/* White dot LEFT of nose */}
      <circle cx={cx - r * 0.28} cy={cy + r * 0.15} r={r * 0.09} fill={W_DOT} />
      {/* Smile */}
      <path
        d={`M ${cx - r * 0.42},${cy + r * 0.38} Q ${cx},${cy + r * 0.62} ${cx + r * 0.42},${cy + r * 0.38}`}
        fill="none" stroke={NOSE_C}
        strokeWidth={Math.max(r * 0.08, 0.7)} strokeLinecap="round"
      />
      {/* Bow tie (Face 2 only) */}
      {bowTie && (
        <g>
          <polygon
            points={`${cx},${cy + r * 1.08} ${cx - r * 0.52},${cy + r * 0.88} ${cx - r * 0.52},${cy + r * 1.28}`}
            fill={HAT_C} stroke={INK} strokeWidth={0.45}
          />
          <polygon
            points={`${cx},${cy + r * 1.08} ${cx + r * 0.52},${cy + r * 0.88} ${cx + r * 0.52},${cy + r * 1.28}`}
            fill={HAT_C} stroke={INK} strokeWidth={0.45}
          />
          <circle cx={cx} cy={cy + r * 1.08} r={r * 0.08} fill={HAT_C} stroke={INK} strokeWidth={0.4} />
        </g>
      )}
    </g>
  )
}

// ── Net geometry ──────────────────────────────────────────────────────────────
// Large ▽ equilateral triangle (side ≈ 180), outer vertices TL / TR / BOT.
// Subdivided by edge-midpoints MT / ML / MR into 4 smaller equilateral triangles.
//
//    TL(10,5)──MT(100,5)──TR(190,5)
//      \   T_topL │ T_topR   /
//       ML(55,83)─┼─MR(145,83)
//          \   T_ctr(▲)  /
//           \    T_bot  /
//          BOT(100,161)

export type Pt = { x: number; y: number }
export function pstr(pts: readonly Pt[]): string {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}

export const TL:  Pt = { x: 10,  y: 5   }
export const TR:  Pt = { x: 190, y: 5   }
export const BOT: Pt = { x: 100, y: 161 }
export const MT:  Pt = { x: 100, y: 5   }
export const ML:  Pt = { x: 55,  y: 83  }
export const MR:  Pt = { x: 145, y: 83  }

export const TRI_TOPL = [TL, MT, ML] as const
export const TRI_TOPR = [MT, TR, MR] as const
export const TRI_CTR  = [MT, MR, ML] as const
export const TRI_BOT  = [ML, MR, BOT] as const

// Centroids of the four sub-triangles
export const C_TL: Pt = { x: 55,  y: 31  }
export const C_TR: Pt = { x: 145, y: 31  }
export const C_C:  Pt = { x: 100, y: 57  }
export const C_B:  Pt = { x: 100, y: 109 }

export const FACE_R = 15  // face-circle radius for net options

// ── Face configs per option ───────────────────────────────────────────────────
// Array order: [T_topL, T_topR, T_ctr, T_bot]
// Face 1 (F1): hatDot=true,  bowTie=false  → only dot on hat, no bow
// Face 2 (F2): hatDot=false, bowTie=true   → no hat dot, green bow tie
export type FC = { hatDot: boolean; bowTie: boolean }
export const OPT: Record<string, [FC, FC, FC, FC]> = {
  // A: top-left has both features (wrong combo) — no F2 anywhere → wrong
  A: [
    { hatDot: true,  bowTie: true  },
    { hatDot: true,  bowTie: false },
    { hatDot: true,  bowTie: false },
    { hatDot: true,  bowTie: false },
  ],
  // B: three F1 faces + F2 at bottom corner → CORRECT
  B: [
    { hatDot: true,  bowTie: false },
    { hatDot: true,  bowTie: false },
    { hatDot: true,  bowTie: false },
    { hatDot: false, bowTie: true  },
  ],
  // C: bow tie appears in center (base position) and top-right → wrong
  C: [
    { hatDot: true,  bowTie: false },
    { hatDot: true,  bowTie: true  },
    { hatDot: true,  bowTie: true  },
    { hatDot: true,  bowTie: false },
  ],
  // D: F2 placed at center (wrong position) instead of bottom corner → wrong
  D: [
    { hatDot: true,  bowTie: false },
    { hatDot: true,  bowTie: true  },
    { hatDot: false, bowTie: true  },
    { hatDot: true,  bowTie: false },
  ],
  // E: F2 duplicate in top-right and bottom (no hat dots = wrong combo) → wrong
  E: [
    { hatDot: false, bowTie: false },
    { hatDot: false, bowTie: true  },
    { hatDot: true,  bowTie: true  },
    { hatDot: false, bowTie: true  },
  ],
}

// ── NetOption — renders a flat net SVG ───────────────────────────────────────
export function NetOption({ label, uid }: { label: string; uid?: string }): ReactElement {
  const faces = OPT[label]
  if (!faces) return <></>
  const [fTL, fTR, fC, fB] = faces
  const id = uid ?? label

  return (
    <svg viewBox="0 0 200 175" width="130" height="114">
      <defs>
        <clipPath id={`cp-tl-${id}`}><polygon points={pstr(TRI_TOPL)} /></clipPath>
        <clipPath id={`cp-tr-${id}`}><polygon points={pstr(TRI_TOPR)} /></clipPath>
        <clipPath id={`cp-c-${id}`}><polygon  points={pstr(TRI_CTR)}  /></clipPath>
        <clipPath id={`cp-b-${id}`}><polygon  points={pstr(TRI_BOT)}  /></clipPath>
      </defs>

      {/* Triangle backgrounds */}
      <polygon points={pstr(TRI_TOPL)} fill={TRI_BG} />
      <polygon points={pstr(TRI_TOPR)} fill={TRI_BG} />
      <polygon points={pstr(TRI_CTR)}  fill={CTR_BG} />
      <polygon points={pstr(TRI_BOT)}  fill={TRI_BG} />

      {/* Clown faces, clipped to each triangle */}
      <g clipPath={`url(#cp-tl-${id})`}>
        <ClownFace cx={C_TL.x} cy={C_TL.y} r={FACE_R} {...fTL} />
      </g>
      <g clipPath={`url(#cp-tr-${id})`}>
        <ClownFace cx={C_TR.x} cy={C_TR.y} r={FACE_R} {...fTR} />
      </g>
      <g clipPath={`url(#cp-c-${id})`}>
        <ClownFace cx={C_C.x} cy={C_C.y} r={FACE_R} {...fC} />
      </g>
      <g clipPath={`url(#cp-b-${id})`}>
        <ClownFace cx={C_B.x} cy={C_B.y} r={FACE_R} {...fB} />
      </g>

      {/* Fold crease lines (dashed) on the three edges of the central ▲ */}
      <line x1={MT.x} y1={MT.y} x2={ML.x} y2={ML.y}
        stroke={FOLD_C} strokeWidth={1} strokeDasharray="4,3" />
      <line x1={MT.x} y1={MT.y} x2={MR.x} y2={MR.y}
        stroke={FOLD_C} strokeWidth={1} strokeDasharray="4,3" />
      <line x1={ML.x} y1={ML.y} x2={MR.x} y2={MR.y}
        stroke={FOLD_C} strokeWidth={1} strokeDasharray="4,3" />

      {/* Outer net border */}
      <polygon points={pstr([TL, TR, BOT])} fill="none" stroke={NET_BD} strokeWidth={1.5} />
    </svg>
  )
}

// ── 3-D pyramid geometry ──────────────────────────────────────────────────────
// Apex A at top; three base vertices LL (front-left), RL (front-right), BC (back-center).
// Two visible side faces: left {A,LL,BC} = Face 2; right {A,BC,RL} = Face 1.
export const A:   Pt = { x: 100, y: 15  }
export const LL:  Pt = { x: 22,  y: 152 }
export const RL:  Pt = { x: 178, y: 152 }
export const BC:  Pt = { x: 100, y: 108 }
export const CLF: Pt = { x: 74,  y: 92  }  // centroid of left face
export const CRF: Pt = { x: 126, y: 92  }  // centroid of right face
export const PYR_R = 22                      // clown face radius for pyramid

// ── Stem illustration ─────────────────────────────────────────────────────────
export default function PyramidNetSASMO20G3Q15Illustration(): ReactElement {
  return (
    <svg
      viewBox="0 0 200 170"
      width="200"
      height="170"
      aria-label="Triangular pyramid — left face has bow tie (Face 2), right face has hat dot (Face 1)"
    >
      <defs>
        <clipPath id="pn-lf"><polygon points={pstr([A, LL, BC])} /></clipPath>
        <clipPath id="pn-rf"><polygon points={pstr([A, BC, RL])} /></clipPath>
      </defs>

      {/* Left face (Face 2: bow tie, no hat dot) */}
      <polygon points={pstr([A, LL, BC])} fill={PYR_LF} stroke={INK} strokeWidth={1.4} />
      <g clipPath="url(#pn-lf)">
        <ClownFace cx={CLF.x} cy={CLF.y} r={PYR_R} hatDot={false} bowTie={true} />
      </g>

      {/* Right face (Face 1: hat dot, no bow tie) */}
      <polygon points={pstr([A, BC, RL])} fill={PYR_RF} stroke={INK} strokeWidth={1.4} />
      <g clipPath="url(#pn-rf)">
        <ClownFace cx={CRF.x} cy={CRF.y} r={PYR_R} hatDot={true} bowTie={false} />
      </g>

      {/* Base edges */}
      <line x1={LL.x} y1={LL.y} x2={RL.x} y2={RL.y} stroke={INK} strokeWidth={1.2} />
      <line x1={LL.x} y1={LL.y} x2={BC.x} y2={BC.y}
        stroke={INK} strokeWidth={0.8} strokeDasharray="5,3" />
      <line x1={RL.x} y1={RL.y} x2={BC.x} y2={BC.y}
        stroke={INK} strokeWidth={0.8} strokeDasharray="5,3" />

      {/* Apex */}
      <circle cx={A.x} cy={A.y} r={2.5} fill={INK} />
    </svg>
  )
}

// ── Choice renderer ───────────────────────────────────────────────────────────
export function PyramidNetSASMO20G3Q15Option({ choice }: { choice: WmiChoice }): ReactElement {
  if (!OPT[choice.label]) return <span>{choice.text}</span>
  return (
    <span
      role="img"
      aria-label={`Jaring pilihan ${choice.label}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <NetOption label={choice.label} uid={`opt-${choice.label}`} />
    </span>
  )
}
