import type { WmiChoice } from '../../../../types/wmi'
import { ArrowClock } from './ClockTurnG2Explainer'

// WMI-20F2A-Q7 options drawn as clock faces. The arrow angle is keyed by the
// option LABEL (A–D), matching the printed paper: A 6:00, B 4:30, C 4:00,
// D 7:30 (degrees clockwise from 12).
const ANGLE_BY_LABEL: Record<string, number> = { A: 180, B: 135, C: 120, D: 225 }

export default function ClockTurnG2Option({ choice }: { choice: WmiChoice }) {
  const deg = ANGLE_BY_LABEL[choice.label]
  if (deg === undefined) return <span>{choice.text}</span>
  return (
    <span role="img" aria-label={choice.text} style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}>
      <ArrowClock deg={deg} size={104} />
    </span>
  )
}
