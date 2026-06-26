// SASMO-20-G3-Q3 — "Study the pattern below and find '?'" (face-grid matrix pattern)
//
// A 3×3 grid of cartoon faces. Each face varies in two attributes:
//   Mouth  : smile | flat | frown  — forms a 3×3 Latin square
//   Hair   : count (0/1/2/3 strokes) + direction (left | up | right)
//
// Answer: C — single stroke upper-right + smile.
//
// Exports:
//   default               — FacePatternSASMO20G3Q3Illustration (3×3 stem grid with "?")
//   FacePatternSASMO20G3Q3Option — choice renderer (A–E) for CHOICE_RENDERERS
//
// Pure SVG, no Math.random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Face spec type
// ---------------------------------------------------------------------------

export type Mouth   = 'smile' | 'flat' | 'frown'
export type HairDir = 'left'  | 'up'   | 'right' | 'none'

export interface FaceSpec {
  mouth:   Mouth
  hair:    number    // 0 = no strokes; 1, 2, or 3 strokes
  hairDir: HairDir
}

// ---------------------------------------------------------------------------
// Face rendering constants
// ---------------------------------------------------------------------------

const INK       = '#111827'
const FACE_FILL = '#FFFFFF'
const R         = 36    // head radius
const EYE_R     = 3.5  // eye dot radius
const EYE_DX    = 12   // eye x-offset from center
const EYE_DY    = 11   // eye y-offset up from center

// ---------------------------------------------------------------------------
// Low-level face renderer (renders relative to local origin 0,0 = face centre)
// ---------------------------------------------------------------------------

function FaceParts({ mouth, hair, hairDir }: FaceSpec) {
  // Hair strokes ─ built from top-of-circle, fanning at the given direction
  const hairStrokes: Array<[number, number, number, number]> = []
  if (hair > 0 && hairDir !== 'none') {
    const spacing = 5
    for (let i = 0; i < hair; i++) {
      const xBase = (i - (hair - 1) / 2) * spacing
      const yBase = -R + 2            // just at the top edge of the circle
      let xEnd: number, yEnd: number
      if (hairDir === 'up') {
        xEnd = xBase;     yEnd = yBase - 16
      } else if (hairDir === 'left') {
        xEnd = xBase - 12; yEnd = yBase - 12
      } else {             // right
        xEnd = xBase + 12; yEnd = yBase - 12
      }
      hairStrokes.push([xBase, yBase, xEnd, yEnd])
    }
  }

  // Mouth path (all coords relative to face centre)
  let mouthD: string
  if (mouth === 'smile') {
    mouthD = 'M -14,16 Q 0,27 14,16'
  } else if (mouth === 'frown') {
    mouthD = 'M -14,24 Q 0,14 14,24'
  } else {
    mouthD = 'M -14,20 L 14,20'
  }

  return (
    <>
      {/* Head */}
      <circle cx={0} cy={0} r={R} fill={FACE_FILL} stroke={INK} strokeWidth={2} />

      {/* Hair strokes */}
      {hairStrokes.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={INK} strokeWidth={2.5} strokeLinecap="round"
        />
      ))}

      {/* Eyes */}
      <circle cx={-EYE_DX} cy={-EYE_DY} r={EYE_R} fill={INK} />
      <circle cx={ EYE_DX} cy={-EYE_DY} r={EYE_R} fill={INK} />

      {/* Nose (short vertical bar) */}
      <line x1={0} y1={-1} x2={0} y2={9} stroke={INK} strokeWidth={2} strokeLinecap="round" />

      {/* Mouth */}
      <path d={mouthD} stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  )
}

// ---------------------------------------------------------------------------
// Stem grid: 3×3 cells, face centred at (CELL/2, CELL/2) in each cell
// ---------------------------------------------------------------------------

const CELL = 90   // px per cell
const PAD  = 4    // outer padding
const GRID_W = CELL * 3 + PAD * 2
const GRID_H = CELL * 3 + PAD * 2

// Row-major order: 9 entries; null = the "?" cell (bottom-right)
export const STEM_FACES: Array<FaceSpec | null> = [
  // Row 0
  { mouth: 'flat',  hair: 1, hairDir: 'left'  },
  { mouth: 'smile', hair: 1, hairDir: 'up'    },
  { mouth: 'frown', hair: 2, hairDir: 'right' },
  // Row 1
  { mouth: 'smile', hair: 2, hairDir: 'left'  },
  { mouth: 'frown', hair: 1, hairDir: 'up'    },
  { mouth: 'flat',  hair: 1, hairDir: 'right' },
  // Row 2
  { mouth: 'frown', hair: 0, hairDir: 'none'  },
  { mouth: 'flat',  hair: 2, hairDir: 'up'    },
  null,  // ← the "?" position
]

/**
 * FacePatternSASMO20G3Q3Illustration — shows the 3×3 pattern grid with "?" in the
 * bottom-right cell. Does NOT reveal the answer.
 */
export default function FacePatternSASMO20G3Q3Illustration() {
  const cx = CELL / 2   // face centre x within a cell
  const cy = CELL / 2   // face centre y within a cell

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Tiga kali tiga kotak berisi wajah kartun — setiap wajah berbeda ekspresi mulut ' +
        '(senyum, datar, sedih) dan rambut. Temukan gambar yang benar untuk kotak bertanda tanya.'
      }
    >
      <svg
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        width={GRID_W}
        height={GRID_H}
        aria-hidden="true"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {STEM_FACES.map((spec, idx) => {
          const col = idx % 3
          const row = Math.floor(idx / 3)
          const tx = PAD + col * CELL
          const ty = PAD + row * CELL

          return (
            <g key={idx} transform={`translate(${tx}, ${ty})`}>
              {/* Cell border */}
              <rect x={0} y={0} width={CELL} height={CELL} fill="#F9FAFB" stroke={INK} strokeWidth={1.5} />

              {spec === null ? (
                /* "?" placeholder */
                <text
                  x={cx} y={cy + 14}
                  textAnchor="middle"
                  fontSize={48}
                  fontWeight="bold"
                  fill={INK}
                  fontFamily="serif"
                >
                  ?
                </text>
              ) : (
                <g transform={`translate(${cx}, ${cy})`}>
                  <FaceParts {...spec} />
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderer — one face per choice label (A–E)
// ---------------------------------------------------------------------------

/** Face specs for each choice option (faithfully reconstructed from source crops). */
export const OPTION_FACES: Record<string, FaceSpec> = {
  A: { mouth: 'frown', hair: 1, hairDir: 'left'  },
  B: { mouth: 'smile', hair: 3, hairDir: 'left'  },
  C: { mouth: 'smile', hair: 1, hairDir: 'right' },   // ← correct answer
  D: { mouth: 'smile', hair: 2, hairDir: 'right' },
  E: { mouth: 'flat',  hair: 1, hairDir: 'right' },
}

const OPT_SIZE = 90   // px for the option SVG

/**
 * FacePatternSASMO20G3Q3Option — renders ONE A/B/C/D/E choice as a cartoon face.
 * Used in CHOICE_RENDERERS['SASMO-20-G3-Q3'].
 */
export function FacePatternSASMO20G3Q3Option({ choice }: { choice: WmiChoice }) {
  const spec = OPTION_FACES[choice.label]
  if (!spec) return <span>{choice.text}</span>

  const mouthLabel =
    spec.mouth === 'smile' ? (choice.label === 'id' ? 'senyum' : 'smile') :
    spec.mouth === 'frown' ? (choice.label === 'id' ? 'sedih'  : 'frown') :
                              (choice.label === 'id' ? 'datar'  : 'flat')

  return (
    <span
      role="img"
      aria-label={`Option ${choice.label}: face with ${spec.hair} hair stroke(s) to the ${spec.hairDir}, ${mouthLabel} mouth`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`${-OPT_SIZE / 2} ${-OPT_SIZE / 2} ${OPT_SIZE} ${OPT_SIZE}`}
        width={OPT_SIZE}
        height={OPT_SIZE}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <FaceParts {...spec} />
      </svg>
    </span>
  )
}
