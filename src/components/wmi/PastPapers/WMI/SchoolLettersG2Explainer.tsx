import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-20F2A-Q2 — which letters of "SCHOOL" contain a vertical line segment?
// Checked one letter per beat: S ✗ (curves), C ✗ (curve), H ✓ (two vertical
// strokes), O ✗, O ✗, L ✓ (one vertical stroke) → 2 letters.

const GREEN = '#10B981'
const RED = '#DC2626'
const AMBER = '#D97706'
const INK = '#1F2937'
const BLUE = '#2563EB'

const LETTERS = ['S', 'C', 'H', 'O', 'O', 'L']
/** x-offsets (within a 56px chip) of each vertical stroke the letter contains. */
const STROKES: number[][] = [[], [], [-11, 11], [], [], [-10]]

const VIEW_W = 380
const CHIP = 52
const GAP = 8
const X0 = (VIEW_W - (6 * CHIP + 5 * GAP)) / 2

export function SchoolWord({ upto = -1, active = -1 }: { upto?: number; active?: number }) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} 96`} width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {LETTERS.map((ch, i) => {
        const x = X0 + i * (CHIP + GAP)
        const decided = i <= upto
        const has = STROKES[i].length > 0
        const isActive = i === active
        return (
          <g key={i}>
            <rect
              x={x}
              y={18}
              width={CHIP}
              height={60}
              rx={10}
              fill={decided ? (has ? '#D1FAE5' : '#FEE2E2') : '#FFFFFF'}
              stroke={isActive ? AMBER : decided ? (has ? GREEN : '#FCA5A5') : '#CBD5E1'}
              strokeWidth={isActive ? 3 : 2}
              strokeDasharray={isActive && !decided ? '6 4' : undefined}
            />
            <text x={x + CHIP / 2} y={50} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={900} fill={INK} className="font-display">
              {ch}
            </text>
            {decided && has &&
              STROKES[i].map((dx, k) => (
                <line key={k} x1={x + CHIP / 2 + dx} y1={28} x2={x + CHIP / 2 + dx} y2={70} stroke={BLUE} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
              ))}
            {decided && (
              <text x={x + CHIP / 2} y={10} textAnchor="middle" fontSize={13} fontWeight={900} fill={has ? GREEN : RED}>
                {has ? '✓' : '✗'}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function SchoolLettersG2Illustration() {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label='The word "SCHOOL" written in six capital letters.'>
      <SchoolWord />
    </div>
  )
}

export default function SchoolLettersG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { upto: -1, active: -1, hold: 2600, result: false, caption: t('A vertical line is a straight stroke that goes UP-DOWN. Check the letters one by one!', 'Garis tegak adalah goresan lurus yang arahnya ATAS-BAWAH. Periksa hurufnya satu per satu!') },
      { upto: 0, active: 0, hold: 2200, result: false, caption: t('S — all curves, no straight up-down stroke ✗', 'S — melengkung semua, tak ada goresan lurus atas-bawah ✗') },
      { upto: 1, active: 1, hold: 2000, result: false, caption: t('C — just a curve ✗', 'C — hanya lengkungan ✗') },
      { upto: 2, active: 2, hold: 2400, result: false, caption: t('H — TWO straight up-down strokes ✓ (1 letter found)', 'H — DUA goresan lurus atas-bawah ✓ (1 huruf ditemukan)') },
      { upto: 3, active: 3, hold: 2000, result: false, caption: t('O — round, no straight stroke ✗', 'O — bulat, tak ada goresan lurus ✗') },
      { upto: 4, active: 4, hold: 2000, result: false, caption: t('The second O — same, round ✗', 'O kedua — sama, bulat ✗') },
      { upto: 5, active: 5, hold: 2400, result: false, caption: t('L — one straight up-down stroke ✓ (2 letters found)', 'L — satu goresan lurus atas-bawah ✓ (2 huruf ditemukan)') },
      { upto: 5, active: -1, hold: 0, result: true, caption: t('Only H and L contain a vertical line → 2 letters (C).', 'Hanya H dan L yang memuat garis tegak → 2 huruf (C).') },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={t('Checking each letter of SCHOOL, only H and L contain vertical strokes: two letters.', 'Memeriksa tiap huruf SCHOOL, hanya H dan L yang memuat garis tegak: dua huruf.')}>
      <div className="flex flex-col items-center gap-3">
        <SchoolWord upto={beat.upto} active={beat.active} />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
