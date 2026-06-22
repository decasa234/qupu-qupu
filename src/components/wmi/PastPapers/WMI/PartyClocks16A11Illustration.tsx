// SEAMO-16-A-Q11 — two analog clock faces (party start and end).
//
// "The time that Jennifer's party started and ended is as shown below.
//  How long was her party in minutes?"  Answer: C = 310.
//
// SOURCE FIGURE (008.jpg = start clock, 009.jpg = end clock):
//   Start clock: hour hand just past 12, minute hand at 2 (10 min). → 12:10
//   End clock:   hour hand between 5 and 6, minute hand at 4 (20 min). → 5:20
//   Duration: 5h 10min = 310 minutes (choice C).
//
// TRAP: misreading minute hand of start clock as 5 min (at 1) → 5h 5min = 305;
//       misreading end clock as 5:00 → 5h 0min = 300.
//
// Copy-adapted from: ClockMatch20Illustration (AnalogClock20 + clockHandPoint).
//
// Bound quantities from breakdown.quantities:
//   start_time  = "12:10"
//   end_time    = "5:20"
//   duration    = "310 minutes"
//
// Pure render — no Math.random, no Date — SSR-safe and deterministic.

import { AnalogClock20 } from './ClockMatch20Illustration'

const START_TIME = '12:10'
const END_TIME   = '5:20'

/** Labelled analog clock face for the illustration. */
function LabeledClock({ time, label }: { time: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <AnalogClock20 time={time} size={130} />
      <div
        style={{
          fontFamily: 'sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: '#341857',
          background: '#FFF9F4',
          border: '1.5px solid #FFD3B1',
          borderRadius: 8,
          padding: '3px 12px',
        }}
      >
        {label}
      </div>
    </div>
  )
}

/** Stem illustration — two clock faces side by side, no answer revealed. */
export function PartyClocks16A11({ startTime = START_TIME, endTime = END_TIME }: { startTime?: string; endTime?: string } = {}) {
  return (
    <svg viewBox="0 0 340 200" width={340} height={200} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Start clock */}
      <foreignObject x={20} y={10} width={130} height={180}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <AnalogClock20 time={startTime} size={130} />
        </div>
      </foreignObject>
      {/* Arrow */}
      <line x1={163} y1={95} x2={177} y2={95} stroke="#341857" strokeWidth={2.5} strokeLinecap="round" />
      <polygon points="177,91 183,95 177,99" fill="#341857" />
      {/* End clock */}
      <foreignObject x={190} y={10} width={130} height={180}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <AnalogClock20 time={endTime} size={130} />
        </div>
      </foreignObject>
    </svg>
  )
}

export default function PartyClocks16A11Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label={`Dua jam analog: jam pertama menunjukkan pukul ${START_TIME} (mulai pesta), jam kedua menunjukkan pukul ${END_TIME} (selesai pesta).`}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
        <LabeledClock time={START_TIME} label="Mulai" />
        <div style={{ fontSize: 28, color: '#341857', fontWeight: 900 }}>→</div>
        <LabeledClock time={END_TIME} label="Selesai" />
      </div>
    </div>
  )
}
