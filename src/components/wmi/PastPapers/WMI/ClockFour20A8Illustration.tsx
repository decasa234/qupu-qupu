// SEAMO-20-A-Q8 — four analog clock figures; identify the time shown in Figure 4.
//
// "What is the time in Figure 4?"
// Source figures: 2020.imgs/007.jpg (Fig 1) — 008.jpg (Fig 2) — 009.jpg (Fig 3) — 010.jpg (Fig 4)
//
// Times reconstructed from source crops:
//   Figure 1: ~8:20  (hour between 8–9, minute near 4)
//   Figure 2: ~9:02  (hour between 9–10, minute near 12)
//   Figure 3: ~10:02 (hour between 10–11, minute near 12)
//   Figure 4: 10:35  (hour between 10–11, minute on 7) ← the answer (D)
//
// STEM ONLY — the A–E choices are text times (not pictures), so no Option export.
//
// Primitives used:
//   AnalogClock20  from ./ClockMatch20Illustration  (parameterised clock face)
//
// Props let the explainer highlight Figure 4 (e.g. emphasizeHour / emphasizeMinute).
//
// Pure render — no Math.random, no Date — SSR-safe and deterministic.

import { AnalogClock20 } from './ClockMatch20Illustration'

/** The four clock times as displayed in the source figure. */
export const CLOCK_TIMES = ['8:20', '9:02', '10:02', '10:35'] as const

const INK = '#334155'
const PURPLE = '#341857'

/** Label below each clock panel ("Figure 1" … "Figure 4"). */
function FigureLabel({ n, highlight = false }: { n: number; highlight?: boolean }) {
  return (
    <text
      x={0}
      y={0}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={highlight ? 800 : 600}
      fill={highlight ? '#F97316' : INK}
    >
      {`Figure ${n}`}
    </text>
  )
}

export interface ClockFour20A8Props {
  /** If true, highlights Figure 4 with an orange border and labels. */
  highlightFigure4?: boolean
  /** If true, draws Figure 4's minute hand in orange (for explainer step). */
  emphasizeMinute?: boolean
  /** If true, draws Figure 4's hour hand in blue (for explainer step). */
  emphasizeHour?: boolean
}

/**
 * Four analog clock panels laid out in a 2-column × 2-row grid with figure
 * labels beneath each clock.  Figure 4 is the one the question asks about.
 */
export function ClockFour20A8({
  highlightFigure4 = false,
  emphasizeMinute = false,
  emphasizeHour = false,
}: ClockFour20A8Props = {}) {
  const CLOCK_SIZE = 100
  const LABEL_H = 20
  const GAP = 16

  /** One panel: clock + label, with optional highlight ring. */
  function Panel({ idx }: { idx: number }) {
    const isFig4 = idx === 3
    const highlight = isFig4 && highlightFigure4

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {highlight && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: CLOCK_SIZE + 8,
              height: CLOCK_SIZE + 8,
              borderRadius: '50%',
              border: '3px solid #F97316',
              pointerEvents: 'none',
            }}
          />
        )}
        <AnalogClock20
          time={CLOCK_TIMES[idx]}
          size={CLOCK_SIZE}
          emphasizeMinute={isFig4 && emphasizeMinute}
          emphasizeHour={isFig4 && emphasizeHour}
        />
        <svg
          width={CLOCK_SIZE}
          height={LABEL_H}
          viewBox={`${-CLOCK_SIZE / 2} ${-LABEL_H / 2} ${CLOCK_SIZE} ${LABEL_H}`}
          aria-hidden="true"
        >
          <FigureLabel n={idx + 1} highlight={highlight} />
        </svg>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `${CLOCK_SIZE}px ${CLOCK_SIZE}px`,
        columnGap: GAP,
        rowGap: GAP,
        alignItems: 'start',
        justifyItems: 'center',
      }}
      aria-hidden="true"
    >
      <Panel idx={0} />
      <Panel idx={1} />
      <Panel idx={2} />
      <Panel idx={3} />
    </div>
  )
}

export default function ClockFour20A8Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={
        'Empat jam analog berlabel Gambar 1 sampai 4. ' +
        'Gambar 1 menunjukkan 8:20; Gambar 2 menunjukkan 9:02; ' +
        'Gambar 3 menunjukkan 10:02; Gambar 4 menunjukkan 10:35.'
      }
    >
      <ClockFour20A8 />
    </div>
  )
}
