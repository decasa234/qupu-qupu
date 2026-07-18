// src/components/wmi/path/PathNode.tsx
//
// One circular stop on the Belajar skill-tree path, a chunky 3D button in two
// layers: a STATIC solid-colored side rim (a darker shade of the face color —
// never a gray translucent shadow, never moving or recoloring) and the top
// face that sinks PART of the way onto it when pressed, so a slice of the rim
// stays visible even while held. The segment arcs (sized so button + rim sit
// fully inside the circle), spotlight donut and breathing glow all stay put
// during the press. Near-zero text by
// design — the node communicates through icon + color (plant tier for open
// concepts, lock for locked, donut spotlight + "Mulai" chip for the spotlit
// stop, a static checkpoint flag on the recommended-next stop, flag +
// "Tes Bab" chip for chapter-test boss nodes). Around each in-progress
// concept sits a 5-segment arc ring showing how many tiers are filled;
// mastered (tier 4) nodes trade the arcs for a solid gold ring, a three-tree
// "forest" face and twinkling stars. `label` feeds aria-label so screen
// readers still hear the concept name.
//
// States: 'locked' (not tappable), 'current' (the spotlit stop),
// 'open' (tappable — renders the plant at whatever tier it has reached, which
// may be tier 0; for boss nodes 'open' means the chapter test was passed).

import type { Ref } from 'react'
import PlantIcon from '../PlantIcon'
import { PLANT_STAGES } from '../plantStages'
import type { WmiComprehensionTier } from '../../../types/wmi'

export type PathNodeState = 'locked' | 'current' | 'open'

// 5 rounded, separated arc segments around the node; `tier` of them filled.
// ARC_R pushes the ring outward so the button AND its side rim sit fully
// inside the circle (pairs with the wider wrapper padding below).
const SEG = 72
const SEG_GAP = 22
const ARC_R = 46
const ARC_C = 50

function segmentArcs(tier: number): Array<{ d: string; color: string }> {
  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180
    return `${(ARC_C + ARC_R * Math.cos(rad)).toFixed(2)} ${(ARC_C + ARC_R * Math.sin(rad)).toFixed(2)}`
  }
  return Array.from({ length: 5 }, (_, i) => {
    const s = -90 + i * SEG + SEG_GAP / 2
    const e = -90 + (i + 1) * SEG - SEG_GAP / 2
    return {
      d: `M ${pt(s)} A ${ARC_R} ${ARC_R} 0 0 1 ${pt(e)}`,
      color: i < tier ? '#58A700' : '#E5D6BC',
    }
  })
}

// Inset gloss for the candy-button volume — top glow ONLY. No bottom inset
// shade: that read as a second side rim doubling the real one below.
const GLOSS = 'shadow-[inset_0_6px_8px_-3px_rgba(255,255,255,0.65)]'
const GLOSS_BRIGHT = 'shadow-[inset_0_6px_8px_-3px_rgba(255,255,255,0.9)]'

interface Props {
  state: PathNodeState
  tier: WmiComprehensionTier
  isBoss: boolean
  label: string
  onClick: () => void
  anchorRef?: Ref<HTMLButtonElement>
  /** This node's sheet is currently open — spotlight it. */
  selected?: boolean
  /** The "recommended next" stop — carries the static checkpoint flag. */
  checkpoint?: boolean
}

export default function PathNode({
  state,
  tier,
  isBoss,
  label,
  onClick,
  anchorRef,
  selected,
  checkpoint,
}: Props) {
  const size = isBoss ? 'h-[4.5rem] w-[4.5rem] text-[1.75rem]' : 'h-16 w-16 text-[1.5rem]'
  const locked = state === 'locked'
  const stage = PLANT_STAGES[tier]
  const mastered = !isBoss && !locked && tier >= 4
  const spotlight = (selected && !locked) || state === 'current'

  let face: React.ReactNode
  let circleStyle: React.CSSProperties | undefined
  let glossClass = ''
  // The 3D "side" of the button — a STATIC solid-colored layer (never a gray
  // translucent shadow). It never moves or changes color; pressing sinks the
  // face down to cover it.
  let rim: { color: string; depth: number } | null = null
  let pressClass = ''
  let chip: { text: string; bg: string } | null = null

  if (isBoss) {
    chip = {
      text: 'Tes Bab',
      bg: state === 'locked' ? '#C3CAD6' : '#30598A',
    }
    if (state === 'open') {
      circleStyle = { background: '#FFE159' } // bright gold
      glossClass = GLOSS_BRIGHT
      // Press sinks PART of the way — the side rim must stay visible.
      rim = { color: '#D9A800', depth: 9 }
      pressClass = 'active:translate-y-[4px]'
      face = <i className="fa-solid fa-crown text-[#8A6400]" aria-hidden="true" />
    } else if (locked) {
      circleStyle = { background: '#E7E2D6' }
      rim = { color: '#D8D2C2', depth: 7 }
      face = <i className="fa-solid fa-flag-checkered text-[#9AA0AC]" aria-hidden="true" />
    } else {
      // Tappable Tes Bab: clean white disc — no deep-orange side rim.
      circleStyle = { background: '#FFFFFF' }
      glossClass = GLOSS_BRIGHT
      pressClass = 'active:translate-y-[3px]'
      face = <i className="fa-solid fa-flag-checkered text-qupu-brand-blue" aria-hidden="true" />
    }
  } else if (locked) {
    circleStyle = { background: '#E7E2D6' }
    rim = { color: '#D8D2C2', depth: 6 }
    face = <i className="fa-solid fa-lock text-[1.125rem] text-[#9AA0AC]" aria-hidden="true" />
  } else {
    circleStyle = { background: stage.bg }
    glossClass = GLOSS
    if (state === 'current') {
      chip = { text: 'Mulai', bg: '#F0853A' }
      // Spotlit node keeps its side rim too — it fills the gap between the
      // button and the donut ring (pad = gap + depth/2, so the centred group
      // never crosses the donut).
      rim = { color: stage.rimHex, depth: 6 }
      pressClass = 'active:translate-y-[3px]'
    } else {
      // Press sinks PART of the way — the side rim must stay visible.
      rim = { color: stage.rimHex, depth: 7 }
      pressClass = 'active:translate-y-[4px]'
    }
    face = mastered ? (
      // Mastered — a little forest instead of the single tree.
      <span className="relative flex items-end" aria-hidden="true">
        <i className="fa-solid fa-tree text-[0.9375rem] opacity-75" style={{ color: stage.fg }} />
        <i className="fa-solid fa-tree -ml-[0.3125rem] text-[1.4375rem]" style={{ color: stage.fg }} />
        <i className="fa-solid fa-tree -ml-[0.3125rem] text-[0.8125rem] opacity-75" style={{ color: stage.fg }} />
      </span>
    ) : (
      <PlantIcon tier={tier} />
    )
  }

  // Segment-arc progress ring: only for plain open concepts (not the spotlit
  // node — that gets the donut ring — and not mastered).
  const segs = !isBoss && !locked && !spotlight && !mastered ? segmentArcs(tier) : null
  // Arc nodes get a wide 13px pad so the button + its side rim stay fully
  // inside the arc circle; spotlit: 7px pad — a 4px equal gap around the
  // centred button+rim group, with the donut hugging just outside it.
  const pad = segs ? 13 : spotlight ? 7 : 5
  // Button + rim are centred as ONE group: shifting the pair up by half the
  // rim depth equalises the gap above the face and below the rim.
  const groupShift = rim ? rim.depth / 2 : 0

  // Ring wrapper around the disc. The orange spotlight is a DONUT — an
  // outline drawn with box-shadow (transparent centre, small gap around the
  // disc), never a filled circle. Locked keeps its faint plate; mastered is
  // just the gold disc (no outer stroke).
  const ringBg = !spotlight && locked ? 'rgba(0,0,0,0.05)' : 'transparent'

  return (
    <div className="flex flex-col items-center">
      <span
        className="relative flex rounded-full"
        style={{
          background: ringBg,
          padding: pad,
          boxShadow: spotlight ? '0 0 0 5px #F0853A' : undefined,
        }}
      >
        {/* Checkpoint flag — stays planted on the recommended-next stop,
            regardless of which node is selected. */}
        {checkpoint && !isBoss && (
          <i
            className="fa-solid fa-flag-checkered pointer-events-none absolute -right-2.5 -top-2.5 z-10 rotate-12 text-base text-qupu-brand-blue drop-shadow-[0_1px_0_#FFFFFF]"
            aria-hidden="true"
          />
        )}
        {/* Breathing donut glow — starts flush against the spotlight ring's
            outer edge (no gap at rest) and slowly swells away and back;
            never moves with the press. Boss nodes breathe only while their
            sheet is open (every tappable boss glowing would be noise). */}
        {spotlight && (!isBoss || selected) && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-[5px] rounded-full ring-[6px] ring-qupu-brand-orange motion-safe:animate-breathe"
          />
        )}
        {segs && (
          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
          >
            {segs.map((seg, i) => (
              <path
                key={i}
                d={seg.d}
                fill="none"
                stroke={seg.color}
                strokeWidth={7}
                strokeLinecap="round"
              />
            ))}
          </svg>
        )}
        {/* Button + static side rim as one centred group. */}
        <span
          className="relative flex"
          style={groupShift ? { transform: `translateY(-${groupShift}px)` } : undefined}
        >
          {/* Static side rim — solid color, never moves; the face partially
              covers it when pressed. */}
          {rim && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ transform: `translateY(${rim.depth}px)`, background: rim.color }}
            />
          )}
          <button
            ref={anchorRef}
            type="button"
            aria-label={label}
            disabled={locked}
            onClick={onClick}
            className={`tap-press relative flex flex-shrink-0 items-center justify-center rounded-full ${size} ${glossClass} ${pressClass} ${
              selected && !locked ? 'z-20' : ''
            }`}
            style={circleStyle}
          >
            <span className="relative">{face}</span>
            {mastered && (
              <span aria-hidden="true">
                <i className="motion-safe:animate-twinkle fa-solid fa-star absolute -left-3 top-0.5 text-[0.5625rem] text-[#F59E0B]" />
                <i className="motion-safe:animate-twinkle fa-solid fa-star absolute -right-[0.6875rem] bottom-1 text-[0.4375rem] text-[#F59E0B] [animation-delay:.6s]" />
              </span>
            )}
          </button>
        </span>
      </span>
      {chip && (
        // relative z-[3]: paints above the breathing glow so the label stays
        // solid white where the glow ring crosses the chip.
        <span
          className="pointer-events-none relative z-[3] mt-1 rounded-full px-2.5 py-[3px] text-[0.5625rem] font-black uppercase tracking-[0.12em] text-white"
          style={{ background: chip.bg }}
          aria-hidden="true"
        >
          {chip.text}
        </span>
      )}
    </div>
  )
}
