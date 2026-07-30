import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPaintedCubeSteps, isPeelCell, paintedFacesAt } from './paintedCubeSteps'
import { useBeatControl } from './useBeatControl'

// House palette.
const BLUE = '#30598A'
const PAINT = '#F0853A'
const GREEN = '#58A700'
const GREEN_INK = '#2F5A00'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'

// Board inks.
const PAINT_SOFT = '#FBD5AE'
const PAINT_LINE = '#D9752F'
const CLEAN_FILL = '#FFFFFF'
const CLEAN_LINE = '#C7D0DA'
const GONE_FILL = '#E8EDF3'
const GONE_LINE = '#B9C3CE'
const PANEL = '#F4F7FA'
const PANEL_LINE = '#DCE4EC'
const MUTED_TEXT = '#8A94A3'

// Isometric projection, copy-adapted from the IsoCubes primitive
// (src/components/wmi/PastPapers/WMI/primitives/IsoCubes.tsx): the origin of a
// voxel is the left tip of its top-face diamond.
const ISO_SIZE = 30
const ISO_CX = ISO_SIZE * 0.866
const ISO_CY = ISO_SIZE * 0.5

// Solid-cube face shades: freshly painted, painted-but-not-the-focus, and the
// cubes the question is hunting for.
const SOLID_PAINT = { top: '#F8B784', left: PAINT, right: '#C96B26', line: '#8A4514' }
const SOLID_MUTED = { top: '#FBE3CE', left: '#F7C9A2', right: '#E7B48D', line: '#C79A78' }
const SOLID_TARGET = { top: '#A9DE6D', left: GREEN, right: '#3F7B00', line: GREEN_INK }

const BOARD_W = 420
const BOARD_H = 186

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
  const maxX = 2 * (n - 1) * ISO_CX + 2 * ISO_CX
  const minY = -(n - 1) * ISO_CY - (n - 1) * ISO_SIZE - ISO_CY
  const maxY = (n - 1) * ISO_CY + ISO_CY + ISO_SIZE
  const pad = 6
  return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 }
}

function fitBox(vbW: number, vbH: number, maxW: number, maxH: number) {
  const s = Math.min(1, Math.min(maxW / vbW, maxH / vbH))
  return { w: Math.round(vbW * s), h: Math.round(vbH * s) }
}

/**
 * The assembled, painted cube. When `litFaces` is set, the unit cubes carrying
 * exactly that many painted faces glow green and the rest of the paint fades
 * back — so "where does this class live?" is answered on the real cube.
 */
function SolidCube({ n, litFaces, label }: { n: number; litFaces: number | null; label: string }) {
  const voxels = useMemo(() => surfaceVoxels(n), [n])
  const vb = useMemo(() => isoBox(n), [n])
  const { w, h } = fitBox(vb.w, vb.h, 300, BOARD_H)

  return (
    <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} width={w} height={h} role="img" aria-label={label}>
      {voxels.map(({ x, y, z }) => {
        const sx = (x + y) * ISO_CX
        const sy = (x - y) * ISO_CY - z * ISO_SIZE
        const top = `${sx},${sy} ${sx + ISO_CX},${sy - ISO_CY} ${sx + 2 * ISO_CX},${sy} ${sx + ISO_CX},${sy + ISO_CY}`
        const left = `${sx},${sy} ${sx + ISO_CX},${sy + ISO_CY} ${sx + ISO_CX},${sy + ISO_CY + ISO_SIZE} ${sx},${sy + ISO_SIZE}`
        const right = `${sx + ISO_CX},${sy + ISO_CY} ${sx + 2 * ISO_CX},${sy} ${sx + 2 * ISO_CX},${sy + ISO_SIZE} ${sx + ISO_CX},${sy + ISO_CY + ISO_SIZE}`
        const shade =
          litFaces === null
            ? SOLID_PAINT
            : paintedFacesAt(n, x, y, z) === litFaces
              ? SOLID_TARGET
              : SOLID_MUTED
        return (
          <g key={`${x}-${y}-${z}`}>
            <polygon points={top} fill={shade.top} stroke={shade.line} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={left} fill={shade.left} stroke={shade.line} strokeWidth={1.2} strokeLinejoin="round" />
            <polygon points={right} fill={shade.right} stroke={shade.line} strokeWidth={1.2} strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

interface PiecesLayout {
  subGrids: number
  /** cells across / down inside one drawn piece. */
  gw: number
  gh: number
  cell: number
  cellGap: number
  pieceGap: number
  rowGap: number
  labelH: number
  perRow: number
  rows: number
  pieceW: number
  pieceH: number
  width: number
  height: number
}

/**
 * Lay the class's pieces out flat. A 3-D piece (the whole cube) is drawn as its
 * n layers; a 2-D piece as an n×n square; a 1-D piece as a strip of n; a 0-D
 * piece as a single cube. The per-row count is chosen to make the cells as big
 * as the board allows, so a 3×3 core fills the board while 12 edge strips still
 * fit.
 */
function piecesLayout(n: number, groups: number, dims: number): PiecesLayout {
  const subGrids = dims >= 3 ? n : groups
  const gw = dims >= 1 ? n : 1
  const gh = dims >= 2 ? n : 1
  const cellGap = 2
  // A lone corner cube is narrower than its "Bottom 4" label, so give it room.
  const pieceGap = dims === 0 ? 30 : 12
  const rowGap = 10
  const labelH = 14

  // Corners read as "4 on top, 4 underneath", so they always sit 4 to a row.
  const candidates = dims === 0 ? [4] : Array.from({ length: subGrids }, (_, i) => i + 1)
  let perRow = 1
  let best = -Infinity
  for (const cand of candidates) {
    const rows = Math.ceil(subGrids / cand)
    const sw = (BOARD_W - (cand - 1) * pieceGap - cand * (gw - 1) * cellGap) / (cand * gw)
    const sh = (BOARD_H - rows * labelH - (rows - 1) * rowGap - rows * (gh - 1) * cellGap) / (rows * gh)
    const size = Math.min(sw, sh)
    if (size > best) {
      best = size
      perRow = cand
    }
  }

  const cell = Math.max(6, Math.min(30, best))
  const rows = Math.ceil(subGrids / perRow)
  const pieceW = gw * cell + (gw - 1) * cellGap
  const pieceH = gh * cell + (gh - 1) * cellGap
  return {
    subGrids,
    gw,
    gh,
    cell,
    cellGap,
    pieceGap,
    rowGap,
    labelH,
    perRow,
    rows,
    pieceW,
    pieceH,
    width: perRow * pieceW + (perRow - 1) * pieceGap,
    height: rows * (pieceH + labelH) + (rows - 1) * rowGap,
  }
}

interface PiecesBoardProps {
  n: number
  groups: number
  dims: number
  lit: boolean
  litPieces: number
  peel: 0 | 1 | 2
  pieceLabel: (i: number) => string
  label: string
  reduce: boolean
}

/**
 * The board for every beat after the cube is opened. Cells that survive the peel
 * are the asked class; cells on the painted border shrink and fade as the peel
 * happens, which is what makes n − 2 visible instead of asserted.
 */
function PiecesBoard({
  n,
  groups,
  dims,
  lit,
  litPieces,
  peel,
  pieceLabel,
  label,
  reduce,
}: PiecesBoardProps) {
  const L = useMemo(() => piecesLayout(n, groups, dims), [n, groups, dims])
  const pad = 7
  const { w, h } = fitBox(L.width + pad * 2, L.height + pad * 2, BOARD_W + 12, BOARD_H)
  const step = L.cell + L.cellGap
  const rx = Math.min(3, L.cell / 4)
  const fontSize = Math.max(7.5, Math.min(11, L.cell * 0.5))
  // Inside a layer of the whole cube only the border cells were reached by the
  // paint; a face, an edge and a corner sit on the skin entirely, so every one
  // of their cells is painted and the border is just the part we throw away.
  const wholeCube = dims >= 3
  const shrink = peel === 0 ? 1 : peel === 1 ? 0.56 : 0.3
  // For the whole cube the drawn pieces are its n layers, so all of them light up.
  const litCount = dims >= 3 ? L.subGrids : litPieces

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${L.width + pad * 2} ${L.height + pad * 2}`}
      width={w}
      height={h}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: L.subGrids }, (_, i) => {
        const col = i % L.perRow
        const row = Math.floor(i / L.perRow)
        const x0 = col * (L.pieceW + L.pieceGap)
        const y0 = row * (L.pieceH + L.labelH + L.rowGap)
        const pieceLit = lit && i < litCount
        return (
          <motion.g
            key={i}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : Math.min(i, 6) * 0.05 }}
          >
            <rect
              x={x0 - 4}
              y={y0 - 4}
              width={L.pieceW + 8}
              height={L.pieceH + 8}
              rx={6}
              fill={PANEL}
              stroke={PANEL_LINE}
              strokeWidth={1.4}
            />
            {Array.from({ length: L.gh }, (_, r) =>
              Array.from({ length: L.gw }, (_, c) => {
                const border = isPeelCell(n, dims, i, c, r)
                // Did the paint reach this cell at all? Inside the whole cube only
                // the skin did; a face / edge / corner piece is all skin.
                const painted = wholeCube ? border : true
                const gone = border && peel >= 1
                const fill = !border && pieceLit ? GREEN : gone ? GONE_FILL : painted ? PAINT_SOFT : CLEAN_FILL
                const stroke = !border && pieceLit ? GREEN_INK : gone ? GONE_LINE : painted ? PAINT_LINE : CLEAN_LINE
                // The peel is a shrink, not a repaint: border cells visibly pull
                // back and fade, so what is left over is what the child counted.
                const scale = border ? shrink : 1
                const opacity = border && peel === 2 ? 0.16 : 1
                return (
                  <motion.rect
                    key={`${r}-${c}`}
                    x={x0 + c * step}
                    y={y0 + r * step}
                    width={L.cell}
                    height={L.cell}
                    rx={rx}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={!border && pieceLit ? 1.4 : 1}
                    initial={false}
                    // Animated only — the plain fill / stroke / size attributes
                    // above stay as the no-JS (and server-rendered) fallback, so
                    // nothing here fights the transition mid-peel.
                    animate={{ scale, opacity, fill, stroke }}
                    transition={{ duration: reduce ? 0 : 0.4 }}
                  />
                )
              }),
            )}
            <text
              x={x0 + L.pieceW / 2}
              y={y0 + L.pieceH + L.labelH - 3}
              textAnchor="middle"
              fontSize={fontSize}
              fontWeight="700"
              fill={MUTED_TEXT}
              style={{ userSelect: 'none' }}
            >
              {pieceLabel(i)}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

interface LegendItem {
  key: string
  fill: string
  line: string
  text: string
}

/** Tiny colour key, so orange / white / grey / green never need explaining in words. */
function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex min-h-[0.875rem] flex-wrap items-center justify-center gap-x-3 gap-y-1">
      {items.map((it) => (
        <span
          key={it.key}
          className="flex items-center gap-1 font-display text-[0.625rem] font-bold"
          style={{ color: MUTED_TEXT }}
        >
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-[0.1875rem]"
            style={{ background: it.fill, border: `1px solid ${it.line}` }}
            aria-hidden
          />
          {it.text}
        </span>
      ))}
    </div>
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
  const { n, k, m, total, answer, formula } = story
  const faceWord = T(k === 1 ? 'face' : 'faces', 'sisi')

  const pieceLabel = (i: number) => {
    if (beat.dims >= 3) return `${T('Layer', 'Lapis')} ${i + 1}`
    if (beat.dims === 2) return `${T('Face', 'Sisi')} ${i + 1}`
    if (beat.dims === 1) return String(i + 1)
    return i < 4 ? `${T('Top', 'Atas')} ${i + 1}` : `${T('Bottom', 'Bawah')} ${i - 3}`
  }

  const legend: LegendItem[] = []
  if (beat.view === 'solid' || beat.peel === 0) {
    legend.push({ key: 'paint', fill: PAINT_SOFT, line: PAINT_LINE, text: T('painted', 'kena cat') })
  }
  if (beat.view === 'pieces' && beat.dims >= 3 && beat.peel === 0 && !beat.lit) {
    legend.push({ key: 'clean', fill: CLEAN_FILL, line: CLEAN_LINE, text: T('no paint', 'tanpa cat') })
  }
  if (beat.peel >= 1) {
    legend.push({ key: 'gone', fill: GONE_FILL, line: GONE_LINE, text: T('peeled off', 'dibuang') })
  }
  if (beat.lit) {
    legend.push({ key: 'target', fill: GREEN, line: GREEN_INK, text: T('what we want', 'yang dicari') })
  }

  const ariaLabel =
    k === 3
      ? T(
          `A ${n}×${n}×${n} cube is painted all over and cut into ${total} small cubes. The ones with 3 painted faces are exactly its corners: 4 on top and 4 underneath, so ${formula} = ${answer} cubes.`,
          `Kubus ${n}×${n}×${n} dicat seluruhnya lalu dipotong jadi ${total} kubus kecil. Yang kena cat 3 sisi tepat kubus di sudut: 4 di atas dan 4 di bawah, jadi ${formula} = ${answer} kubus.`,
        )
      : T(
          `A ${n}×${n}×${n} cube is painted all over and cut into ${total} small cubes. The ones with exactly ${k} painted ${faceWord} sit ${
            k === 2 ? 'along its 12 edges' : k === 1 ? 'in the middle of its 6 faces' : 'inside it'
          }; peeling the painted border off leaves ${n} − 2 = ${m} along each direction, so ${formula} = ${answer} cubes.`,
          `Kubus ${n}×${n}×${n} dicat seluruhnya lalu dipotong jadi ${total} kubus kecil. Yang kena cat tepat ${k} sisi ada ${
            k === 2 ? 'di sepanjang 12 rusuknya' : k === 1 ? 'di tengah 6 sisinya' : 'di dalamnya'
          }; setelah kulit bercatnya dibuang tersisa ${n} − 2 = ${m} ke tiap arah, jadi ${formula} = ${answer} kubus.`,
        )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* what we are hunting for — named once, then never left */}
        <div
          className="rounded-lg px-3 py-1 text-center font-display text-[0.8125rem] font-extrabold"
          style={{ background: '#E1EFFB', color: BLUE }}
        >
          {k === 0
            ? T('Find: cubes with no paint at all', 'Cari: kubus yang tidak kena cat')
            : T(`Find: cubes with exactly ${k} painted ${faceWord}`, `Cari: kubus dengan tepat ${k} sisi tercat`)}
        </div>

        {/* board — the painted cube, then the pieces the asked class lives on */}
        <div className="flex h-[11.75rem] w-full items-center justify-center">
          {beat.view === 'solid' ? (
            <motion.div
              key={`solid-${beat.lit ? 'lit' : 'plain'}`}
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.35 }}
            >
              <SolidCube
                n={n}
                litFaces={beat.lit ? k : null}
                label={
                  beat.lit
                    ? T(
                        `The ${n}×${n}×${n} cube with every cube that has ${k} painted ${faceWord} picked out.`,
                        `Kubus ${n}×${n}×${n} dengan semua kubus kecil yang kena cat ${k} sisi ditandai.`,
                      )
                    : T(
                        `Solid ${n}×${n}×${n} cube, painted on every outside face.`,
                        `Kubus utuh ${n}×${n}×${n}, dicat di semua sisi luar.`,
                      )
                }
              />
            </motion.div>
          ) : (
            <motion.div
              key={`pieces-${beat.dims}-${beat.groups}`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.3 }}
            >
              <PiecesBoard
                n={n}
                groups={beat.groups}
                dims={beat.dims}
                lit={beat.lit}
                litPieces={beat.litPieces}
                peel={beat.peel}
                pieceLabel={pieceLabel}
                reduce={reduce}
                label={
                  beat.dims >= 3
                    ? T(
                        `The cube cut into ${n} layers, ${n} by ${n} small cubes each.`,
                        `Kubus dipotong jadi ${n} lapis, tiap lapis ${n} kali ${n} kubus kecil.`,
                      )
                    : beat.dims === 2
                      ? T(
                          `The cube's 6 faces, each ${n} by ${n} small cubes.`,
                          `6 sisi kubus, tiap sisi ${n} kali ${n} kubus kecil.`,
                        )
                      : beat.dims === 1
                        ? T(
                            `The cube's 12 edges, each a strip of ${n} small cubes.`,
                            `12 rusuk kubus, tiap rusuk sederet ${n} kubus kecil.`,
                          )
                        : T('The 8 corner cubes, 4 on top and 4 underneath.', '8 kubus sudut, 4 di atas dan 4 di bawah.')
                }
              />
            </motion.div>
          )}
        </div>

        <Legend items={legend} />

        {/* the arithmetic, only ever shown once the board has earned it */}
        <div className="flex min-h-[1.5rem] items-center justify-center">
          {beat.derivation ? (
            <motion.div
              key={`deriv-${index}`}
              className={`font-display font-black tabular-nums ${beat.result ? 'text-base' : 'text-sm'}`}
              style={{ color: beat.result ? GREEN_INK : BLUE }}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.3 }}
            >
              {beat.derivation}
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
