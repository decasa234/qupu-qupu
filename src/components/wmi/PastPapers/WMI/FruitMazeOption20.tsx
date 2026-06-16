import type { WmiChoice } from '../../../../types/wmi'
import { FruitGlyph, type FruitKind } from './FruitMaze20Illustration'

// Renders a WMI-20F1A-Q15 answer option as the circled fruit icon from the
// source paper (banana / grapes / strawberry / green apple), reusing the
// maze's own glyphs so the options always match the figure. Binds to the
// choice text in both languages; unknown texts fall back to plain text.
const KIND_BY_KEYWORD: ReadonlyArray<{ pattern: RegExp; kind: FruitKind }> = [
  { pattern: /banana|pisang/i, kind: 'banana' },
  { pattern: /grape|anggur/i, kind: 'grapes' },
  { pattern: /strawberry|stroberi/i, kind: 'strawberry' },
  { pattern: /apple|apel/i, kind: 'apple' },
]

export default function FruitMazeOption20({ choice }: { choice: WmiChoice }) {
  const kind = KIND_BY_KEYWORD.find((k) => k.pattern.test(choice.text))?.kind
  if (!kind) return <span>{choice.text}</span>

  return (
    <svg
      viewBox="0 0 56 56"
      width={56}
      height={56}
      style={{ display: 'block' }}
      role="img"
      aria-label={choice.text}
    >
      <FruitGlyph kind={kind} cx={28} cy={28} r={24} />
    </svg>
  )
}
