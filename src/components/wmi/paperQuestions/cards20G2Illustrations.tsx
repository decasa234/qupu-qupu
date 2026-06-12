// Small card-style illustrations for the text questions of WMI-20F2A.
// Language-neutral: numbers and symbols only (aria carries the description).

const INK = '#1F2937'
const BLUE = '#2563EB'

function Card({ aria, children, h = 110, w = 380 }: { aria: string; children: React.ReactNode; h?: number; w?: number }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {children}
      </svg>
    </div>
  )
}

const Big = ({ x, y, t, size = 30, fill = INK }: { x: number; y: number; t: string; size?: number; fill?: string }) => (
  <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={900} fill={fill} className="font-display">{t}</text>
)

const Box = ({ x, y, w = 46, h = 46, color = BLUE }: { x: number; y: number; w?: number; h?: number; color?: string }) => (
  <rect x={x} y={y} width={w} height={h} rx={8} fill="white" stroke={color} strokeWidth={2.5} />
)

/** Q1 — 42 + 36 + 5. */
export function SumCard20G2Illustration() {
  return (
    <Card aria="The sum 42 plus 36 plus 5.">
      <Big x={190} y={55} t="42 + 36 + 5 = ?" size={34} />
    </Card>
  )
}

/** Q4 — four numbered balls A 205, B 422, C 230, D 501. */
export function BubblesG2Illustration() {
  const balls: Array<[string, number, number, number]> = [['A', 205, 80, 44], ['B', 422, 175, 62], ['C', 230, 270, 40], ['D', 501, 340, 66]]
  return (
    <Card aria="Four numbered balls: A 205, B 422, C 230, D 501." h={120}>
      {balls.map(([l, v, x, y]) => (
        <g key={l as string}>
          <circle cx={x as number} cy={y as number} r={32} fill="#F7D94C" stroke="#C9A227" strokeWidth={2} />
          <text x={x as number} y={(y as number) - 10} textAnchor="middle" fontSize={14} fontWeight={800} fontStyle="italic" fill={INK}>{l}</text>
          <Big x={x as number} y={(y as number) + 8} t={String(v)} size={17} />
        </g>
      ))}
    </Card>
  )
}

/** Q6 — ◻ − 31 = 64 − 20. */
export function MissingMinuendCard20G2Illustration() {
  return (
    <Card aria="A box minus 31 equals 64 minus 20.">
      <Box x={44} y={32} />
      <Big x={230} y={55} t="− 31 = 64 − 20" size={30} />
    </Card>
  )
}

/** Q9 — 40 < ◻ < 55. */
export function RangeCard20G2Illustration() {
  return (
    <Card aria="40 is less than a box, which is less than 55.">
      <Big x={110} y={55} t="40 <" size={32} />
      <Box x={160} y={32} />
      <Big x={262} y={55} t="< 55" size={32} />
    </Card>
  )
}

/** Q12 — 765, ♥, ◆, 729, ♠, 705 with ♥ − ♠ = ?. */
export function HeartSpadeSeqG2Illustration() {
  const items = ['765', '♥', '◆', '729', '♠', '705']
  const colors: Record<string, string> = { '♥': '#F08080', '◆': '#19A7CE', '♠': '#9B7EBD' }
  return (
    <Card aria="A number pattern: 765, heart, diamond, 729, spade, 705. Below it: heart minus spade equals what?" h={140} w={420}>
      {items.map((t, i) => (
        <g key={i}>
          <rect x={14 + i * 66} y={16} width={58} height={44} rx={8} fill="white" stroke="#CBD5E1" strokeWidth={2} />
          <Big x={43 + i * 66} y={39} t={t} size={t.length > 1 ? 20 : 26} fill={colors[t] ?? INK} />
        </g>
      ))}
      <Big x={210} y={105} t="♥ − ♠ = ?" size={28} />
      <Big x={172} y={103} t="" />
    </Card>
  )
}

/** Q13 — 3-digit frame with the clues as symbols. */
export function DigitCluesG2Illustration() {
  return (
    <Card aria="A three-digit number frame. The tens digit is three times the hundreds digit, tens plus units is more than 10, and the number is even." h={150}>
      {[0, 1, 2].map((i) => (
        <Box key={i} x={120 + i * 54} y={56} color={INK} />
      ))}
      {/* ×3 arc from hundreds to tens */}
      <path d="M 143 52 Q 170 22 197 52" fill="none" stroke={BLUE} strokeWidth={2.5} />
      <Big x={170} y={26} t="× 3" size={16} fill={BLUE} />
      {/* tens + units > 10 */}
      <path d="M 197 110 Q 224 136 251 110" fill="none" stroke="#D97706" strokeWidth={2.5} />
      <Big x={224} y={138} t="+ > 10" size={16} fill="#D97706" />
      {/* even chip on the units */}
      <Big x={313} y={79} t="0/2/4/6/8" size={11} fill="#059669" />
    </Card>
  )
}

/** Q16 — 5 × 5 + 5 + 5 + 5 × 5. */
export function FivesCard20G2Illustration() {
  return (
    <Card aria="The expression 5 times 5 plus 5 plus 5 plus 5 times 5.">
      <Big x={190} y={55} t="5 × 5 + 5 + 5 + 5 × 5 = ?" size={28} />
    </Card>
  )
}

/** Q17 — digit cards 0, 1, 2, 5. */
export function DigitCards20G2Illustration() {
  return (
    <Card aria="Four digit cards: 0, 1, 2, and 5." h={120}>
      {['0', '1', '2', '5'].map((t, i) => (
        <g key={t}>
          <rect x={92 + i * 56} y={24} width={46} height={66} rx={8} fill="white" stroke={INK} strokeWidth={2.5} />
          <Big x={115 + i * 56} y={58} t={t} size={32} />
        </g>
      ))}
    </Card>
  )
}

/** Q24 — the nine number cards. */
export function NineCards20G2Illustration() {
  const nums = [1, 2, 3, 6, 7, 12, 14, 20, 26]
  return (
    <Card aria="Nine number cards: 1, 2, 3, 6, 7, 12, 14, 20, and 26." h={110} w={440}>
      {nums.map((n, i) => (
        <g key={n}>
          <rect x={12 + i * 47} y={30} width={40} height={50} rx={7} fill="white" stroke={INK} strokeWidth={2.2} />
          <Big x={32 + i * 47} y={56} t={String(n)} size={n >= 10 ? 18 : 22} />
        </g>
      ))}
    </Card>
  )
}
