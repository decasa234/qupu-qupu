import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NEXT_DEG, Q4Diagram, RotatingTile } from './P22G1Q4Illustration'
import { buildP22G1Q4Steps } from './p22G1Q4Steps'

const GREEN = '#10B981'
const INK = '#1F2937'

// The four option tiles. The correct one (A) shows the tile at NEXT_DEG (180°);
// the distractors sit at clearly different orientations so A is uniquely right.
const OPTION_DEG = [NEXT_DEG, 90, 270, 45] as const // A, B, C, D
const OPTION_LABEL = ['A', 'B', 'C', 'D'] as const

function OptionsRow({ ringed }: { ringed: number }) {
  const w = 460
  const h = 130
  const cellW = w / 4
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {OPTION_DEG.map((deg, i) => {
        const cx = cellW * i + cellW / 2
        const cy = 56
        const isRinged = i === ringed
        return (
          <g key={i}>
            {isRinged && <rect x={cellW * i + 8} y={6} width={cellW - 16} height={h - 12} rx={12} fill="#D1FAE5" stroke={GREEN} strokeWidth={3} />}
            <RotatingTile cx={cx} cy={cy} deg={deg} size={0.62} />
            <text x={cx} y={h - 12} textAnchor="middle" fontSize={17} fontWeight={900} fill={isRinged ? '#065F46' : INK} className="font-display">
              {OPTION_LABEL[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function P22G1Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = props.correctAnswer || 'A'
  const story = useMemo(() => buildP22G1Q4Steps(lang, answer), [lang, answer])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: ubin berputar tetap tiap langkah; ubin berikutnya di ${NEXT_DEG}°, cocok dengan pilihan ${answer}.`
      : `Explainer: the tile turns a fixed amount each step; the next tile is at ${NEXT_DEG} degrees, matching option ${answer}.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <Q4Diagram revealNext={beat.revealNext} showArrows={beat.showArrows} spotlight={beat.spotlight} />

        {beat.showOptions && <OptionsRow ringed={beat.ringedOption} />}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
