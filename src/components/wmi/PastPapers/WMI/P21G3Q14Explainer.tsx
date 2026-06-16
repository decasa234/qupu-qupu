import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SequenceGrid, OPTIONS } from './P21G3Q14Illustration'
import { buildP21G3Q14Steps } from './p21G3Q14Steps'

// WMI-21P3A-Q14 — "which figure comes next?" A shaded pair sweeps clockwise
// around the 3×3 border, one quarter-turn per frame. The animation reuses the
// SequenceGrid primitive: it rotates the pair beat by beat (left → top → right →
// bottom), then reveals the four option grids and rings D as the only match.
// Answer D.

const BLUE = '#30598A'
const GREEN = '#10B981'
const ORANGE = '#f0853a'

const OPTION_ORDER: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']

export default function P21G3Q14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildP21G3Q14Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Explainer: a shaded pair turns a quarter-turn clockwise each frame — left edge, then top, then right, then bottom. The bottom-edge frame is option D. Answer D.',
    'Penjelasan: pasangan berwarna berputar seperempat searah jarum jam tiap bingkai — tepi kiri, lalu atas, lalu kanan, lalu bawah. Bingkai tepi bawah adalah pilihan D. Jawaban D.',
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t('A quarter-turn clockwise each step', 'Seperempat putaran searah jarum jam tiap langkah')}
        </div>

        {/* The single rotating grid (hidden once we move to the option board). */}
        {!beat.showOptions && (
          <div className="rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
            <SequenceGrid shaded={beat.shaded} size={120} />
          </div>
        )}

        {/* The four option grids, A–D, with the picked one ringed. */}
        {beat.showOptions && (
          <div className="grid grid-cols-2 gap-3">
            {OPTION_ORDER.map((letter) => {
              const picked = beat.pick === letter
              return (
                <div key={letter} className="flex flex-col items-center gap-1">
                  <div className="rounded-lg border-2 bg-white p-1" style={{ borderColor: picked ? GREEN : '#E5E7EB' }}>
                    <SequenceGrid shaded={OPTIONS[letter]} size={72} accent={picked ? GREEN : undefined} />
                  </div>
                  <span className="font-display text-xs font-black" style={{ color: picked ? GREEN : '#6B7280' }}>
                    {letter}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.showOptions
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
