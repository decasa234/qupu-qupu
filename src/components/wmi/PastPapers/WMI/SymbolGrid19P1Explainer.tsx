import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SymbolGridDiagram } from './SymbolGrid19P1Illustration'
import { buildSymbolGrid19P1Steps } from './symbolGrid19P1Steps'

const GREEN = '#10B981'

export default function SymbolGrid19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSymbolGrid19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: cari baris ${story.askedRow + 1} dan kolom ${story.askedCol + 1}, simbol di perpotongannya adalah pilihan D.`
      : `Explainer: find row ${story.askedRow + 1} and column ${story.askedCol + 1}; the symbol where they cross is option D.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SymbolGridDiagram
          highlightRow={beat.highlightRow}
          highlightCol={beat.highlightCol}
          pickCell={beat.pickCell}
        />

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
