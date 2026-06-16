import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ROSE_ROWS } from './scenes20G2Illustrations'

// WMI-20F2A-Q10 — estimation by rows strategy.
// ROSE_ROWS = [12, 12, 11, 10] → sum = 45 → nearest choice = 50 (C).

const GREEN = '#10B981'
const AMBER = '#D97706'
const BLUE = '#1D4ED8'

interface Beat {
  uptoRow: number   // -1 = no ring; 0–3 = ring rows 0..uptoRow
  running: number   // running estimate shown in caption
  hold: number
  result: boolean
  caption: string
}

export default function RosesG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo((): Beat[] => {
    const out: Beat[] = []

    // Beat 0 — intro, no rows ringed
    out.push({
      uptoRow: -1,
      running: 0,
      hold: 2400,
      result: false,
      caption: t(
        'Don\'t count every rose — estimate row by row!',
        'Jangan hitung satu-satu — taksir baris per baris!',
      ),
    })

    // Beats 1–4 — one row per beat with running total
    let running = 0
    for (let r = 0; r < ROSE_ROWS.length; r++) {
      running += ROSE_ROWS[r]
      out.push({
        uptoRow: r,
        running,
        hold: r < ROSE_ROWS.length - 1 ? 1900 : 2000,
        result: false,
        caption: t(
          `Row ${r + 1}: about ${ROSE_ROWS[r]} 🌹 → running ≈ ${running}`,
          `Baris ${r + 1}: sekitar ${ROSE_ROWS[r]} 🌹 → total ≈ ${running}`,
        ),
      })
    }

    // Beat 5 — final: nearest choice is 50 (C)
    out.push({
      uptoRow: ROSE_ROWS.length - 1,
      running,
      hold: 0,
      result: true,
      caption: t(
        `About ${running} roses. ${running} is much closer to 50 than to 30 → answer C (50).`,
        `Sekitar ${running} bunga mawar. ${running} jauh lebih dekat ke 50 daripada 30 → jawaban C (50).`,
      ),
    })

    return out
  }, [lang])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  // Layout constants mirroring RosesG2Illustration
  const ROW_H = 34
  const COL_W = 32
  const START_X = 22
  const START_Y = 22
  const STAGGER = 8  // alternating horizontal offset (same as illustration)

  // SVG dimensions: 4 rows × 34 + some padding
  const svgH = START_Y * 2 + ROSE_ROWS.length * ROW_H
  const svgW = START_X * 2 + Math.max(...ROSE_ROWS) * COL_W

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        'Estimate roses by counting rows: about 45 total, nearest choice is 50 (C).',
        'Taksir mawar per baris: sekitar 45 total, pilihan terdekat adalah 50 (C).',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect x={0} y={0} width={svgW} height={svgH} rx={10} fill="#FDF2F8" />

          {/* Roses */}
          {ROSE_ROWS.map((count, r) =>
            Array.from({ length: count }, (_, c) => {
              const x = START_X + c * COL_W + (r % 2) * STAGGER
              const y = START_Y + r * ROW_H
              const ringed = beat.uptoRow >= r
              return (
                <text
                  key={`${r}-${c}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  opacity={ringed ? 1 : 0.25}
                >
                  🌹
                </text>
              )
            }),
          )}

          {/* Dashed ring around counted rows */}
          {beat.uptoRow >= 0 && (
            <rect
              x={4}
              y={START_Y - ROW_H / 2 + 2}
              width={svgW - 8}
              height={(beat.uptoRow + 1) * ROW_H - 2}
              rx={8}
              fill="none"
              stroke={beat.result ? GREEN : AMBER}
              strokeWidth={2.2}
              strokeDasharray="7 5"
            />
          )}

          {/* Running total badge (beats 1–5) */}
          {beat.uptoRow >= 0 && (
            <>
              <rect
                x={svgW - 62}
                y={4}
                width={56}
                height={26}
                rx={7}
                fill={beat.result ? '#D1FAE5' : '#DBEAFE'}
                stroke={beat.result ? GREEN : BLUE}
                strokeWidth={1.8}
              />
              <text
                x={svgW - 34}
                y={18}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={800}
                fill={beat.result ? '#065F46' : BLUE}
              >
                {`≈ ${beat.running}`}
              </text>
            </>
          )}
        </svg>

        {/* Caption box */}
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
