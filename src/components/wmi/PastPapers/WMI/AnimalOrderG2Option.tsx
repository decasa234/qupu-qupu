import type { WmiChoice } from '../../../../types/wmi'
import { COW, ELEPHANT, MONKEY, PIG, type AnimalEmoji } from './AnimalWeightsG2Illustration'

// Renders a WMI-19F2A-Q14 answer option as the heaviest-to-lightest animal
// ordering it stands for, rather than the bare letter. The original scan's
// options are pictures (orderings of the four animals); OCR lost their content,
// so the distractors are reconstructed — C is the correct order
// (elephant > cow > pig > monkey, matching the seesaw figure), A is the classic
// reversed (lightest-first) trap named in the breakdown, and B / D swap one
// adjacent pair each.
export const ORDER_OPTIONS: ReadonlyArray<{ label: 'A' | 'B' | 'C' | 'D'; order: AnimalEmoji[] }> = [
  { label: 'A', order: [MONKEY, PIG, COW, ELEPHANT] }, // reversed: lightest first
  { label: 'B', order: [COW, ELEPHANT, PIG, MONKEY] }, // top two swapped
  { label: 'C', order: [ELEPHANT, COW, PIG, MONKEY] }, // correct
  { label: 'D', order: [ELEPHANT, PIG, COW, MONKEY] }, // middle two swapped
]

export default function AnimalOrderG2Option({ choice }: { choice: WmiChoice }) {
  const opt = ORDER_OPTIONS.find((o) => o.label === choice.label)
  if (!opt) return <span>{choice.text}</span>
  return (
    <svg
      viewBox="0 0 176 40"
      width="176"
      height="40"
      role="img"
      aria-label={`option ${choice.label}`}
      style={{ display: 'block' }}
    >
      {opt.order.map((animal, i) => (
        <g key={i}>
          <text x={i * 46 + 14} y={20} textAnchor="middle" dominantBaseline="central" fontSize={24}>
            {animal}
          </text>
          {i < opt.order.length - 1 && (
            <text
              x={i * 46 + 37}
              y={20}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight={800}
              fill="#6B7280"
            >
              &gt;
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
