// src/components/wmi/track/TrackTrail.tsx
//
// The winding Duolingo-style trail for the QUPU track map — a copy-adaptation
// of src/components/wmi/path/PathTrail.tsx for the theme-driven track engine
// (units/nodes/gates) instead of the WMI garden (chapters/concepts/boss).
// Per unit: a banner row (the ONLY text on the canvas — unit name + gold
// fraction; a plain div in Plan 2, no breakdown-sheet tap), then one node per
// spine entry (concepts and gates, in registry order) laid out on the
// nodeOffsets S-curve. An SVG path behind the nodes connects their centers;
// locked units get a dashed stroke in the theme's trail color.

import type { Ref } from 'react'
import TrackNode from './TrackNode'
import type { TrackThemePack } from './themes'
import { nodeOffsets } from '../path/pathLayout'
import type {
  TrackConceptNodeState,
  TrackGateNodeState,
  TrackUnitState,
} from '../../../types/wmi'

export const ROW_H = 104
// Breathing room inside each unit's trail canvas: the first node clears the
// banner, the last node's chip stays inside the tinted section.
const PAD_TOP = 10
const PAD_BOT = 28

// The single "you are here" stop: the first unlocked unit's first concept
// that hasn't reached gold (level 5) yet. Null once everything unlocked is
// gold — mirrors the WMI garden's pickCurrentNode, simplified: the track
// engine's unit-unlock ordering already guarantees a single well-defined
// "next" concept, no per-child last-visited heuristic needed here.
export function pickCheckpoint(units: TrackUnitState[]): string | null {
  for (const unit of units) {
    if (!unit.unlocked) continue
    const concept = unit.nodes.find(
      (n): n is TrackConceptNodeState => n.kind === 'concept' && n.level < 5,
    )
    if (concept) return concept.slug
  }
  return null
}

function nodeKey(node: TrackConceptNodeState | TrackGateNodeState): string {
  return node.kind === 'concept' ? node.slug : `gate:${node.key}`
}

interface TrackTrailProps {
  units: TrackUnitState[]
  theme: TrackThemePack
  /** slug of the selected concept or `gate:${key}` — spotlight override. */
  selectedKey: string | null
  /** slug of the recommended next concept (first non-gold in an unlocked unit). */
  checkpointSlug: string | null
  onConcept: (node: TrackConceptNodeState, unit: TrackUnitState) => void
  onGate: (node: TrackGateNodeState, unit: TrackUnitState) => void
  currentRef?: Ref<HTMLButtonElement>
}

export default function TrackTrail({
  units,
  theme,
  selectedKey,
  checkpointSlug,
  onConcept,
  onGate,
  currentRef,
}: TrackTrailProps) {
  const sheetTaken = selectedKey !== null

  return (
    <div>
      {units.map((unit) => {
        const count = unit.nodes.length
        const offsets = nodeOffsets(count)
        const height = count * ROW_H + PAD_TOP + PAD_BOT
        const centers = offsets.map((p) => ({
          x: p.x * 100,
          y: p.y * ROW_H + ROW_H / 2 + PAD_TOP,
        }))
        const d = centers
          .map((p, i) => {
            if (i === 0) return `M ${p.x} ${p.y}`
            const prev = centers[i - 1]
            const midY = (prev.y + p.y) / 2
            return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`
          })
          .join(' ')

        const conceptNodes = unit.nodes.filter(
          (n): n is TrackConceptNodeState => n.kind === 'concept',
        )
        const goldCount = conceptNodes.filter((n) => n.gold).length
        const total = conceptNodes.length

        return (
          <section
            key={unit.key}
            className="mb-2 rounded-[1.625rem] p-2 pb-1"
            style={{ background: `${unit.colorHex}12` }}
          >
            {/* Banner row — plain div in Plan 2, no breakdown-sheet tap. */}
            <div
              aria-label={`${unit.nameId}, ${goldCount} dari ${total} emas`}
              className={`flex w-full items-center gap-3 rounded-[1.25rem] px-3.5 py-3 text-left ring-2 ${
                unit.unlocked
                  ? 'bg-white shadow-[0_5px_0_0_#FFD3B1] ring-[#FFE3CC]'
                  : 'bg-[#FBF4E7] shadow-[0_5px_0_0_#EFE2CC] ring-[#EFE2CC]'
              }`}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[0.75rem] text-[0.9375rem] text-white"
                style={{ background: unit.unlocked ? unit.colorHex : '#C3CAD6' }}
              >
                <i
                  className={`fa-solid ${unit.unlocked ? `fa-${unit.iconKey}` : 'fa-lock'}`}
                  aria-hidden="true"
                />
              </span>
              <span className="min-w-0 flex-1">
                <h2
                  className={`truncate font-display text-base font-black leading-tight ${
                    unit.unlocked ? 'text-qupu-brand-blue' : 'text-[#7C8597]'
                  }`}
                >
                  {unit.nameId}
                </h2>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-black/[0.07]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      background: unit.unlocked ? unit.colorHex : '#C3CAD6',
                      width: `${total ? Math.round((goldCount / total) * 100) : 0}%`,
                    }}
                  />
                </span>
              </span>
              <span
                className={`flex-shrink-0 font-display text-sm font-black ${
                  unit.unlocked ? 'text-[#58A700]' : 'text-[#AAB2BF]'
                }`}
              >
                {goldCount}/{total}
              </span>
            </div>

            {/* Trail canvas */}
            <div className="relative" style={{ height }}>
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox={`0 0 100 ${height}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={d}
                  fill="none"
                  stroke={theme.trailColor}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={unit.unlocked ? undefined : '4 14'}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {unit.nodes.map((node, i) => {
                const key = nodeKey(node)
                const isCheckpoint = node.kind === 'concept' && node.slug === checkpointSlug
                const spotlit = sheetTaken ? selectedKey === key : !sheetTaken && isCheckpoint
                const locked = node.kind === 'concept' ? !unit.unlocked : !node.unlocked
                const stage = node.kind === 'concept' ? theme.stages[node.level] : theme.stages[0]

                return (
                  <div
                    key={key}
                    data-node-key={key}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `calc(${offsets[i].x * 100}%)`, top: centers[i].y }}
                  >
                    <TrackNode
                      node={node}
                      stage={stage}
                      spotlit={spotlit}
                      checkpoint={isCheckpoint}
                      locked={locked}
                      onClick={() =>
                        node.kind === 'concept' ? onConcept(node, unit) : onGate(node, unit)
                      }
                      anchorRef={isCheckpoint ? currentRef : undefined}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
