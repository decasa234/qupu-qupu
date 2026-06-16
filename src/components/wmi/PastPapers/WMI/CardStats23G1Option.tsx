/**
 * CHOICE renderer for WMI-23F1A-Q13 (2023 Grade 1 Final).
 *
 * Each option is a single card — one monochrome shape (□ ○ △) in one colour
 * (gray / white) — read straight from the scanned option images and hardcoded
 * by label so the drawn card can never drift from the printed paper:
 *
 *   A = white triangle  (images/f6c3879192…0622.jpg)
 *   B = gray  circle    (images/1524bd10…64cd.jpg)
 *   C = white square    (images/69846b20…3df99.jpg)
 *   D = GRAY  TRIANGLE   (images/5355d2bc…701c4.jpg)   ← ANSWER
 *   E = white circle    (images/63fd069f…a437c.jpg)
 *
 * Why D: the "?" must complete BOTH printed tallies. Triangles need 4 but only
 * 3 are visible (missing → triangle); gray needs 7 but only 6 are visible
 * (missing → gray). The unique card that is both gray AND a triangle is D.
 *
 * Reuses ShapeGlyph from the stem illustration so the shape/colour vocabulary
 * stays identical across the figure, the tally tables and the options.
 */

import type { WmiChoice } from '../../../../types/wmi'
import { ShapeGlyph, type CardSpec } from './CardStats23G1Illustration'

// The card printed in each option, keyed by choice label (from the scans).
const OPTION_CARD: Record<'A' | 'B' | 'C' | 'D' | 'E', CardSpec> = {
  A: { shape: 'triangle', color: 'white' },
  B: { shape: 'circle', color: 'gray' },
  C: { shape: 'square', color: 'white' },
  D: { shape: 'triangle', color: 'gray' },
  E: { shape: 'circle', color: 'white' },
}

const SHAPE_ID: Record<CardSpec['shape'], string> = {
  square: 'persegi',
  circle: 'lingkaran',
  triangle: 'segitiga',
}
const COLOR_ID: Record<CardSpec['color'], string> = {
  gray: 'abu-abu',
  white: 'putih',
}

export default function CardStats23G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const spec = OPTION_CARD[label]
  // Fallback to plain text for any label we don't know how to draw.
  if (!spec) return <span>{choice?.text}</span>

  const size = 56
  const pad = 8 // headroom so strokes never clip
  const cell = size + pad * 2

  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: kartu ${SHAPE_ID[spec.shape]} ${COLOR_ID[spec.color]}.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${cell} ${cell}`}
        width={56}
        height={56}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* card backing so white-fill outlined shapes read as cards */}
        <rect
          x={2}
          y={2}
          width={cell - 4}
          height={cell - 4}
          rx={7}
          fill="#fff9f4"
          stroke="#d9cfc0"
          strokeWidth={1.6}
        />
        <g transform={`translate(${pad} ${pad})`}>
          <ShapeGlyph shape={spec.shape} color={spec.color} size={size} />
        </g>
      </svg>
    </span>
  )
}
