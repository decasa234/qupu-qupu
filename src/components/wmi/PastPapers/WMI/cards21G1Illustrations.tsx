// Static card illustrations for WMI-21F1A (2021 G1 final).

const INK = '#1F2937'
const BLUE = '#30598A'
const PINK = '#E75480'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/** Q1 — four subtraction cards. */
export function FourSubtractions21Illustration() {
  const rows = ['11 − 8', '15 − 7', '16 − 9', '12 − 6']
  return (
    <Frame aria="Four subtraction cards: eleven minus eight, fifteen minus seven, sixteen minus nine, twelve minus six.">
      <svg viewBox="0 0 400 70" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {rows.map((s, i) => (
          <g key={i}>
            <rect x={10 + i * 98} y={10} width={88} height={44} rx={9} fill="#FFF7E6" stroke="#E8965A" strokeWidth={2} />
            <text x={54 + i * 98} y={33} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill={INK} className="font-display">{s}</text>
          </g>
        ))}
      </svg>
    </Frame>
  )
}

/** Q6 — the eleven numbers in a strip (shared with the explainer). */
export const NUMBERS6 = [3, 6, 8, 17, 4, 7, 18, 9, 12, 5, 1]
export function NumberStrip21({ markLeft, markRight }: { markLeft?: number; markRight?: number }) {
  return (
    <svg viewBox="0 0 420 78" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {NUMBERS6.map((n, i) => {
        const left = markLeft !== undefined && i === markLeft
        const right = markRight !== undefined && i === markRight
        return (
          <g key={i}>
            <rect x={8 + i * 37} y={20} width={32} height={36} rx={6} fill={left ? '#E1EFFB' : right ? '#FDE7EF' : 'white'} stroke={left ? BLUE : right ? PINK : INK} strokeWidth={left || right ? 2.6 : 1.6} />
            <text x={24 + i * 37} y={39} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK} className="font-display">{n}</text>
            {left && <text x={24 + i * 37} y={12} textAnchor="middle" fontSize={10} fontWeight={800} fill={BLUE} className="font-display">7th→</text>}
            {right && <text x={24 + i * 37} y={70} textAnchor="middle" fontSize={10} fontWeight={800} fill={PINK} className="font-display">←4th</text>}
          </g>
        )
      })}
    </svg>
  )
}
export function NumberStrip21Illustration() {
  return (
    <Frame aria="The numbers three, six, eight, seventeen, four, seven, eighteen, nine, twelve, five, one in a row.">
      <NumberStrip21 />
    </Frame>
  )
}

/** Q11/Q20 — a queue of dots (shared primitive). */
export function QueueDots({ total, marks, between }: { total: number; marks: Array<{ pos: number; label: string; color: string }>; between?: [number, number] }) {
  const perRow = 17
  const rows = Math.ceil(total / perRow)
  return (
    <svg viewBox={`0 0 420 ${rows * 44 + 18}`} width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const pos = i + 1
        const r = Math.floor(i / perRow)
        const c = i % perRow
        const mark = marks.find((m) => m.pos === pos)
        const isBetween = between && pos > between[0] && pos < between[1]
        return (
          <g key={i}>
            <circle cx={18 + c * 24} cy={26 + r * 44} r={9} fill={mark ? mark.color : isBetween ? '#FFE9A8' : '#E2E8F0'} stroke={INK} strokeWidth={1.3} />
            <text x={18 + c * 24} y={26 + r * 44} textAnchor="middle" dominantBaseline="central" fontSize={8.5} fontWeight={800} fill={mark ? 'white' : '#6B7280'} className="font-display">{pos}</text>
            {mark && <text x={18 + c * 24} y={8 + r * 44} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={mark.color} className="font-display">{mark.label}</text>}
          </g>
        )
      })}
    </svg>
  )
}
export function TicketQueue21Illustration() {
  return (
    <Frame aria="A queue of thirty-four people; Jeff is thirteenth from the front and Kim is twenty-eighth from the back.">
      <QueueDots total={34} marks={[{ pos: 13, label: 'Jeff', color: BLUE }, { pos: 7, label: 'Kim?', color: PINK }]} />
    </Frame>
  )
}
/** Q23 — the equation cross, matching the printed figure but with basic shapes
 *  (review policy) standing in for the bugs: 🔷 dragonfly, 🔺 butterfly,
 *  🟡 bee, 🟣 ladybug. Across: 🔷 + 🔺 = 15, 🟡 − 🟣 = 5;
 *  down: 🔷 + 🟡 = 18, 🔺 + 🟣 = 6. */
export function ShapeCross21Illustration() {
  const box = (x: number, y: number, content: string) => (
    <g>
      <rect x={x - 27} y={y - 27} width={54} height={54} rx={6} fill="white" stroke="#5B8C5A" strokeWidth={2.4} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={content.length > 1 ? 20 : 24} fontWeight={800} fill={INK} className="font-display">{content}</text>
    </g>
  )
  const sign = (x: number, y: number, s: string) => (
    <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={INK} className="font-display">{s}</text>
  )
  return (
    <Frame aria="A cross of equations: diamond plus triangle equals fifteen across the top; yellow circle minus purple circle equals five across the middle; down the columns, diamond plus yellow circle equals eighteen and triangle plus purple circle equals six.">
      <svg viewBox="0 0 360 318" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {box(55, 40, '🔷')}
        {sign(115, 40, '+')}
        {box(175, 40, '🔺')}
        {sign(235, 40, '=')}
        {box(295, 40, '15')}
        {sign(55, 105, '+')}
        {sign(175, 105, '+')}
        {box(55, 170, '🟡')}
        {sign(115, 170, '−')}
        {box(175, 170, '🟣')}
        {sign(235, 170, '=')}
        {box(295, 170, '5')}
        {sign(55, 230, '=')}
        {sign(175, 230, '=')}
        {box(55, 280, '18')}
        {box(175, 280, '6')}
      </svg>
    </Frame>
  )
}
