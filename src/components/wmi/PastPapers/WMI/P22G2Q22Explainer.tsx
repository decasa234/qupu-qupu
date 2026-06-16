// Beat-by-beat explainer for WMI-22P2A-Q22 (arrow-grid path → orange, answer A).
//
// Reuses the ArrowBoard primitive from P22G2Q22Illustration so the animation
// reads as the SAME scene coming alive. Each beat draws more of the traced
// arrow chain in trail-orange; the last beat darts off the right edge of the
// top row onto the orange and declares answer A.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ArrowBoard,
  ArrowDefs,
  VIEW_W,
  VIEW_H,
  cellCenter,
  fruitAnchors,
} from './P22G2Q22Illustration'
import { buildP22G2Q22Steps } from './p22G2Q22Steps'

const TRAIL = '#F0853A'
const GREEN = '#10B981'

export default function P22G2Q22Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q22Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // The portion of the path revealed this beat.
  const shown = story.cells.slice(0, beat.shown)
  const trailPts = shown.map(([r, c]) => cellCenter(r, c))
  const trailD = trailPts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')

  // Exit dart: from the last cell off the right edge, onto the orange.
  const F = fruitAnchors()
  const last = story.cells[story.cells.length - 1]
  const [lx, ly] = cellCenter(last[0], last[1])

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ikuti rantai panah dari burung; lintasan keluar di tepi kanan baris atas dan mencapai jeruk — jawaban A.'
      : 'Explainer: follow the arrow chain from the chick; the path exits the right edge of the top row and reaches the orange — answer A.'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block' }}>
          <ArrowDefs />
          <ArrowBoard>
            {/* dots on every visited cell */}
            {shown.map(([r, c], i) => {
              const [x, y] = cellCenter(r, c)
              return <circle key={`d${i}`} cx={x} cy={y} r={4.5} fill={TRAIL} />
            })}
            {/* the trail so far */}
            {trailPts.length > 1 && (
              <path
                d={trailD}
                fill="none"
                stroke={TRAIL}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.95}
              />
            )}
            {/* start ring */}
            {trailPts.length > 0 && (
              <circle cx={trailPts[0][0]} cy={trailPts[0][1]} r={9} fill="none" stroke={TRAIL} strokeWidth={2.5} />
            )}
            {/* exit dart onto the orange */}
            {beat.exit && (
              <>
                <path
                  d={`M ${lx} ${ly} L ${F.orange[0] - 16} ${F.orange[1]}`}
                  fill="none"
                  stroke={TRAIL}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  markerEnd="url(#p22q22-trail)"
                />
                <circle cx={F.orange[0]} cy={F.orange[1]} r={22} fill="none" stroke={GREEN} strokeWidth={3} />
              </>
            )}
          </ArrowBoard>
        </svg>

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
