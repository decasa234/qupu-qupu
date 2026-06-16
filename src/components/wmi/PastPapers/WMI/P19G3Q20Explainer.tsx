import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { type Cube, IsoBlocks, Q20_SOLID, isoBounds } from './P19G3Q20Illustration'
import { buildP19G3Q20Steps } from './p19G3Q20Steps'

const GREEN = '#10B981'
const TOWER_HL = 'rgba(16,185,129,0.45)'

// Rotated copy: turn 180° about the vertical (z) axis — (x,y,z) -> (-x,-y,z).
// This is a genuine rotation, so it is the SAME solid (matches choice A).
const ROT: Cube[] = Q20_SOLID.map((c) => ({ x: -c.x, y: -c.y, z: c.z }))
// Mirror copy: flip across the x=0 plane — (x,y,z) -> (-x,y,z). A reflection, NOT a
// rotation: the jutting cube ends up on the wrong side. Stands in for a wrong option.
const MIR: Cube[] = Q20_SOLID.map((c) => ({ x: -c.x, y: c.y, z: c.z }))

// The "feature" cube to highlight: the top of the tower.
const isTower = (c: Cube) => c.x === 0 && c.y === 0 && c.z === 1
const isTowerRot = (c: Cube) => c.x === 0 && c.y === 0 && c.z === 1
const isTowerMir = (c: Cube) => c.x === 0 && c.y === 0 && c.z === 1

export default function P19G3Q20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP19G3Q20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bentuk yang sama hanya diputar (bukan dicerminkan) adalah jawaban A.'
      : 'Explainer: the same shape only rotated (not mirrored) is answer A.'

  const cubes = beat.view === 'rot' ? ROT : beat.view === 'mir' ? MIR : Q20_SOLID
  const towerTest = beat.view === 'rot' ? isTowerRot : beat.view === 'mir' ? isTowerMir : isTower

  const b = isoBounds(cubes)
  const pad = 16
  const ox = pad - b.minX
  const oy = pad - b.minY
  const vbW = b.w + pad * 2
  const vbH = b.h + pad * 2

  const topFill = (c: Cube) => (beat.highlightTower && towerTest(c) ? TOWER_HL : undefined)

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${vbW.toFixed(1)} ${vbH.toFixed(1)}`}
          width="100%"
          style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <IsoBlocks cubes={cubes} ox={ox} oy={oy} topFill={topFill} />
        </svg>

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
