import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { OpChain, INPUT, VIEW_W } from './P23G3Q23Illustration'
import { buildP23G3Q23Steps } from './p23G3Q23Steps'

// WMI-23P3A-Q23 — post-answer explainer for the computing machine.
// Reuses the OpChain primitive: working backwards from 60, each beat lights the
// op being undone and writes the value flowing through it, landing on 21 → D.

const GREEN = '#10B981'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const VIEW_H = 150

export default function P23G3Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP23G3Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria = t(
    `Work the machine backwards from 60, undoing each operation: the input is ${INPUT}, so the answer is choice D.`,
    `Telusuri mesin mundur dari 60, batalkan tiap operasi: inputnya ${INPUT}, jadi jawabannya pilihan D.`,
  )

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ display: 'block', margin: '0 auto', maxWidth: VIEW_W }}
          aria-hidden="true"
        >
          <OpChain
            input={beat.input}
            output={beat.output}
            flowValues={beat.flowValues}
            litOp={beat.litOp}
            y={20}
          />
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
