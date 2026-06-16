// WMI-22F1A-Q12 — "two equal lines of students" figure (Grade 1).
//
// Students stand in TWO vertical columns of EQUAL length, all facing FORWARD
// (front = top). Dan is in the LEFT column with 5 students in front of him, so
// Dan is the 6th from the front. Paul is in the RIGHT column standing in the
// SAME row as Dan (also 6th from the front), with 4 students behind him. Each
// column therefore holds 6 + 4 = 10 students; two columns = 20 total.
//
// The static figure shows ONLY the setup: two columns of 10 student dots, with
// Dan (left, row 6) and Paul (right, row 6) named and tinted, plus a "front"
// arrow at the top. It never prints the total 20 — that is the answer.
//
// The animator imports `StudentLines` and passes `mark` to highlight a subset
// after the answer is revealed:
//   'dan'    — Dan + an "↑5 di depan" cue on the left column
//   'paul'   — Paul + a "4 di belakang↓" cue on the right column
//   'front'  — the 5 students ahead of Dan
//   'behind' — the 4 students behind Paul
//   'all'    — both columns fully lit
// Draw-only; safe to call with no props (renders the plain problem setup).

const PER_COLUMN = 10 // students in each equal column
const DAN_ROW = 6 // Dan / Paul are 6th from the front (1-based)

// --- layout ---------------------------------------------------------------
const HEAD_R = 13 // head radius
const SLOT_H = 50 // vertical spacing between students
const COL_GAP = 132 // horizontal distance between the two columns
const PAD_X = 70 // side padding (room for the Dan / Paul labels)
const PAD_TOP = 56 // room for the "front" arrow + label
const PAD_BOTTOM = 18

const COL_W = HEAD_R * 2 + 12
const VIEW_W = PAD_X * 2 + COL_W + COL_GAP
const VIEW_H = PAD_TOP + (PER_COLUMN - 1) * SLOT_H + HEAD_R * 2 + PAD_BOTTOM

const LEFT_CX = PAD_X + COL_W / 2
const RIGHT_CX = LEFT_CX + COL_GAP

type Mark = 'dan' | 'paul' | 'front' | 'behind' | 'all'

// A single student glyph: round head + shoulders ("bust" silhouette).
// `named` tints the body for Dan / Paul; `lit` rings the glyph for the
// animator's reveal of a counted group.
function Student({
  cx,
  cy,
  named,
  lit,
}: {
  cx: number
  cy: number
  named?: boolean
  lit?: boolean
}) {
  const headCy = cy
  const shoulderTop = cy + HEAD_R + 2
  const shoulderW = HEAD_R * 2 + 6
  // Shoulders = a rounded "hill" under the head.
  const shoulders = [
    `M ${cx - shoulderW / 2} ${shoulderTop + 16}`,
    `Q ${cx - shoulderW / 2} ${shoulderTop} ${cx - shoulderW / 4} ${shoulderTop}`,
    `Q ${cx} ${shoulderTop - 4} ${cx + shoulderW / 4} ${shoulderTop}`,
    `Q ${cx + shoulderW / 2} ${shoulderTop} ${cx + shoulderW / 2} ${shoulderTop + 16}`,
    'Z',
  ].join(' ')

  const bodyClass = named ? 'fill-qupu-brand-orange' : 'fill-qupu-peach'
  const strokeClass = named ? 'stroke-qupu-brand-blue' : 'stroke-qupu-brand-blue'

  return (
    <g>
      {lit && (
        <circle
          cx={cx}
          cy={cy + HEAD_R / 2}
          r={HEAD_R + 12}
          fill="none"
          className="stroke-qupu-brand-blue"
          strokeWidth={3}
          strokeDasharray="4 4"
        />
      )}
      <path d={shoulders} className={bodyClass} />
      <circle cx={cx} cy={headCy} r={HEAD_R} className={`${bodyClass} ${strokeClass}`} strokeWidth={2} />
    </g>
  )
}

/**
 * Reusable primitive: the two equal columns of 10 students each, front at top.
 * `mark` optionally highlights a subset for the post-answer animation. Safe to
 * call with no props — renders the plain problem setup. Never prints the total.
 */
export function StudentLines({ mark }: { mark?: Mark }) {
  // Which rows (0-based) get a dashed ring for the chosen cue.
  const frontRows = new Set<number>() // 0..4 (the 5 ahead of Dan)
  const behindRows = new Set<number>() // 6..9 (the 4 behind Paul)
  for (let r = 0; r < DAN_ROW - 1; r++) frontRows.add(r)
  for (let r = DAN_ROW; r < PER_COLUMN; r++) behindRows.add(r)

  const danRow = DAN_ROW - 1 // 0-based index of Dan / Paul

  const litLeft = new Set<number>()
  const litRight = new Set<number>()
  if (mark === 'dan') litLeft.add(danRow)
  if (mark === 'paul') litRight.add(danRow)
  if (mark === 'front') frontRows.forEach((r) => litLeft.add(r))
  if (mark === 'behind') behindRows.forEach((r) => litRight.add(r))
  if (mark === 'all') {
    for (let r = 0; r < PER_COLUMN; r++) {
      litLeft.add(r)
      litRight.add(r)
    }
  }

  const danY = PAD_TOP + danRow * SLOT_H

  const rows = Array.from({ length: PER_COLUMN }, (_, r) => r)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 300 }}
      aria-hidden="true"
    >
      <defs>
        <marker id="tl-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-qupu-brand-blue" />
        </marker>
      </defs>

      {/* "front" cue at the top: an up-arrow shared by both columns */}
      <line
        x1={LEFT_CX}
        y1={PAD_TOP - 18}
        x2={LEFT_CX}
        y2={PAD_TOP - 38}
        className="stroke-qupu-brand-blue"
        strokeWidth={3}
        markerEnd="url(#tl-arrow)"
      />
      <line
        x1={RIGHT_CX}
        y1={PAD_TOP - 18}
        x2={RIGHT_CX}
        y2={PAD_TOP - 38}
        className="stroke-qupu-brand-blue"
        strokeWidth={3}
        markerEnd="url(#tl-arrow)"
      />
      <text
        x={(LEFT_CX + RIGHT_CX) / 2}
        y={PAD_TOP - 42}
        textAnchor="middle"
        className="font-display fill-qupu-brand-blue"
        fontSize={16}
        fontWeight={800}
      >
        Depan
      </text>

      {/* LEFT column */}
      {rows.map((r) => {
        const cy = PAD_TOP + r * SLOT_H
        const isDan = r === danRow
        return <Student key={`l-${r}`} cx={LEFT_CX} cy={cy} named={isDan} lit={litLeft.has(r)} />
      })}

      {/* RIGHT column */}
      {rows.map((r) => {
        const cy = PAD_TOP + r * SLOT_H
        const isPaul = r === danRow
        return <Student key={`r-${r}`} cx={RIGHT_CX} cy={cy} named={isPaul} lit={litRight.has(r)} />
      })}

      {/* Dan label (left of the left column) */}
      <text
        x={LEFT_CX - HEAD_R - 14}
        y={danY + HEAD_R / 2}
        textAnchor="end"
        dominantBaseline="central"
        className="font-display fill-qupu-brand-blue"
        fontSize={18}
        fontWeight={800}
      >
        Dan
      </text>

      {/* Paul label (right of the right column) */}
      <text
        x={RIGHT_CX + HEAD_R + 14}
        y={danY + HEAD_R / 2}
        textAnchor="start"
        dominantBaseline="central"
        className="font-display fill-qupu-brand-blue"
        fontSize={18}
        fontWeight={800}
      >
        Paul
      </text>

      {/* "5 in front" cue (animator only) */}
      {mark === 'front' && (
        <text
          x={LEFT_CX - HEAD_R - 14}
          y={PAD_TOP + 2 * SLOT_H + HEAD_R / 2}
          textAnchor="end"
          dominantBaseline="central"
          className="font-display fill-qupu-brand-orange"
          fontSize={15}
          fontWeight={800}
        >
          5 di depan
        </text>
      )}

      {/* "4 behind" cue (animator only) */}
      {mark === 'behind' && (
        <text
          x={RIGHT_CX + HEAD_R + 14}
          y={PAD_TOP + 8 * SLOT_H + HEAD_R / 2}
          textAnchor="start"
          dominantBaseline="central"
          className="font-display fill-qupu-brand-orange"
          fontSize={15}
          fontWeight={800}
        >
          4 di belakang
        </text>
      )}
    </svg>
  )
}

export default function TwoLines22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua barisan murid yang sama panjang menghadap ke depan. Dan berada di barisan kiri dengan 5 murid di depannya. Paul berada di barisan kanan, sebaris dengan Dan, dengan 4 murid di belakangnya."
    >
      <StudentLines />
    </div>
  )
}
