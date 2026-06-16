import type { WmiChoice } from '../../../../types/wmi'
import { LINES2, LineFigure } from './scenes21G2Illustrations'

/** WMI-21F2A Q2 — each option is a zigzag line figure. */
export function LineOption21G2({ choice }: { choice: WmiChoice }) {
  const fig = LINES2[choice.label]
  if (!fig) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}>
      <LineFigure fig={fig} size={24} />
    </span>
  )
}
