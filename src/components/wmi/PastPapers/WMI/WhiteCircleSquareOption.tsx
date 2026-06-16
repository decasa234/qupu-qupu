import type { WmiChoice } from '../../../../types/wmi'
import { DrawA, DrawB, DrawC, DrawD } from './WhiteCircleSquareIllustration'

// Renders a WMI-19F1A-Q8 answer option as its shape-in-shape figure instead of
// text. The glyph is chosen by the choice's label (A/B/C/D) — the four figures
// from the exam. The descriptive choice text becomes the aria-label.
const DRAW: Record<string, () => JSX.Element> = { A: DrawA, B: DrawB, C: DrawC, D: DrawD }

export default function WhiteCircleSquareOption({ choice }: { choice: WmiChoice }) {
  const Draw = DRAW[choice.label]
  if (!Draw) return <span>{choice.text}</span>
  return (
    <svg viewBox="0 0 100 100" width={76} height={76} role="img" aria-label={choice.text} style={{ display: 'block' }}>
      <Draw />
    </svg>
  )
}
