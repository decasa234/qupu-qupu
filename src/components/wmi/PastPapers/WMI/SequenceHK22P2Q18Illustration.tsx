// HKIMO 2022 Heat Primary-2 Q18
// "By observing the pattern, from left to right, what is the missing figure?"
//
// Sequence (from paper): ●,▲,●,▲,▲,●,●,▲,▲,▲,●,●,▲,▲,▲,▲,●,▲,▲,▲,▲,?,●…
//
// Triangle (▲) runs grow by exactly 1 each time: 1, 2, 3, 4, 5
//   Run 1 (index 1):      1▲
//   Run 2 (indices 3–4):  2▲
//   Run 3 (indices 7–9):  3▲
//   Run 4 (indices 12–15):4▲
//   Run 5 (indices 17–21):5▲  ← index 21 = ?
//
// Answer: ▲  (the 5th triangle in the 5th run)

// ── exported constants (reused by explainer + steps) ──────────────────────────

export const SEQUENCE: ('●' | '▲' | '?')[] = [
  '●','▲','●','▲','▲','●','●','▲','▲','▲',
  '●','●','▲','▲','▲','▲','●','▲','▲','▲','▲','?','●',
]

/** 0-based index of the ? slot in SEQUENCE */
export const QUESTION_IDX = 21

/** Each triangle run: inclusive 0-based start/end indices into SEQUENCE */
export const TRI_GROUPS: { start: number; end: number }[] = [
  { start: 1,  end: 1  },   // run 1: 1▲
  { start: 3,  end: 4  },   // run 2: 2▲
  { start: 7,  end: 9  },   // run 3: 3▲
  { start: 12, end: 15 },   // run 4: 4▲
  { start: 17, end: 21 },   // run 5: 5▲ (index 21 = ?)
]

// ── geometry ──────────────────────────────────────────────────────────────────

const VIEW_W  = 512
const VIEW_H  = 100
const ROW_Y   = 44     // vertical centre of the symbol row
const X0      = 12     // left edge of slot 0
const STEP    = 21     // pixels per slot
const R       = 8      // circle radius / triangle half-width
const TH      = 9      // triangle half-height

const BR_Y0   = ROW_Y + 14   // top of bracket arms
const BR_Y1   = ROW_Y + 22   // horizontal bracket bar
const LBL_Y   = ROW_Y + 34   // bracket label baseline

const INK   = '#1F2937'
const BLUE  = '#30598A'
const AMBER = '#F59E0B'

function cx(i: number) { return X0 + i * STEP }

function SymCircle({ i }: { i: number }) {
  return <circle cx={cx(i)} cy={ROW_Y} r={R} fill={INK} />
}

function SymTriangle({ i, fill = INK }: { i: number; fill?: string }) {
  const x = cx(i)
  return (
    <polygon
      points={`${x},${ROW_Y - TH} ${x - R},${ROW_Y + TH - 2} ${x + R},${ROW_Y + TH - 2}`}
      fill={fill}
    />
  )
}

function SymQuestion({ i }: { i: number }) {
  const x = cx(i)
  return (
    <g>
      <rect
        x={x - R - 1} y={ROW_Y - TH - 1}
        width={(R + 1) * 2} height={(TH + 1) * 2}
        rx={3} fill="none"
        stroke={AMBER} strokeWidth={1.8} strokeDasharray="4 3"
      />
      <text
        x={x} y={ROW_Y + 1}
        textAnchor="middle" dominantBaseline="central"
        fontSize={13} fontWeight={900} fill={AMBER}
      >?</text>
    </g>
  )
}

interface BraceProps { g: { start: number; end: number }; n: number }
function RunBrace({ g, n }: BraceProps) {
  const x0 = cx(g.start) - R - 2
  const x1 = cx(g.end)   + R + 2
  const mid = (x0 + x1) / 2
  return (
    <g>
      <path
        d={`M${x0} ${BR_Y0} v${BR_Y1 - BR_Y0} h${x1 - x0} v${-(BR_Y1 - BR_Y0)}`}
        fill="none" stroke={BLUE} strokeWidth={1.4}
      />
      <text
        x={mid} y={LBL_Y}
        textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight={800} fill={BLUE}
      >{n}▲</text>
    </g>
  )
}

// ── default export: stem illustration ─────────────────────────────────────────

export default function SequenceHK22P2Q18Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Symbol sequence of circles and triangles; triangle runs grow 1,2,3,4,5. Find the missing symbol."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* title */}
        <text
          x={VIEW_W / 2} y={14}
          textAnchor="middle" fontSize={10} fontWeight={800} fill={BLUE}
        >Pattern: ▲-runs grow by 1 each time — what is ?</text>

        {/* symbols */}
        {SEQUENCE.map((sym, i) =>
          sym === '●' ? <SymCircle   key={i} i={i} /> :
          sym === '▲' ? <SymTriangle key={i} i={i} /> :
                        <SymQuestion key={i} i={i} />
        )}

        {/* … */}
        <text
          x={cx(SEQUENCE.length) + 2} y={ROW_Y + 2}
          textAnchor="start" fontSize={10} fill={INK}
        >…</text>

        {/* triangle-run brackets */}
        {TRI_GROUPS.map((g, i) => <RunBrace key={i} g={g} n={i + 1} />)}
      </svg>
    </div>
  )
}
