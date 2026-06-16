import type { WmiChoice } from '../../../../types/wmi'
import { FaceShape, type SeqShape, type SeqMood } from './ShapeSeq25G1Illustration'

// CHOICE renderer for WMI-25F1A-Q13 (Grade 1): the A–E answer shapes for the
// "which shape continues the sequence?" question. Each option is one outlined
// shape with a smile/frown face, read straight from the scanned Paper A images
// so the drawn option can never drift from the printed question.
//
// Scanned options:
//   A = diamond + frown   ← correct (the '?' resolves to a sad diamond)
//   B = triangle + frown
//   C = circle  + smile
//   D = triangle + smile
//   E = diamond + smile
//
// The renderer reuses FaceShape from the stem, so the options share one clean
// monochrome shape set with the sequence row.
export const OPTION_SHAPES: Record<'A' | 'B' | 'C' | 'D' | 'E', { shape: SeqShape; mood: SeqMood }> = {
  A: { shape: 'diamond', mood: 'frown' },
  B: { shape: 'triangle', mood: 'frown' },
  C: { shape: 'circle', mood: 'smile' },
  D: { shape: 'triangle', mood: 'smile' },
  E: { shape: 'diamond', mood: 'smile' },
}

const MOOD_LABEL: Record<SeqMood, string> = { smile: 'tersenyum', frown: 'cemberut' }
const SHAPE_LABEL: Record<SeqShape, string> = {
  triangle: 'segitiga',
  circle: 'lingkaran',
  square: 'persegi',
  pentagon: 'segilima',
  diamond: 'belah ketupat',
}

export default function ShapeSeq25G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const spec = OPTION_SHAPES[label]
  // Fall back to plain text for any unexpected label so previews stay safe.
  if (!spec) return <span>{choice?.text}</span>

  const r = 22
  const pad = 8
  const size = r * 2 + pad * 2 + 8
  const c = size / 2

  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: ${SHAPE_LABEL[spec.shape]} ${MOOD_LABEL[spec.mood]}.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={Math.min(72, size)} style={{ display: 'block' }}>
        <FaceShape shape={spec.shape} mood={spec.mood} cx={c} cy={c} r={r} strokeWidth={2.2} />
      </svg>
    </span>
  )
}
