// Static card illustrations for WMI-21F2A (2021 G2 final).

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

/** Q1 — computation matched to products. */
export function MatchProduct21G2Illustration() {
  return (
    <Frame aria="Ninety-four minus sixty-seven plus twenty-one, to be matched with a multiplication.">
      <svg viewBox="0 0 360 64" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={8} y={8} width={344} height={48} rx={10} fill="#FFF7E6" stroke="#E8965A" strokeWidth={2} />
        <text x={180} y={33} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK} className="font-display">94 − 67 + 21 = □ × □</text>
      </svg>
    </Frame>
  )
}

/** Q3 — the cross of students. */
export function CrossArray21G2Illustration() {
  const n = 7
  return (
    <Frame aria="Students forming a plus-shaped cross with the same count in the row and the column; John stands at the centre.">
      <svg viewBox="0 0 240 240" width="100%" style={{ maxWidth: 240, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {Array.from({ length: n }, (_, i) => (
          <g key={i}>
            <circle cx={120} cy={24 + i * 32} r={12} fill={i === 3 ? '#E75480' : '#7EC8E3'} stroke={INK} strokeWidth={1.6} />
            <circle cx={24 + i * 32} cy={120} r={12} fill={i === 3 ? '#E75480' : '#7EC8E3'} stroke={INK} strokeWidth={1.6} />
          </g>
        ))}
        <text x={120} y={121} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={900} fill="white" className="font-display">John</text>
        <text x={120} y={232} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#6B7280" className="font-display">total = n + n − 1</text>
      </svg>
    </Frame>
  )
}

/** Q4 — a 30-day calendar starting Saturday. */
export function Calendar21G2Illustration() {
  const names = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
  return (
    <Frame aria="A calendar month of thirty days starting on Saturday: five Saturdays, five Sundays, four of every weekday.">
      <svg viewBox="0 0 320 210" width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {names.map((d, i) => (
          <g key={d}>
            <rect x={10 + i * 43} y={8} width={39} height={26} fill={i < 2 ? '#FDE7EF' : '#E1EFFB'} stroke={INK} strokeWidth={1.3} />
            <text x={29.5 + i * 43} y={22} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800} fill={i < 2 ? PINK : BLUE} className="font-display">{d}</text>
          </g>
        ))}
        {Array.from({ length: 30 }, (_, k) => {
          const day = k + 1
          const col = k % 7
          const row = Math.floor(k / 7)
          return (
            <g key={day}>
              <rect x={10 + col * 43} y={34 + row * 32} width={39} height={28} fill="white" stroke="#CBD5E1" strokeWidth={1.1} />
              <text x={29.5 + col * 43} y={49 + row * 32} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill={col < 2 ? PINK : INK} className="font-display">{day}</text>
            </g>
          )
        })}
      </svg>
    </Frame>
  )
}

/** Q5 — the two skip-count rules. */
export function SkipCount21G2Illustration() {
  return (
    <Frame aria="Counting by fives from one hundred one lands on one hundred five, one hundred ten and so on; counting by sevens lands on one hundred seven, one hundred fourteen and so on.">
      <svg viewBox="0 0 400 110" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <text x={16} y={28} fontSize={14} fontWeight={800} fill={BLUE} className="font-display">by 5’s:</text>
        {['105', '110', '115', '120', '…'].map((s, i) => (
          <g key={i}>
            <rect x={84 + i * 60} y={10} width={52} height={28} rx={7} fill="#E1EFFB" stroke={BLUE} strokeWidth={1.6} />
            <text x={110 + i * 60} y={25} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">{s}</text>
          </g>
        ))}
        <text x={16} y={78} fontSize={14} fontWeight={800} fill={PINK} className="font-display">by 7’s:</text>
        {['107', '114', '121', '128', '…'].map((s, i) => (
          <g key={i}>
            <rect x={84 + i * 60} y={60} width={52} height={28} rx={7} fill="#FDE7EF" stroke={PINK} strokeWidth={1.6} />
            <text x={110 + i * 60} y={75} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill={PINK} className="font-display">{s}</text>
          </g>
        ))}
        <text x={200} y={104} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#6B7280" className="font-display">start at 101 — the landings shift!</text>
      </svg>
    </Frame>
  )
}

/** Q6 — the two alarm clocks around the true time. */
export function TwoClocks21G2Illustration() {
  const clock = (x: number, label: string, time: string, color: string) => (
    <g>
      <circle cx={x} cy={52} r={36} fill="white" stroke={color} strokeWidth={4} />
      <text x={x} y={52} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={INK} className="font-display">{time}</text>
      <text x={x} y={106} textAnchor="middle" fontSize={12} fontWeight={800} fill={color} className="font-display">{label}</text>
    </g>
  )
  return (
    <Frame aria="The blue clock shows six oh five and runs twenty minutes slow; the red clock runs fifteen minutes fast.">
      <svg viewBox="0 0 400 120" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {clock(70, 'blue: 20 min slow', '06:05', '#2E76C9')}
        {clock(200, 'true time?', '?', '#6B7280')}
        {clock(330, 'red: 15 min fast', '?', '#D7263D')}
      </svg>
    </Frame>
  )
}

/** Q7 — the triple-box equation. */
export function TripleBox21G2Illustration() {
  return (
    <Frame aria="Box times box times box equals sixty-four; box times five is asked.">
      <svg viewBox="0 0 360 70" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <text x={120} y={36} textAnchor="middle" dominantBaseline="central" fontSize={21} fontWeight={800} fill={INK} className="font-display">□ × □ × □ = 64</text>
        <text x={290} y={36} textAnchor="middle" dominantBaseline="central" fontSize={21} fontWeight={800} fill={PINK} className="font-display">□ × 5 = ?</text>
      </svg>
    </Frame>
  )
}

/** Q8 — Bob's ticket queue: 8 served, 6 waiting, Bob in the exact middle,
 *  an unknown tail behind him (total not revealed). */
export function BobQueue21G2Illustration() {
  const dot = (key: string, x: number, fill: string, stroke = INK, dashed = false) => (
    <circle key={key} cx={x} cy={58} r={9} fill={fill} stroke={stroke} strokeWidth={1.5} strokeDasharray={dashed ? '3 3' : undefined} />
  )
  return (
    <Frame aria="A ticket queue: eight people already served, six more waiting, then Bob who stands in the exact middle, with an unknown number of people behind him.">
      <svg viewBox="0 0 420 118" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={8} y={40} width={36} height={36} rx={5} fill="#FFE9A8" stroke={INK} strokeWidth={1.8} />
        <text x={26} y={58} textAnchor="middle" dominantBaseline="central" fontSize={17}>🎫</text>
        {Array.from({ length: 8 }, (_, i) => dot(`done-${i}`, 62 + i * 21, '#8FD6A8'))}
        {Array.from({ length: 6 }, (_, i) => dot(`wait-${i}`, 236 + i * 21, '#FFE9A8'))}
        {dot('bob', 368, PINK)}
        <text x={368} y={38} textAnchor="middle" fontSize={11} fontWeight={900} fill={PINK} className="font-display">Bob</text>
        {[0, 1, 2].map((i) => dot(`tail-${i}`, 392 + i * 14, 'white', '#9CA3AF', true))}
        <text x={135} y={92} textAnchor="middle" fontSize={11} fontWeight={800} fill="#2F9E44" className="font-display">8 ✓</text>
        <text x={288} y={92} textAnchor="middle" fontSize={11} fontWeight={800} fill="#B45309" className="font-display">6 more</text>
        <text x={399} y={92} textAnchor="middle" fontSize={11} fontWeight={800} fill="#6B7280" className="font-display">?</text>
        <text x={210} y={112} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#6B7280" className="font-display">Bob is in the exact MIDDLE of the line</text>
      </svg>
    </Frame>
  )
}

/** Q10 — the two pillars. */
export function Pillars21G2Illustration() {
  return (
    <Frame aria="A thick pillar A and a thin pillar B; one rope wraps A four times or B eight times.">
      <svg viewBox="0 0 360 150" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={70} y={20} width={64} height={110} rx={8} fill="#D9C09A" stroke={INK} strokeWidth={2.2} />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={102} cy={42 + i * 24} rx={36} ry={7} fill="none" stroke="#D7263D" strokeWidth={3} />
        ))}
        <text x={102} y={146} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">A — 4 loops</text>
        <rect x={240} y={20} width={32} height={110} rx={7} fill="#D9C09A" stroke={INK} strokeWidth={2.2} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <ellipse key={i} cx={256} cy={32 + i * 13} rx={20} ry={5} fill="none" stroke="#D7263D" strokeWidth={2.4} />
        ))}
        <text x={256} y={146} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">B — 8 loops</text>
      </svg>
    </Frame>
  )
}

/** Q12 — the insect equations. */
export function BeeButterfly21G2Illustration() {
  return (
    <Frame aria="Bee minus forty-five equals thirty-eight; sixty-two minus butterfly equals thirty-three; bee minus butterfly is asked.">
      <svg viewBox="0 0 400 110" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {['🐝 − 45 = 38', '62 − 🦋 = 33', '🐝 − 🦋 = ?'].map((s, i) => (
          <g key={i}>
            <rect x={14 + i * 128} y={28} width={116} height={48} rx={10} fill={i === 2 ? '#FEF9C3' : '#E7F0DC'} stroke={i === 2 ? '#D97706' : '#5B8C5A'} strokeWidth={2} />
            <text x={72 + i * 128} y={53} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK} className="font-display">{s}</text>
          </g>
        ))}
      </svg>
    </Frame>
  )
}

/** Q16 — running total card. */
export function RunningTotal21G2Illustration() {
  return (
    <Frame aria="Thirty-four plus twenty-seven plus sixteen minus fifty-two plus seventy-two minus seventeen.">
      <svg viewBox="0 0 400 64" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={8} y={8} width={384} height={48} rx={10} fill="#FFF7E6" stroke="#E8965A" strokeWidth={2} />
        <text x={200} y={33} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={800} fill={INK} className="font-display">34 + 27 + 16 − 52 + 72 − 17 = ?</text>
      </svg>
    </Frame>
  )
}

/** Q20 — the five cards and the sentence. */
export function FiveCards21G2Illustration() {
  return (
    <Frame aria="Five number cards three, five, five, eight, one and the sentence: two-digit minus two-digit plus one digit.">
      <svg viewBox="0 0 380 120" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {['3', '5', '5', '8', '1'].map((d, i) => (
          <g key={i}>
            <rect x={70 + i * 50} y={8} width={40} height={48} rx={7} fill="white" stroke={BLUE} strokeWidth={2.4} />
            <text x={90 + i * 50} y={33} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={BLUE} className="font-display">{d}</text>
          </g>
        ))}
        <text x={190} y={92} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK} className="font-display">□□ − □□ + □ = ?</text>
      </svg>
    </Frame>
  )
}

/** Q21 — staircase sums strip. */
export function Staircase21G2Illustration() {
  const sums = [10, 15, 21, 28, 36, 45, 55, 66, 78, 91]
  return (
    <Frame aria="The staircase sums one plus two plus dots plus n: ten, fifteen, twenty-one, twenty-eight, thirty-six, forty-five, fifty-five, sixty-six, seventy-eight, ninety-one; fifty-five and sixty-six are highlighted.">
      <svg viewBox="0 0 420 86" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {sums.map((s, i) => {
          const hit = s === 55 || s === 66
          return (
            <g key={s}>
              <rect x={8 + i * 41} y={22} width={36} height={32} rx={6} fill={hit ? '#D1FAE5' : 'white'} stroke={hit ? '#10B981' : INK} strokeWidth={hit ? 2.6 : 1.5} />
              <text x={26 + i * 41} y={39} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={800} fill={hit ? '#065F46' : INK} className="font-display">{s}</text>
              <text x={26 + i * 41} y={14} textAnchor="middle" fontSize={9} fontWeight={700} fill="#9CA3AF" className="font-display">n={i + 4}</text>
            </g>
          )
        })}
        <text x={210} y={74} textAnchor="middle" fontSize={12} fontWeight={700} fill="#6B7280" className="font-display">looking for 11, 22, 33, …, 99</text>
      </svg>
    </Frame>
  )
}

/** Q22 — the cube with three labelled faces. */
export function CubeFaces21G2Illustration() {
  return (
    <Frame aria="A cube showing faces three, seven and eight; opposite faces must share the same sum.">
      <svg viewBox="0 0 280 180" width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <polygon points="70,60 150,60 190,30 110,30" fill="#D6EBF7" stroke={INK} strokeWidth={2} />
        <polygon points="70,60 150,60 150,140 70,140" fill="#8FC6E8" stroke={INK} strokeWidth={2} />
        <polygon points="150,60 190,30 190,110 150,140" fill="#5BA8D4" stroke={INK} strokeWidth={2} />
        <text x={130} y={47} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={INK} className="font-display">3</text>
        <text x={110} y={100} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={900} fill={INK} className="font-display">7</text>
        <text x={170} y={88} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={INK} className="font-display">8</text>
        <text x={140} y={168} textAnchor="middle" fontSize={12} fontWeight={700} fill="#6B7280" className="font-display">opposite faces: same sum S</text>
      </svg>
    </Frame>
  )
}
