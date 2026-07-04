// In-card illustration for WMI-25F2A-Q11 (2025 Grade-2 Final).
//
// The printed question is a horizontal sequence of bottom-aligned face stacks.
// Reading db/seed/wmi/figures/2025-final-g2-a-q11.jpg left to right, each column
// is a pile of round faces — yellow filled faces are HAPPY (smiling), white
// outline faces are SAD (frowning). The column heights run 1, 2, 3 and repeat in
// groups of three; the middle slot of the second group is the gap marked "?".
//
//   Col 1 (h1):  happy
//   Col 2 (h2):  sad, sad                       (bottom -> top)
//   Col 3 (h3):  happy, happy, happy
//   Col 4 (h1):  sad
//   Col 5:       ?  (the gap — a dashed oval with a question mark, height-2 slot)
//   Col 6 (h3):  sad, sad, sad
//   Col 7 (h1):  happy
//   Col 8 (h2):  sad, sad
//   Col 9 (h3):  happy, happy, happy
//
// Heights: 1,2,3, 1,?,3, 1,2,3 — the gap sits in a height-2 slot, so 2 faces.
// Column EXPRESSIONS alternate along the row: H, S, H, S, [?], S, H, S, H — so
// the gap is a happy column: 2 happy faces → option C.
// (The printed picture options are not in the scan; option C's content is
// reconstructed as "2 happy" — the only content that makes the keyed letter C
// consistent with the alternation the scan forces. See the paper review flag.)
//
// We redraw everything in the house style (drawn circles + eyes + mouth arcs,
// NO emoji) so the figure is SSR-safe and deterministic. The static figure NEVER
// resolves the "?" — revealing the answer is the animator's job.

const INK = '#1F2937'
const HAPPY_FILL = '#ffdd55' // qupu-brand-yellow
const SAD_FILL = '#ffffff'

export type Face = 'happy' | 'sad'

// Each stem column, bottom-aligned, listed bottom -> top. `null` marks the gap.
// Co-exported so the explainer/animator bind to the same source of truth.
export const STEM_25G2: Array<Face[] | null> = [
  ['happy'], // col 1
  ['sad', 'sad'], // col 2
  ['happy', 'happy', 'happy'], // col 3
  ['sad'], // col 4
  null, // col 5 — the gap
  ['sad', 'sad', 'sad'], // col 6
  ['happy'], // col 7
  ['sad', 'sad'], // col 8
  ['happy', 'happy', 'happy'], // col 9
]

// The five answer options, each a face stack listed bottom -> top. The seed only
// gives counts; we order happy-below / sad-above by a consistent convention.
export const OPTIONS_25G2: Record<'A' | 'B' | 'C' | 'D' | 'E', Face[]> = {
  A: ['happy', 'happy', 'sad'], // 2 happy + 1 sad
  B: ['sad', 'sad'], // 2 sad
  C: ['happy', 'happy'], // 2 happy  (answer — reconstructed, see header note)
  D: ['happy'], // 1 happy
  E: ['sad', 'sad', 'sad'], // 3 sad
}

function stackAria(faces: Face[]): string {
  const happy = faces.filter((f) => f === 'happy').length
  const sad = faces.filter((f) => f === 'sad').length
  const parts: string[] = []
  if (happy) parts.push(`${happy} senang`)
  if (sad) parts.push(`${sad} sedih`)
  return parts.join(' + ') || 'kosong'
}

// A single drawn face centered at (cx, cy), radius r. Happy = yellow with a
// smiling mouth; Sad = white outline with a frowning mouth. No emoji.
export function FaceGlyph({
  face,
  cx,
  cy,
  r = 16,
  strokeWidth = 2.2,
}: {
  face: Face
  cx: number
  cy: number
  r?: number
  strokeWidth?: number
}) {
  const happy = face === 'happy'
  const eyeR = Math.max(1, r * 0.1)
  const eyeY = cy - r * 0.18
  const eyeDx = r * 0.38
  const mouthW = r * 0.5
  // The mouth is a quadratic arc whose endpoints sit at (cx ± mouthW). For a
  // smile the control point dips below the endpoints; for a frown it lifts above
  // them. We nudge the endpoints in the opposite direction so the curve reads
  // clearly as an upturned (happy) or downturned (sad) arc.
  const endY = cy + r * 0.28 + (happy ? -r * 0.06 : r * 0.16)
  const ctrlY = cy + r * 0.28 + (happy ? r * 0.42 : -r * 0.34)
  const mouth = `M ${cx - mouthW} ${endY} Q ${cx} ${ctrlY} ${cx + mouthW} ${endY}`
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={happy ? HAPPY_FILL : SAD_FILL} stroke={INK} strokeWidth={strokeWidth} />
      <circle cx={cx - eyeDx} cy={eyeY} r={eyeR} fill={INK} />
      <circle cx={cx + eyeDx} cy={eyeY} r={eyeR} fill={INK} />
      <path d={mouth} fill="none" stroke={INK} strokeWidth={Math.max(1.6, strokeWidth * 0.9)} strokeLinecap="round" />
    </g>
  )
}

// A bottom-aligned vertical stack of faces, with its bottom face centered at
// (cx, baseCy). Used by the stem figure and the option renderer.
export function FaceColumn({
  faces,
  cx,
  baseCy,
  r = 16,
  vGap = 4,
}: {
  faces: Face[]
  cx: number
  baseCy: number
  r?: number
  vGap?: number
}) {
  const step = 2 * r + vGap
  return (
    <g>
      {faces.map((f, i) => (
        <FaceGlyph key={i} face={f} cx={cx} cy={baseCy - i * step} r={r} />
      ))}
    </g>
  )
}

// The dashed "?" gap, drawn as a tall dashed oval with a question mark — exactly
// as printed, occupying a height-2 slot. Never resolved in the static figure.
function GapMarker({ cx, baseCy, r, vGap }: { cx: number; baseCy: number; r: number; vGap: number }) {
  const step = 2 * r + vGap
  // Center the oval over the two-face slot (rows 0 and 1).
  const midY = baseCy - step / 2
  const ry = step / 2 + r * 0.9
  const rx = r * 1.1
  return (
    <g>
      <ellipse
        cx={cx}
        cy={midY}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={r * 1.6}
        fontWeight={900}
        fill={INK}
        className="font-display"
      >
        ?
      </text>
    </g>
  )
}

// The framed stem figure for the problem card: nine bottom-aligned columns with
// the dashed "?" gap as column 5. Never reveals which option fits.
export default function FaceSeq25G2Illustration() {
  const R = 16
  const VGAP = 4
  const COL_GAP = 18
  const PAD = 10
  const step = 2 * R + VGAP
  // Tallest column is height 3.
  const maxH = 3
  const colW = 2 * R
  const cols = STEM_25G2.length
  const W = PAD * 2 + cols * colW + (cols - 1) * COL_GAP
  // Baseline (bottom face center) sits low; reserve headroom for 3 faces + the
  // gap oval which overshoots the top face slightly.
  const baseCy = PAD + (maxH - 1) * step + R
  const H = baseCy + R + PAD

  const ariaParts = STEM_25G2.map((col, i) =>
    col == null ? `kolom ${i + 1}: ?` : `kolom ${i + 1}: ${stackAria(col)}`,
  )

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Pola wajah: sembilan kolom tumpukan wajah senang (kuning) dan sedih (putih), tinggi berulang 1, 2, 3. ${ariaParts.join('; ')}. Kolom ke-5 adalah celah bertanda tanya.`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: Math.min(360, W), display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {STEM_25G2.map((col, i) => {
          const cx = PAD + R + i * (colW + COL_GAP)
          if (col == null) {
            return <GapMarker key={i} cx={cx} baseCy={baseCy} r={R} vGap={VGAP} />
          }
          return <FaceColumn key={i} faces={col} cx={cx} baseCy={baseCy} r={R} vGap={VGAP} />
        })}
      </svg>
    </div>
  )
}

// CHOICE_RENDERERS-style component: draws ONE option's face stack given its
// label, so the answer chips show the figure instead of a bare letter. Falls back
// to the plain choice text for any unexpected label so previews stay safe.
export function FaceSeq25G2Option({ choice }: { choice: { label: string; text: string } }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const faces = OPTIONS_25G2[label]
  if (!faces) return <span>{choice?.text}</span>
  const R = 13
  const VGAP = 4
  const PAD = 6
  const step = 2 * R + VGAP
  const w = PAD * 2 + 2 * R
  const h = PAD * 2 + faces.length * 2 * R + (faces.length - 1) * VGAP
  const baseCy = h - PAD - R
  const cx = w / 2
  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: ${stackAria(faces)} (${faces.length} wajah).`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(64, w)} style={{ display: 'block' }} aria-hidden="true">
        {faces.map((f, i) => (
          <FaceGlyph key={i} face={f} cx={cx} cy={baseCy - i * step} r={R} strokeWidth={2} />
        ))}
      </svg>
    </span>
  )
}
