import type { WmiChoice } from '../../../../types/wmi'
import { ShadedFig21G3 } from './scenes21G3Illustrations'

/** WMI-21F3A Q12 — each option is a shaded 3×3 grid. */
export function ShadedOption21G3({ choice }: { choice: WmiChoice }) {
  const k = choice.label as 'A' | 'B' | 'C' | 'D'
  if (!['A', 'B', 'C', 'D'].includes(k)) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}>
      <ShadedFig21G3 k={k} size={20} />
    </span>
  )
}
