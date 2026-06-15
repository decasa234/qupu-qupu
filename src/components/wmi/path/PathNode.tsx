// src/components/wmi/path/PathNode.tsx
//
// One circular stop on the Belajar skill-tree path, styled as a chunky 3D
// "pressable" button: a solid disc sitting on a darker bottom rim (hard-offset
// shadow) with a glossy top sheen; pressing sinks it down to meet the rim.
// Near-zero text by design — the node communicates through icon + color (plant
// tier for open concepts, lock for locked, pulsing play badge for the current
// stop, flag / crown for chapter-test boss nodes). `label` feeds aria-label so
// screen readers still hear the concept name.
//
// States: 'locked' (not tappable), 'current' (the "you are here" stop),
// 'open' (tappable — renders the plant at whatever tier it has reached, which
// may be tier 0; for boss nodes 'open' means the chapter test was passed).

import type { Ref } from 'react'
import PlantIcon from '../PlantIcon'
import { plantForTier } from '../plantTier'
import type { WmiComprehensionTier } from '../../../types/wmi'

export type PathNodeState = 'locked' | 'current' | 'open'

interface Props {
  state: PathNodeState
  tier: WmiComprehensionTier
  isBoss: boolean
  label: string
  onClick: () => void
  anchorRef?: Ref<HTMLButtonElement>
  /** This node's sheet is currently open — spotlight it. */
  selected?: boolean
}

export default function PathNode({ state, tier, isBoss, label, onClick, anchorRef, selected }: Props) {
  const size = isBoss ? 'h-20 w-20 text-[30px]' : 'h-16 w-16 text-[24px]'
  const locked = state === 'locked'
  const plant = plantForTier(tier)

  let face: React.ReactNode
  let circleStyle: React.CSSProperties | undefined
  // depthClass bundles the rim (hard bottom shadow) + the press-down sink.
  let depthClass = ''
  let ringClass = ''

  if (isBoss) {
    if (state === 'open') {
      circleStyle = { background: '#FFE159' } // bright gold
      ringClass = 'ring-2 ring-[#E8B400]'
      depthClass =
        'shadow-[0_8px_0_0_#D9A800] active:translate-y-[8px] active:shadow-[0_0_0_0_#D9A800]'
      face = <i className="fa-solid fa-crown text-[#8A6400]" aria-hidden="true" />
    } else if (locked) {
      circleStyle = { background: '#E7E2D6' }
      ringClass = 'ring-2 ring-[#D8D2C2]'
      depthClass = 'shadow-[0_5px_0_0_rgba(0,0,0,0.10)]'
      face = <i className="fa-solid fa-flag-checkered text-[#9AA0AC]" aria-hidden="true" />
    } else {
      circleStyle = { background: '#FFFFFF' }
      ringClass = 'ring-4 ring-qupu-brand-orange'
      depthClass =
        'shadow-[0_8px_0_0_#C46123] active:translate-y-[8px] active:shadow-[0_0_0_0_#C46123]'
      face = <i className="fa-solid fa-flag-checkered text-qupu-brand-blue" aria-hidden="true" />
    }
  } else if (locked) {
    circleStyle = { background: '#E7E2D6' }
    ringClass = 'ring-2 ring-[#D8D2C2]'
    depthClass = 'shadow-[0_4px_0_0_rgba(0,0,0,0.10)]'
    face = <i className="fa-solid fa-lock text-[18px] text-[#9AA0AC]" aria-hidden="true" />
  } else {
    // current + open both show the plant at its tier; current adds the halo,
    // a thicker orange ring, and a deeper rim so it sits proud of the trail.
    circleStyle = { background: plant.bg }
    if (state === 'current') {
      ringClass = 'ring-4 ring-qupu-brand-orange'
      depthClass =
        'shadow-[0_7px_0_0_rgba(0,0,0,0.20)] active:translate-y-[7px] active:shadow-[0_0_0_0_rgba(0,0,0,0.20)]'
    } else {
      ringClass = 'ring-1 ring-black/10'
      depthClass =
        'shadow-[0_6px_0_0_rgba(0,0,0,0.16)] active:translate-y-[6px] active:shadow-[0_0_0_0_rgba(0,0,0,0.16)]'
    }
    face = <PlantIcon tier={tier} />
  }

  // Selected (sheet open for this node) spotlights it: force the orange ring,
  // lift + enlarge it above neighbours, and add a soft pulsing halo.
  if (selected && !locked) {
    ringClass = 'ring-4 ring-qupu-brand-orange'
  }

  return (
    <button
      ref={anchorRef}
      type="button"
      aria-label={label}
      disabled={locked}
      onClick={onClick}
      className={`relative flex flex-shrink-0 items-center justify-center rounded-full transition-[transform,box-shadow] duration-150 ${size} ${ringClass} ${depthClass} ${
        selected && !locked ? 'z-20 scale-[1.12]' : ''
      }`}
      style={circleStyle}
    >
      {/* Selected spotlight halo — a glowing ring that marks the open node. */}
      {selected && !locked && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2.5 rounded-full ring-4 ring-qupu-brand-orange/45 motion-safe:animate-pulse"
        />
      )}
      {/* Glossy top sheen — gives the disc its rounded, candy-button volume. */}
      {!locked && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-2 top-1.5 h-1/4 rounded-full bg-white/45"
        />
      )}
      {/* Pulse halo marks THE current concept stop only (suppressed while it is
          the selected node — the selected halo takes over). Boss nodes can be
          "current" on several chapters at once — the orange ring alone signals
          those, no competing pulses. */}
      {state === 'current' && !isBoss && !selected && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 rounded-full bg-qupu-brand-orange/30 motion-safe:animate-pulse"
        />
      )}
      <span className="relative drop-shadow-sm">{face}</span>
      {!isBoss && state === 'open' && plant.crown && (
        <i
          className="fa-solid fa-crown absolute -right-1 -top-2 text-[15px] text-qupu-orange"
          aria-hidden="true"
        />
      )}
      {state === 'current' && !isBoss && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-qupu-brand-orange text-[11px] text-white shadow-[0_2px_0_0_#C46123] ring-2 ring-white"
        >
          <i className="fa-solid fa-play" />
        </span>
      )}
    </button>
  )
}
