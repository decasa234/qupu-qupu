import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { WalletDiagram } from './Wallet19B5Illustration'
import { buildWallet19B5Steps } from './wallet19B5Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

export default function Wallet19B5Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const steps = useMemo(() => buildWallet19B5Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: anggap semua $2, hitung selisih, bagi dengan $3 per penggantian → 15 lembar $5.'
      : 'Explainer: assume all $2, find surplus $45, divide by $3 per swap → 15 five-dollar notes.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <WalletDiagram showAnswer={beat.showAnswer} highlight={beat.highlight} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
