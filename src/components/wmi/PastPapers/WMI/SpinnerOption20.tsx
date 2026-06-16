import type { WmiChoice } from '../../../types/wmi'

// Renders an answer option for the spinner question (WMI-20F1A-Q9) as a small
// square swatch matching the spinner sectors in Spinner20Illustration:
//   green with diagonal stripes, plain purple, or orange with dots.
// The "all are equally likely" option has no swatch and falls back to text.
//
// Colours mirror Spinner20Illustration exactly (that file doesn't export
// them, and its <pattern> ids live on the same page, so we use local
// patterns with unique "q9opt-" ids to avoid SVG id collisions).
const PURPLE = '#8B7CC8'
const ORANGE = '#F59E0B'
const ORANGE_BG = '#FDE68A'
const GREEN = '#86EFAC'
const GREEN_DARK = '#16A34A'
const DARK = '#1F2937'

type SwatchKind = 'green-stripes' | 'purple' | 'orange-dots'

function detectSwatch(text: string): SwatchKind | null {
  const t = text.toLowerCase()
  if (/stripes|bergaris/.test(t)) return 'green-stripes'
  if (/dots|berbintik/.test(t)) return 'orange-dots'
  if (/purple|ungu/.test(t)) return 'purple'
  return null
}

const SIZE = 48

export default function SpinnerOption20({ choice }: { choice: WmiChoice }) {
  const kind = detectSwatch(choice.text)
  // The "all are equally likely" option (and anything unrecognised) stays text.
  if (!kind) return <span>{choice.text}</span>

  const fill =
    kind === 'purple' ? PURPLE : kind === 'orange-dots' ? 'url(#q9optDots)' : 'url(#q9optStripes)'

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      style={{ display: 'block' }}
      role="img"
      aria-label={choice.text}
    >
      <defs>
        {kind === 'orange-dots' && (
          <pattern id="q9optDots" patternUnits="userSpaceOnUse" width={16} height={16}>
            <rect width={16} height={16} fill={ORANGE_BG} />
            <circle cx={4} cy={4} r={3.4} fill={ORANGE} />
            <circle cx={12} cy={12} r={3.4} fill={ORANGE} />
          </pattern>
        )}
        {kind === 'green-stripes' && (
          <pattern id="q9optStripes" patternUnits="userSpaceOnUse" width={10} height={10} patternTransform="rotate(45)">
            <rect width={10} height={10} fill={GREEN} />
            <rect width={4} height={10} fill={GREEN_DARK} />
          </pattern>
        )}
      </defs>
      <rect x={1.5} y={1.5} width={SIZE - 3} height={SIZE - 3} rx={4} fill={fill} stroke={DARK} strokeWidth={2} />
    </svg>
  )
}
