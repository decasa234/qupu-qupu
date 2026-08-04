import NumberLine from '../../PastPapers/WMI/primitives/NumberLine'

// In-card figure for `interval-fencepost-count`. It draws the things and the
// span, and deliberately draws NOTHING that gives the gap size away: the ticks
// are numbered by POSITION (post 1, post 2, …) and the first space carries a
// question mark. The child still has to decide how many spaces there are.
//
// Straight arrangements reuse the shared NumberLine primitive. A ring is a
// circle of dots — the one thing a number line cannot show is the last gap
// closing back onto the first item, which is the whole point of the ring case.

interface FencepostParams {
  scenario: 'lamps-on-a-road' | 'trees' | 'clock-chimes'
  ends: 'open' | 'closed'
  count: number
  span: number
}

const BLUE = '#30598A'
const GREEN = '#58A700'
const AMBER = '#E0A000'
const HAIR = '#E6D8C9'
const INK = '#341857'

const FALLBACK: FencepostParams = { scenario: 'lamps-on-a-road', ends: 'open', count: 6, span: 30 }

function readParams(raw: unknown): FencepostParams {
  const p = (raw ?? {}) as Partial<FencepostParams>
  const count = Number.isInteger(p.count) && (p.count as number) >= 3 ? Math.min(p.count as number, 12) : FALLBACK.count
  const span = Number.isFinite(p.span) && (p.span as number) > 0 ? (p.span as number) : FALLBACK.span
  const scenario =
    p.scenario === 'trees' || p.scenario === 'clock-chimes' || p.scenario === 'lamps-on-a-road'
      ? p.scenario
      : FALLBACK.scenario
  // Chimes run forward in time; they can never close into a ring.
  const ends = p.ends === 'closed' && scenario !== 'clock-chimes' ? 'closed' : 'open'
  return { scenario, ends, count, span }
}

/** Indonesian description of what is DRAWN — never of the answer. */
function ariaLabel(p: FencepostParams): string {
  if (p.scenario === 'clock-chimes') {
    return `Garis waktu dengan ${p.count} dentangan berjarak sama, dari dentangan pertama sampai dentangan terakhir ${p.span} detik`
  }
  const thing = p.scenario === 'trees' ? 'pohon' : 'tiang lampu'
  return p.ends === 'open'
    ? `Garis lurus dengan ${p.count} ${thing} berjarak sama, satu di tiap ujung, panjang seluruhnya ${p.span} m`
    : `Lingkaran dengan ${p.count} ${thing} berjarak sama, keliling seluruhnya ${p.span} m`
}

function Ring({ count, span, unit }: { count: number; span: number; unit: string }) {
  const CX = 100
  const CY = 100
  const R = 66
  const at = (i: number, radius: number) => {
    const a = ((-90 + (i * 360) / count) * Math.PI) / 180
    return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) }
  }
  // The "?" sits over the first space, halfway between item 1 and item 2.
  const half = ((-90 + 180 / count) * Math.PI) / 180
  const qx = CX + (R + 17) * Math.cos(half)
  const qy = CY + (R + 17) * Math.sin(half)

  return (
    <svg viewBox="0 0 200 200" width={220} style={{ display: 'block' }} aria-hidden="true">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke={HAIR} strokeWidth={3} />
      <text x={CX} y={CY - 2} textAnchor="middle" fontSize={15} fontWeight={800} fill={GREEN}>
        {span} {unit}
      </text>
      <text x={CX} y={CY + 15} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK} opacity={0.6}>
        keliling
      </text>
      {Array.from({ length: count }, (_, i) => {
        const dot = at(i, R)
        const lab = at(i, R + 15)
        return (
          <g key={i}>
            <circle cx={dot.x} cy={dot.y} r={5} fill={BLUE} stroke="#FFFFFF" strokeWidth={1.5} />
            <text
              x={lab.x}
              y={lab.y + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill={BLUE}
            >
              {i + 1}
            </text>
          </g>
        )
      })}
      <text x={qx} y={qy + 4} textAnchor="middle" fontSize={13} fontWeight={800} fill={AMBER}>
        ?
      </text>
    </svg>
  )
}

export default function IntervalFencepostCountIllustration({ params }: { params: unknown }) {
  const p = readParams(params)
  const unit = p.scenario === 'clock-chimes' ? 'detik' : 'm'

  return (
    <div className="my-4 flex justify-center">
      <div role="img" aria-label={ariaLabel(p)}>
        {p.ends === 'closed' ? (
          <Ring count={p.count} span={p.span} unit={unit} />
        ) : (
          <NumberLine
            min={0}
            max={p.count - 1}
            ticks={Array.from({ length: p.count }, (_, i) => ({ value: i, label: String(i + 1) }))}
            marks={Array.from({ length: p.count }, (_, i) => ({ value: i, color: BLUE }))}
            jumps={[
              { from: 0, to: p.count - 1, label: `${p.span} ${unit}`, color: GREEN },
              { from: 0, to: 1, label: '?', color: AMBER },
            ]}
            width={340}
          />
        )}
      </div>
    </div>
  )
}
