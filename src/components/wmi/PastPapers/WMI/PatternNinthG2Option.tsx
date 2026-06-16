import type { WmiChoice } from '../../../../types/wmi'
import { ANSWER_OPTIONS, FoodGlyph } from './PatternNinthG2Illustration'

// Renders a WMI-19F2A-Q5 answer option as the food picture it stands for, rather
// than the bare letter. The label→food map (ANSWER_OPTIONS) is shared with the
// figure + explainer, so the options can never drift from them. The A/B/C/D
// label itself is still shown by WmiAnswerChoice.
export default function PatternNinthG2Option({ choice }: { choice: WmiChoice }) {
  const opt = ANSWER_OPTIONS.find((o) => o.label === choice.label)
  if (!opt) return <span>{choice.text}</span>
  return (
    <svg viewBox="0 0 44 44" width="44" height="44" role="img" aria-label={`option ${choice.label}`} style={{ display: 'block' }}>
      <FoodGlyph emoji={opt.emoji} cx={22} cy={22} size={30} />
    </svg>
  )
}
