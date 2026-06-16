import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { RouteMap } from './P21G3Q18Illustration'
import { buildP21G3Q18Steps } from './p21G3Q18Steps'

// WMI-21P3A-Q18 — four routes Home → School; which is longest? Answer D.
// The animation reuses the static RouteMap primitive and lights one route per
// beat: it shows the inner staircases (B/C) are the short cut, route A hugs the
// bottom edge, and route D wraps the whole outer edge (top + far right) — the
// longest path — landing on D.

const BLUE = '#30598A'
const GREEN = '#10B981'
const ORANGE = '#f0853a'

export default function P21G3Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildP21G3Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: B and C cut across the middle, the short way. A rides the bottom edge. D wraps the outer edge — all across the top then down the far right — so D is the longest route. Answer D.',
    'Penjelasan: B dan C memotong lewat tengah, jalur pendek. A menyusuri tepi bawah. D melingkari tepi luar — seluruh atas lalu turun paling kanan — jadi D rute terpanjang. Jawaban D.',
  )

  const litColor = beat.result ? GREEN : ORANGE

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('The route that wraps the outside is the longest', 'Rute yang melingkari luar adalah yang terpanjang')}
        </div>

        <RouteMap litLabel={beat.litLabel} litColor={litColor} />

        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.litLabel
                ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
