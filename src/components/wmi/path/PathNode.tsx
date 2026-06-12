// src/components/wmi/path/PathNode.tsx
//
// One circular stop on the Belajar skill-tree path. Near-zero text by design:
// the node communicates entirely through icon + color (plant tier for done
// concepts, lock for locked, pulsing play halo for the current stop, flag /
// crown for chapter-test boss nodes). `label` feeds aria-label so screen
// readers still hear the concept name.

import type { Ref } from 'react'
import PlantIcon from '../PlantIcon'
import { plantForTier } from '../plantTier'
import type { WmiComprehensionTier } from '../../../types/wmi'

export type PathNodeState = 'locked' | 'current' | 'done'

interface Props {
  state: PathNodeState
  tier: WmiComprehensionTier
  isBoss: boolean
  label: string
  onClick: () => void
  anchorRef?: Ref<HTMLButtonElement>
}

export default function PathNode({ state, tier, isBoss, label, onClick, anchorRef }: Props) {
  const size = isBoss ? 'h-[72px] w-[72px] text-[28px]' : 'h-14 w-14 text-[22px]'
  const locked = state === 'locked'
  const plant = plantForTier(tier)

  let face: React.ReactNode
  let circleStyle: React.CSSProperties | undefined
  let circleClass = ''

  if (isBoss) {
    if (state === 'done') {
      // Boss passed — gold crown.
      circleClass = 'bg-qupu-brand-yellow ring-2 ring-[#E8B400] shadow-[0_5px_0_0_#D9A800]'
      face = <i className="fa-solid fa-crown text-[#8A6400]" aria-hidden="true" />
    } else if (locked) {
      circleClass = 'bg-[#E7E2D6] ring-2 ring-[#D8D2C2]'
      face = <i className="fa-solid fa-flag-checkered text-[#9AA0AC]" aria-hidden="true" />
    } else {
      circleClass = 'bg-white ring-4 ring-qupu-brand-orange shadow-[0_5px_0_0_#C46123]'
      face = <i className="fa-solid fa-flag-checkered text-qupu-brand-blue" aria-hidden="true" />
    }
  } else if (locked) {
    circleClass = 'bg-[#E7E2D6] ring-2 ring-[#D8D2C2]'
    face = <i className="fa-solid fa-lock text-[16px] text-[#9AA0AC]" aria-hidden="true" />
  } else {
    // current + done both show the plant at its tier; current adds the halo.
    circleClass =
      state === 'current'
        ? 'ring-4 ring-qupu-brand-orange shadow-[0_5px_0_0_#C46123]'
        : 'ring-2 ring-black/10 shadow-[0_4px_0_0_#FFD3B1]'
    circleStyle = { background: plant.bg }
    face = <PlantIcon tier={tier} />
  }

  return (
    <button
      ref={anchorRef}
      type="button"
      aria-label={label}
      disabled={locked}
      onClick={onClick}
      className={`relative flex flex-shrink-0 items-center justify-center rounded-full transition-transform active:translate-y-0.5 disabled:active:translate-y-0 ${size} ${circleClass}`}
      style={circleStyle}
    >
      {/* Pulse halo + play badge mark THE current concept stop only. Boss
          nodes can be "current" (= test available) on several chapters at
          once — the orange ring alone signals those, no competing pulses. */}
      {state === 'current' && !isBoss && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-full bg-qupu-brand-orange/30 motion-safe:animate-pulse"
        />
      )}
      <span className="relative">{face}</span>
      {!isBoss && state === 'done' && plant.crown && (
        <i
          className="fa-solid fa-crown absolute -right-1 -top-2 text-[14px] text-qupu-orange"
          aria-hidden="true"
        />
      )}
      {state === 'current' && !isBoss && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-qupu-brand-orange text-[10px] text-white ring-2 ring-white"
        >
          <i className="fa-solid fa-play" />
        </span>
      )}
    </button>
  )
}
