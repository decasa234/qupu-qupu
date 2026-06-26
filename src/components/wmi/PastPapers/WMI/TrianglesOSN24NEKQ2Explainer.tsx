import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CompTriangle } from './TrianglesOSN24NEKQ2Illustration'
import { buildTrianglesOSN24NEKQ2Steps, D_MAX } from './trianglesOSN24NEKQ2Steps'

const S = 120
const H = S * Math.sqrt(3) / 2
const GAP = 24

// SVG size for the two side-by-side triangles
const SVG_W = 2 * S + GAP + 40
const SVG_H = Math.ceil(H + 20)
const LEFT_OX  = 20
const RIGHT_OX = LEFT_OX + S + GAP
const TRI_OY   = Math.ceil(H) + 4   // bottom of triangles sits at this y (upward construction)

const GREEN  = '#10B981'
const BLUE   = '#1a5276'

export default function TrianglesOSN24NEKQ2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildTrianglesOSN24NEKQ2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = lang === 'id'
    ? `Penjelasan: pilih kelompok {4,7,9} jumlah 20 dan {6,8,10} jumlah 24, produk maksimum D = ${D_MAX.toLocaleString()}.`
    : `Explainer: choose groups {4,7,9} sum 20 and {6,8,10} sum 24, maximum product D = ${D_MAX.toLocaleString()}.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Two composition triangles */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', maxWidth: SVG_W, display: 'block' }}
        >
          <CompTriangle
            ox={LEFT_OX}
            oy={TRI_OY}
            S={S}
            center="20"
            labels={beat.g1}
            solved={beat.g1[0] !== 'a'}
          />
          <CompTriangle
            ox={RIGHT_OX}
            oy={TRI_OY}
            S={S}
            center="24"
            labels={beat.g2}
            solved={beat.g2[0] !== 'd'}
          />
        </svg>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#EBF5FB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
