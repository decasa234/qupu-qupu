import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildPaintedCubeSteps,
  paintedFacesAt,
  PAINTED_CLASS_FACES,
} from './paintedCubeSteps'
import { useBeatControl } from './useBeatControl'

// House palette.
const BLUE = '#30598A'
const PAINT = '#F0853A'
const GREEN = '#58A700'
const GREEN_INK = '#2F5A00'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'

// One colour per painted-face class (3 / 2 / 1 / 0 painted faces).
const CLASS_COLOR: Record<number, string> = { 3: PAINT, 2: '#E0A000', 1: GREEN, 0: BLUE }
// Muted tint used once a class has been introduced but is no longer the focus.
const CLASS_SOFT: Record<number, string> = { 3: '#FBDCC2', 2: '#F6E7B6', 1: '#D4EABE', 0: '#C7D5E6' }

const NEUTRAL = '#E8EDF3'
const NEUTRAL_STROKE = '#C7D0DA'
const ACTIVE_INK = '#25384F'
const PAINT_WASH = '#FBD5AE'
const PANEL = '#F4F7FA'
const MUTED_TEXT = '#8A94A3'

// Isometric projection, copy-adapted from the IsoCubes primitive
// (src/components/wmi/PastPapers/WMI/primitives/IsoCubes.tsx): the origin of a
// voxel is the left tip of its top-face diamond.
const ISO_SIZE = 30
const ISO_CX = ISO_SIZE * 0.866
const ISO_CY = ISO_SIZE * 0.5

interface Voxel {
  x: number
  y: number
  z: number
}

/** Only the skin of the cube is drawn — inner voxels are invisible anyway. */
function surfaceVoxels(n: number): Voxel[] {
  const out: Voxel[] = []
  for (let z = 0; z < n; z++) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (x === 0 || x === n - 1 || y === 0 || y === n - 1 || z === 0 || z === n - 1) {
          out.push({ x, y, z })
        }
      }
    }
  }
  // Painter's order: back (high y) first, then low z, then low x.
  return out.sort((a, b) => b.y - a.y || a.z - b.z || a.x - b.x)
}

function isoBox(n: number) {
  // Extreme silhouette points across the whole cube.
  const minX = 0
  const maxX = (2 * (n - 1)) * ISO_CX + 2 * ISO_CX
  const minY = -(n - 1) * ISO_CY - (n - 1) * ISO_SIZE - ISO_CY
  const maxY = (n - 1) * ISO_CY + ISO_CY + ISO_SIZE
  const pad = 6
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 }
}

function fitBox(vbW: number, vbH: number, maxW: number, maxH: number) {
  const s = Math.min(maxW / vbW, maxH / vbH)
  return { w: Math.round(vbW * s), h: Math.round(vbH * s) }
}

/** The assembled, freshly painted cube. */
function SolidCube({ n, label }: { n: number; label: string }) {
  const voxels = useMemo(() => surfaceVoxels(n), [n])
  const vb = useMemo(() => isoBox(n), [n])
  const { w, h } = fitBox(vb.w, vb.h, 300, 186)

  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} width={w} height={h} role="img" aria-label={label}>
      {voxels.map(({ x, y, z }) => {
        const sx = (x + y) * ISO_CX
        const sy = (x - y) * ISO_CY - z * ISO_SIZE
        const top = `${sx},${sy} ${sx + ISO_CX},${sy - ISO_CY} ${sx + 2 * ISO_CX},${sy} ${sx + ISO_CX},${sy + ISO_CY}`
        const left = `${sx},${sy} ${sx + ISO_CX},${sy + ISO_CY} ${sx + ISO_CX},${sy + ISO_CY + ISO_SIZE} ${sx},${sy + ISO_SIZE}`
        const right = `${sx + ISO_CX},${sy + ISO_CY} ${sx + 2 * ISO_CX},${sy} ${sx + 2 * ISO_CX},${sy + ISO_SIZE} ${sx + ISO_CX},${sy + ISO_CY + ISO_SIZE}`
        return (
          <g key={`${x}-${y}-${z}`}>
            <polygon points={top} fill="#F8B784" stroke="#8A4514" strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={left} fill={PAINT} stroke="#8A4514" strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={right} fill="#C96B26" stroke="#8A4514" strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

interface LayerLayout {
  cell: number
  cellGap: number
  gridSide: number
  perRow: number
  labelH: number
  rowGap: number
  layerGap: number
  width: number
  height: number
}

function layerLayout(n: number): LayerLayout {
  const cellGap = n >= 5 ? 1.5 : 2
  const layerGap = 16
  const rowGap = 12
  const labelH = 15
  const perRow = Math.min(n, 5)
  const maxW = 416
  const raw = (maxW - (perRow - 1) * layerGap - perRow * (n - 1) * cellGap) / (perRow * n)
  const cell = Math.max(7, Math.min(30, raw))
  const gridSide = n * cell + (n - 1) * cellGap
  const rows = Math.ceil(n / perRow)
  return {
    cell,
    cellGap,
    gridSide,
    perRow,
    labelH,
    rowGap,
    layerGap,
    width: perRow * gridSide + (perRow - 1) * layerGap,
    height: rows * (gridSide + labelH) + (rows - 1) * rowGap,
  }
}

interface LayersBoardProps {
  n: number
  activeFaces: number | null
  walked: boolean[]
  layerWord: string
  label: string
  reduce: boolean
}

/**
 * The cube sliced into its n layers, laid out flat so every small cube — the
 * hidden interior ones included — is visible at once. The orange panel border
 * marks the painted sides; the orange wash marks the painted top / bottom.
 */
function LayersBoard({ n, activeFaces, walked, layerWord, label, reduce }: LayersBoardProps) {
  const L = useMemo(() => layerLayout(n), [n])
  const panelPad = 5
  const pad = panelPad + 2
  const { w, h } = fitBox(L.width + pad * 2, L.height + pad * 2, 420, 186)
  const step = L.cell + L.cellGap
  const rx = Math.min(3, L.cell / 4)
  const fontSize = Math.max(8, Math.min(11, L.cell * 0.55))

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${L.width + pad * 2} ${L.height + pad * 2}`}
      width={w}
      height={h}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: n }, (_, z) => {
        const col = z % L.perRow
        const row = Math.floor(z / L.perRow)
        const x0 = col * (L.gridSide + L.layerGap)
        const y0 = row * (L.gridSide + L.labelH + L.rowGap)
        const painted = z === 0 || z === n - 1
        return (
          <motion.g
            key={z}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : z * 0.06 }}
          >
            {/* layer panel: the orange frame is the painted side skin every layer
                touches; the orange fill marks the two layers whose whole outer
                face was painted (the top and the bottom of the big cube). */}
            <rect
              x={x0 - panelPad}
              y={y0 - panelPad}
              width={L.gridSide + panelPad * 2}
              height={L.gridSide + panelPad * 2}
              rx={6}
              fill={painted ? PAINT_WASH : PANEL}
              stroke={PAINT}
              strokeWidth={painted ? 3 : 1.6}
            />
            {Array.from({ length: n }, (_, r) =>
              Array.from({ length: n }, (_, c) => {
                const faces = paintedFacesAt(n, c, r, z)
                const idx = PAINTED_CLASS_FACES.indexOf(faces as 3 | 2 | 1 | 0)
                const isActive = activeFaces === faces
                const isWalked = idx >= 0 && walked[idx]
                const fill = isActive ? CLASS_COLOR[faces] : isWalked ? CLASS_SOFT[faces] : NEUTRAL
                const stroke = isActive ? ACTIVE_INK : isWalked ? CLASS_COLOR[faces] : NEUTRAL_STROKE
                return (
                  <motion.rect
                    key={`${r}-${c}`}
                    x={x0 + c * step}
                    y={y0 + r * step}
                    width={L.cell}
                    height={L.cell}
                    rx={rx}
                    initial={false}
                    animate={{ fill, stroke }}
                    style={{ fill, stroke }}
                    strokeWidth={isActive ? 1.4 : 1}
                    transition={{
                      duration: reduce ? 0 : 0.32,
                      delay: reduce || !isActive ? 0 : z * 0.05,
                    }}
                  />
                )
              }),
            )}
            <text
              x={x0 + L.gridSide / 2}
              y={y0 + L.gridSide + L.labelH - 3}
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight="700"
              fill={MUTED_TEXT}
              style={{ userSelect: 'none' }}
            >
              {`${layerWord} ${z + 1}`}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

interface ChipProps {
  faces: number
  label: string
  value: number | null
  walked: boolean
  active: boolean
  isAnswer: boolean
  facesWord: string
}

/** One class tally: swatch, painted-face count, position name, running count. */
function ClassChip({ faces, label, value, walked, active, isAnswer, facesWord }: ChipProps) {
  const color = CLASS_COLOR[faces]
  const shown = value === null ? (walked ? '?' : '–') : String(value)
  const valueColor = isAnswer ? GREEN_INK : active ? color : value === null ? MUTED_TEXT : BLUE
  return (
    <motion.div
      className="flex flex-col items-center gap-0.5 rounded-xl border-2 px-1 py-1 leading-tight"
      animate={{
        borderColor: isAnswer ? GREEN : active ? color : walked ? CLASS_SOFT[faces] : '#E3E8EF',
        backgroundColor: isAnswer ? '#EEF8E2' : active ? '#FFFFFF' : SHELL,
        scale: active ? 1.03 : 1,
      }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
    >
      <span className="flex items-center gap-1 font-display text-[0.625rem] font-bold" style={{ color: MUTED_TEXT }}>
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-[0.1875rem]"
          style={{ background: walked ? color : NEUTRAL, border: `1px solid ${walked ? color : NEUTRAL_STROKE}` }}
          aria-hidden
        />
        {`${faces} ${facesWord}`}
      </span>
      <span className="font-display text-[0.6875rem] font-extrabold" style={{ color: BLUE }}>
        {label}
      </span>
      <span className="font-display text-lg font-black tabular-nums" style={{ color: valueColor }}>
        {shown}
      </span>
    </motion.div>
  )
}

export default function PaintedCubeFacesCountExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as { n?: unknown; k?: unknown }
  const reduce = !!useReducedMotion()

  const story = useMemo(() => buildPaintedCubeSteps(p.n, p.k, lang), [p.n, p.k, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { n, k, total, answer, classes, targetIndex } = story
  const activeFaces = beat.activeIndex >= 0 ? classes[beat.activeIndex].faces : null

  const ariaLabel = T(
    `A ${n}×${n}×${n} cube painted all over and cut into ${total} small cubes. Sorting them by position — 8 corners, ${classes[1].count} edge cubes, ${classes[2].count} face-centre cubes, ${classes[3].count} inside cubes — gives ${answer} cubes with exactly ${k} painted ${k === 1 ? 'face' : 'faces'}.`,
    `Kubus ${n}×${n}×${n} dicat seluruhnya lalu dipotong jadi ${total} kubus kecil. Dikelompokkan menurut posisi — 8 sudut, ${classes[1].count} rusuk, ${classes[2].count} tengah sisi, ${classes[3].count} dalam — sehingga ada ${answer} kubus dengan tepat ${k} sisi tercat.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-2.5 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* what we are hunting for */}
        <div
          className="rounded-lg px-3 py-1 font-display text-[0.8125rem] font-extrabold"
          style={{ background: '#E1EFFB', color: BLUE }}
        >
          {T(`Find: cubes with exactly ${k} painted ${k === 1 ? 'face' : 'faces'}`, `Cari: kubus dengan tepat ${k} sisi tercat`)}
        </div>

        {/* board — the solid painted cube, then its sliced layers */}
        <div className="flex h-[11.75rem] w-full items-center justify-center">
          {beat.mode === 'solid' ? (
            <motion.div
              key="solid"
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.35 }}
            >
              <SolidCube
                n={n}
                label={T(`Solid ${n}×${n}×${n} cube, painted on every outside face.`, `Kubus utuh ${n}×${n}×${n}, dicat di semua sisi luar.`)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="layers"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.3 }}
            >
              <LayersBoard
                n={n}
                activeFaces={activeFaces}
                walked={beat.walked}
                reduce={reduce}
                layerWord={T('Layer', 'Lapis')}
                label={T(
                  `The cube cut into ${n} layers, ${n} by ${n} small cubes each.`,
                  `Kubus dipotong jadi ${n} lapis, tiap lapis ${n} kali ${n} kubus kecil.`,
                )}
              />
            </motion.div>
          )}
        </div>

        {/* class tally — counts appear as each class is counted */}
        <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-4">
          {classes.map((cls, j) => (
            <ClassChip
              key={cls.faces}
              faces={cls.faces}
              label={cls.label}
              value={beat.counts[j]}
              walked={beat.walked[j]}
              active={beat.activeIndex === j}
              isAnswer={beat.result && j === targetIndex}
              facesWord={T(cls.faces === 1 ? 'face' : 'faces', 'sisi')}
            />
          ))}
        </div>

        {/* the four classes account for every small cube */}
        <div className="flex min-h-[1.5rem] items-center justify-center">
          {beat.result ? (
            <motion.div
              key="check"
              className="font-display text-sm font-extrabold tabular-nums"
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.1 }}
            >
              {classes.map((cls, j) => (
                <span key={cls.faces}>
                  {j > 0 && <span style={{ color: MUTED_TEXT }}> + </span>}
                  <span style={{ color: j === targetIndex ? GREEN_INK : BLUE }}>{cls.count}</span>
                </span>
              ))}
              <span style={{ color: MUTED_TEXT }}> = </span>
              <span style={{ color: BLUE }}>{total}</span>
            </motion.div>
          ) : (
            <span className="font-display text-[0.6875rem] font-bold" style={{ color: MUTED_TEXT }}>
              {T('Where a cube sits decides how much paint it gets', 'Letak kubus menentukan berapa sisinya tercat')}
            </span>
          )}
        </div>

        {/* caption */}
        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#EEF8E2', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
