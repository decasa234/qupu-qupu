import type { WmiChoice } from '../../../../types/wmi'
import { IsoStack, SOLIDS } from './puzzles21G1Illustrations'
import { Seesaw21 } from './scenes21G1Illustrations'

// Choice renderers for WMI-21F1A, keyed by the option LABEL.

/** Q3 — each option is a cube solid. */
export function SolidOption21({ choice }: { choice: WmiChoice }) {
  const voxels = SOLIDS[choice.label]
  if (!voxels) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}>
      <IsoStack voxels={voxels} size={13} />
    </span>
  )
}

/** Q4 — each option is a pair of fruits. */
const FRUIT_PAIRS: Record<string, string> = { A: '🍉 🍓', B: '🍇 🍓', C: '🍓 🍉', D: '🍓 🍓' }
export function FruitPairOption21({ choice }: { choice: WmiChoice }) {
  const pair = FRUIT_PAIRS[choice.label]
  if (!pair) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4, fontSize: 26 }}>
      {pair}
    </span>
  )
}

/** Q10 — each option is a pair of colored rope squiggles. */
const ROPE_PAIRS: Record<string, [string, string, string, string]> = {
  A: ['#D7263D', 'Red', '#2E76C9', 'Blue'],
  B: ['#2E76C9', 'Blue', '#2F9E44', 'Green'],
  C: ['#D7263D', 'Red', '#2F9E44', 'Green'],
  D: ['#F4C400', 'Yellow', '#2E76C9', 'Blue'],
}
export function RopePairOption21({ choice }: { choice: WmiChoice }) {
  const pair = ROPE_PAIRS[choice.label]
  if (!pair) return <span>{choice.text}</span>
  const squiggle = (color: string, key: string) => (
    <svg key={key} viewBox="0 0 56 26" width={56} aria-hidden="true">
      <path d="M 4 16 q 8 -14 16 0 q 8 14 16 0 q 6 -10 14 -2" fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" />
    </svg>
  )
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: 4 }}>
      {squiggle(pair[0], 'a')}
      <span className="font-display text-sm font-bold">+</span>
      {squiggle(pair[2], 'b')}
    </span>
  )
}

/** Q14 — each option is a seesaw claim. */
const SEESAWS: Record<string, { left: Array<'M' | 'E' | 'P'>; right: Array<'M' | 'E' | 'P'>; tilt: 'left' | 'right' | 'level' }> = {
  A: { left: ['P', 'E'], right: ['M'], tilt: 'left' },
  B: { left: ['M'], right: ['E', 'P'], tilt: 'left' },
  C: { left: ['M', 'P'], right: ['E', 'E'], tilt: 'level' },
  D: { left: ['M', 'E'], right: ['P', 'E'], tilt: 'left' },
}
export function SeesawOption21({ choice }: { choice: WmiChoice }) {
  const cfg = SEESAWS[choice.label]
  if (!cfg) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}>
      <Seesaw21 left={cfg.left} right={cfg.right} tilt={cfg.tilt} size={150} />
    </span>
  )
}
