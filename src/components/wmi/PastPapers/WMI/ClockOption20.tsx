import type { WmiChoice } from '../../../../types/wmi'
import { AnalogClock20, parseClockTime } from './ClockMatch20Illustration'

// Renders an answer option for the clock-matching question (WMI-20F1A-Q6) as
// a small analog clock face. The time is read from the choice text (e.g.
// "4:30"), so the drawn hands always match the authored choice and can never
// drift from it. The drawn clock IS the option, so the text itself is hidden.
export default function ClockOption20({ choice }: { choice: WmiChoice }) {
  const parsed = parseClockTime(choice.text)
  // Fallback to plain text if the choice isn't an "h:mm" time.
  if (!parsed) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={`An analog clock showing ${choice.text}`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <AnalogClock20 time={choice.text} size={110} />
    </span>
  )
}
