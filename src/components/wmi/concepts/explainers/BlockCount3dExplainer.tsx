import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildBlockCountSteps } from './blockCountSteps'
import { useBeatControl } from './useBeatControl'

// Isometric cube constants — mirror block-count-3d.tsx exactly.
const TW = 20
const TH = 10
const TZ = 22

// Cube face colors (matching the illustration's Tailwind tokens as hex):
// left face  — qupu-cream-dark (closest existing: qupu-cream #FFF2DF, darkened slightly)
// right face — qupu-shell #FFF9F4
// top face   — qupu-peach #FFD3B1
const FACE_LEFT_DEFAULT = '#F0E8CC'
const FACE_RIGHT_DEFAULT = '#FFF9F4'
const FACE_TOP_DEFAULT = '#FFD3B1'
const FACE_STROKE_DEFAULT = '#30598A'

// Highlighted (active group) — warm orange accent.
const FACE_LEFT_HL = '#EA580C'
const FACE_RIGHT_HL = '#F97316'
const FACE_TOP_HL = '#FED7AA'
const FACE_STROKE_HL = '#C2410C'

// Dimmed (inactive groups).
const FACE_LEFT_DIM = '#E5DFC8'
const FACE_RIGHT_DIM = '#F5F1E8'
const FACE_TOP_DIM = '#E8D9BE'
const FACE_STROKE_DIM = '#B0A98A'

const GREEN = '#10B981'

interface CubeData {
  cx: number
  cy: number
  key: string
}

interface GroupLayout {
  cubes: CubeData[]
}

interface Layout {
  groupLayouts: GroupLayout[]
  viewBox: string
  svgWidth: number
  svgHeight: number
}

interface BlockCountParams {
  groups: { depth: number; width: number; heights: number[] }[]
}

function computeLayout(groups: BlockCountParams['groups']): Layout {
  const gap = 56
  let runningX = 0
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  const groupLayouts: GroupLayout[] = groups.map((g) => {
    const { depth, width, heights } = g
    const H = (r: number, c: number) => heights[r * width + c] ?? 0
    const offsetX = runningX + depth * TW
    const offsetY = -((width - 1) + (depth - 1)) * TH

    const cubes: { r: number; c: number; z: number }[] = []
    for (let r = 0; r < depth; r++) {
      for (let c = 0; c < width; c++) {
        for (let z = 0; z < H(r, c); z++) {
          cubes.push({ r, c, z })
        }
      }
    }
    cubes.sort((a, b) => a.r + a.c - (b.r + b.c) || a.z - b.z)

    const cubeData: CubeData[] = cubes.map(({ r, c, z }) => {
      const cx = offsetX + (c - r) * TW
      const cy = offsetY + (c + r) * TH - z * TZ
      minX = Math.min(minX, cx - TW)
      maxX = Math.max(maxX, cx + TW)
      minY = Math.min(minY, cy - TH)
      maxY = Math.max(maxY, cy + TH + TZ)
      return { cx, cy, key: `${r}-${c}-${z}` }
    })

    runningX = runningX + (depth + width) * TW + gap
    return { cubes: cubeData }
  })

  const pad = 8
  const vbX = Number.isFinite(minX) ? minX - pad : -pad
  const vbY = Number.isFinite(minY) ? minY - pad : -pad
  const vbW = Number.isFinite(maxX) ? maxX - (vbX) + pad : 200
  const vbH = Number.isFinite(maxY) ? maxY - (vbY) + pad : 200

  return {
    groupLayouts,
    viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
    svgWidth: Math.min(460, Math.max(180, vbW)),
    svgHeight: Math.min(360, Math.max(120, vbH)),
  }
}

interface IsoCubeProps {
  cx: number
  cy: number
  highlighted: boolean
  dimmed: boolean
}

function IsoCube({ cx, cy, highlighted, dimmed }: IsoCubeProps) {
  const faceLeft = highlighted ? FACE_LEFT_HL : dimmed ? FACE_LEFT_DIM : FACE_LEFT_DEFAULT
  const faceRight = highlighted ? FACE_RIGHT_HL : dimmed ? FACE_RIGHT_DIM : FACE_RIGHT_DEFAULT
  const faceTop = highlighted ? FACE_TOP_HL : dimmed ? FACE_TOP_DIM : FACE_TOP_DEFAULT
  const stroke = highlighted ? FACE_STROKE_HL : dimmed ? FACE_STROKE_DIM : FACE_STROKE_DEFAULT

  const top = `${cx},${cy - TH} ${cx + TW},${cy} ${cx},${cy + TH} ${cx - TW},${cy}`
  const left = `${cx - TW},${cy} ${cx},${cy + TH} ${cx},${cy + TH + TZ} ${cx - TW},${cy + TZ}`
  const right = `${cx + TW},${cy} ${cx},${cy + TH} ${cx},${cy + TH + TZ} ${cx + TW},${cy + TZ}`

  return (
    <>
      <polygon points={left} fill={faceLeft} stroke={stroke} strokeWidth={1.5} />
      <polygon points={right} fill={faceRight} stroke={stroke} strokeWidth={1.5} />
      <polygon points={top} fill={faceTop} stroke={stroke} strokeWidth={1.5} />
    </>
  )
}

export default function BlockCount3dExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as BlockCountParams
  const rawGroups = p.groups
  const groups = useMemo(
    () => (Array.isArray(rawGroups) ? rawGroups : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(rawGroups)],
  )

  const story = useMemo(() => buildBlockCountSteps(groups, lang), [groups, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const layout = useMemo(() => computeLayout(groups), [groups])

  const ariaLabel =
    lang === 'id'
      ? `Tumpukan balok 3D: ${story.groups.length} kelompok, total ${story.total} balok.`
      : `3D block stacks: ${story.groups.length} group${story.groups.length !== 1 ? 's' : ''}, ${story.total} cubes total.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Isometric stack SVG */}
        <svg
          viewBox={layout.viewBox}
          width={layout.svgWidth}
          height={layout.svgHeight}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {layout.groupLayouts.map((gl, gi) => {
            const highlighted = beat.groupIndex === gi
            const dimmed = beat.groupIndex !== -1 && !highlighted
            return (
              <motion.g
                key={gi}
                animate={{ opacity: dimmed ? 0.4 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {gl.cubes.map((cube) => (
                  <IsoCube
                    key={cube.key}
                    cx={cube.cx}
                    cy={cube.cy}
                    highlighted={highlighted}
                    dimmed={dimmed}
                  />
                ))}
              </motion.g>
            )
          })}
        </svg>

        {/* Running total badge — shown once we start counting groups */}
        {beat.groupIndex >= 0 && (
          <motion.div
            key={`total-${beat.runningTotal}`}
            className="font-display text-3xl font-extrabold"
            style={{ color: beat.result ? GREEN : '#30598A' }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          >
            {beat.runningTotal}
          </motion.div>
        )}

        {/* Final equation */}
        {beat.result && story.groupTotals.length > 1 && (
          <motion.div
            key="equation"
            className="font-display text-xl font-extrabold"
            style={{ color: GREEN }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.1 }}
          >
            {story.groupTotals.join(' + ')} = {story.total}
          </motion.div>
        )}

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
