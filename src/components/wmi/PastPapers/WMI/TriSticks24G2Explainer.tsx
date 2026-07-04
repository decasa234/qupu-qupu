/**
 * WMI-24F2A-Q19 — post-answer explainer.
 *
 * Strategy: count all 8 triangles one per beat (6 small unit triangles + 2 big
 * size-2 triangles — the figure has only 15 sticks, the middle-left horizontal
 * is missing, so two unit triangles do NOT exist), then show the 4 shared
 * diagonal sticks whose removal destroys every triangle, then land on 8 + 4 = 12.
 *
 * SSR-safe, deterministic, bilingual (en / id).
 * No Math.random, no Date, no side effects outside useBeatControl.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TriSticksMatchFigure,
  STICK_EDGES,
  TRI_NODES,
} from './TriSticks24G2Illustration'

// ─── colour tokens (echo the qupu palette) ───────────────────────────────────
const BRAND_BLUE   = '#30598A'
const GREEN        = '#10B981'
const GREEN_INK    = '#065F46'
const ORANGE       = '#E05A00'  // highlight = same as TriSticksMatchFigure hiSet
const AMBER        = '#D97706'
const SHELL        = '#FFF9F4'
const PEACH        = '#FFD3B1'

// ─── geometry helpers ─────────────────────────────────────────────────────────
// We use the same 3×3 grid from the illustration.
// Edges as canonical string keys (matches illustration's canonKey):
type EdgeIdx = [[number, number], [number, number]]

function canonKey([[r0, c0], [r1, c1]]: EdgeIdx): string {
  return r0 < r1 || (r0 === r1 && c0 < c1)
    ? `${r0},${c0}-${r1},${c1}`
    : `${r1},${c1}-${r0},${c0}`
}

// The 4 shared "left-down" diagonals: (r,c) → (r+1,c+1) for r=0,1 c=0,1.
// Removing all 4 destroys every one of the 8 triangles (6 unit + 2 big);
// brute force confirms no 3 sticks suffice, so 4 is the minimum.
const DIAGONAL_STICKS: EdgeIdx[] = [
  [[0, 0], [1, 1]],
  [[0, 1], [1, 2]],
  [[1, 0], [2, 1]],
  [[1, 1], [2, 2]],
]

// 8 unit triangles.
// "Down" in grid index = (r,c),(r,c+1),(r+1,c+1) → apex points DOWN in screen
// "Up"  in grid index = (r+1,c),(r+1,c+1),(r,c+1) → apex points UP in screen
// Each triangle is stored as its 3 edge pairs.
function triEdges(
  [r0, c0]: [number, number],
  [r1, c1]: [number, number],
  [r2, c2]: [number, number],
): EdgeIdx[] {
  return [
    [[r0, c0], [r1, c1]] as EdgeIdx,
    [[r1, c1], [r2, c2]] as EdgeIdx,
    [[r0, c0], [r2, c2]] as EdgeIdx,
  ]
}

// The figure has only 15 sticks — edge (1,0)-(1,1) is missing — so the two unit
// triangles that would use it do not exist. The 6 unit triangles that DO exist:
// 3 downward (apex down on screen): (r,c),(r,c+1),(r+1,c+1)
const DOWN_TRIS: EdgeIdx[][] = [
  triEdges([0, 0], [0, 1], [1, 1]),
  triEdges([0, 1], [0, 2], [1, 2]),
  triEdges([1, 1], [1, 2], [2, 2]),
]

// 3 upward (screen) triangles: vertices (r+1,c),(r+1,c+1),(r,c+1)
const UP_TRIS: EdgeIdx[][] = [
  triEdges([1, 1], [1, 2], [0, 2]),
  triEdges([2, 0], [2, 1], [1, 1]),
  triEdges([2, 1], [2, 2], [1, 2]),
]

// 2 size-2 triangles, each drawn from six unit sticks:
//   big ▽ on corners (0,0),(0,2),(2,2)  — top row + right side + the main diagonal
//   big △ on corners (0,0),(2,0),(2,2)  — left side + bottom row + the main diagonal
const BIG_TRIS: EdgeIdx[][] = [
  [
    [[0, 0], [0, 1]], [[0, 1], [0, 2]],
    [[0, 2], [1, 2]], [[1, 2], [2, 2]],
    [[0, 0], [1, 1]], [[1, 1], [2, 2]],
  ],
  [
    [[0, 0], [1, 0]], [[1, 0], [2, 0]],
    [[2, 0], [2, 1]], [[2, 1], [2, 2]],
    [[0, 0], [1, 1]], [[1, 1], [2, 2]],
  ],
]

const ALL_TRIS: EdgeIdx[][] = [...DOWN_TRIS, ...UP_TRIS, ...BIG_TRIS]

// ─── centroid of a triangle (for the label badge) ─────────────────────────────
function triCentroid(edges: EdgeIdx[]): { x: number; y: number } {
  // Collect unique node pairs
  const seen = new Set<string>()
  const pts: { x: number; y: number }[] = []
  for (const [[r0, c0], [r1, c1]] of edges) {
    const k0 = `${r0},${c0}`
    if (!seen.has(k0)) { seen.add(k0); pts.push(TRI_NODES[r0][c0]) }
    const k1 = `${r1},${c1}`
    if (!seen.has(k1)) { seen.add(k1); pts.push(TRI_NODES[r1][c1]) }
  }
  const x = pts.reduce((s, p) => s + p.x, 0) / pts.length
  const y = pts.reduce((s, p) => s + p.y, 0) / pts.length
  return { x, y }
}

// ─── storyboard ───────────────────────────────────────────────────────────────
interface Beat {
  /** edges to highlight orange */
  hiEdges: EdgeIdx[]
  /** edges to dim */
  dimEdges: EdgeIdx[]
  /** running triangle counter (shown on figure) */
  triCount: number
  /** triangle centroids lit so far (for label overlay) */
  litTris: Array<{ x: number; y: number; n: number }>
  /** sticks-to-remove phase: which diagonals to highlight */
  removeSticks: EdgeIdx[]
  /** number of removal sticks revealed so far */
  stickCount: number
  /** true on the final answer beat */
  result: boolean
  /** caption text */
  caption: string
  hold: number
}

function buildStory(lang: 'en' | 'id'): { steps: Beat[]; finalIndex: number } {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Beat[] = []

  const blank = (): Omit<Beat, 'caption' | 'hold'> => ({
    hiEdges: [],
    dimEdges: [],
    triCount: 0,
    litTris: [],
    removeSticks: [],
    stickCount: 0,
    result: false,
  })

  // Beat 0 — intro
  steps.push({
    ...blank(),
    caption: t(
      'Count ALL triangles — small ones AND bigger ones!',
      'Hitung SEMUA segitiga — yang kecil maupun yang lebih besar!',
    ),
    hold: 2400,
  })

  // Beats 1–8: count triangles one by one
  const litSoFar: Array<{ x: number; y: number; n: number }> = []
  const hiSoFar: EdgeIdx[] = []

  // All dim edges = everything not yet highlighted
  function dimFor(hiEdgeSet: Set<string>): EdgeIdx[] {
    return STICK_EDGES.filter(e => !hiEdgeSet.has(canonKey(e)))
  }

  for (let i = 0; i < 8; i++) {
    const triLabel = i < 3
      ? t(`small ▽ #${i + 1}`, `▽ kecil #${i + 1}`)
      : i < 6
        ? t(`small △ #${i - 2}`, `△ kecil #${i - 2}`)
        : t(`BIG triangle #${i - 5}`, `segitiga BESAR #${i - 5}`)

    const edges = ALL_TRIS[i]
    for (const e of edges) {
      const key = canonKey(e)
      if (!hiSoFar.find(x => canonKey(x) === key)) {
        hiSoFar.push(e)
      }
    }
    const centroid = triCentroid(edges)
    litSoFar.push({ ...centroid, n: i + 1 })

    steps.push({
      hiEdges: [...edges],            // only this triangle's 3 edges flash
      dimEdges: dimFor(new Set(edges.map(canonKey))),
      triCount: i + 1,
      litTris: litSoFar.map(x => ({ ...x })),
      removeSticks: [],
      stickCount: 0,
      result: false,
      caption: t(
        `${triLabel} — that's ${i + 1} triangle${i + 1 > 1 ? 's' : ''} so far`,
        `${triLabel} — sudah ${i + 1} segitiga`,
      ),
      hold: i === 7 ? 2800 : 1800,
    })
  }

  // Beat 9 — total count confirmed, transition to removal phase
  steps.push({
    hiEdges: [],
    dimEdges: [],
    triCount: 8,
    litTris: litSoFar.map(x => ({ ...x })),
    removeSticks: [],
    stickCount: 0,
    result: false,
    caption: t(
      '8 triangles total! Now: which sticks, when removed, break ALL of them?',
      '8 segitiga! Sekarang: batang mana yang jika diambil menghancurkan semuanya?',
    ),
    hold: 2800,
  })

  // Beats 10–13: reveal each shared diagonal stick one by one
  const removedSoFar: EdgeIdx[] = []
  for (let i = 0; i < 4; i++) {
    removedSoFar.push(DIAGONAL_STICKS[i])
    steps.push({
      hiEdges: [DIAGONAL_STICKS[i]],
      dimEdges: [],
      triCount: 8,
      litTris: [],
      removeSticks: removedSoFar.map(x => [...x] as EdgeIdx),
      stickCount: i + 1,
      result: false,
      caption: t(
        `Remove stick ${i + 1}: every triangle that used it is broken!`,
        `Ambil batang ${i + 1}: semua segitiga yang memakainya hancur!`,
      ),
      hold: 2100,
    })
  }

  // Beat 14 — final answer
  steps.push({
    hiEdges: [],
    dimEdges: STICK_EDGES.filter(e =>
      !DIAGONAL_STICKS.find(d => canonKey(d) === canonKey(e)),
    ),
    triCount: 8,
    litTris: [],
    removeSticks: DIAGONAL_STICKS,
    stickCount: 4,
    result: true,
    caption: t(
      '8 triangles + 4 sticks to remove = 12',
      '8 segitiga + 4 batang diambil = 12',
    ),
    hold: 0,
  })

  return { steps, finalIndex: steps.length - 1 }
}

// ─── counter badge ─────────────────────────────────────────────────────────────
function CounterBadge({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div
      className="flex flex-col items-center rounded-xl px-3 py-1.5"
      style={{ background: SHELL, border: `2px solid ${accent}` }}
    >
      <span className="font-display text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>
        {label}
      </span>
      <motion.span
        key={value}
        initial={{ scale: 1.35, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="font-display text-2xl font-black tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </motion.span>
    </div>
  )
}

// ─── figure wrapper with number overlays ─────────────────────────────────────
// Renders the TriSticksMatchFigure plus small numbered badges at triangle centroids.
// When removeSticks are active, crosses those sticks out in orange.
function FigureWithOverlays({
  hiEdges,
  dimEdges,
  litTris,
  removeSticks,
}: {
  hiEdges: EdgeIdx[]
  dimEdges: EdgeIdx[]
  litTris: Array<{ x: number; y: number; n: number }>
  removeSticks: EdgeIdx[]
}) {
  // Merge removeSticks into hiEdges for the figure component
  const allHi = [...hiEdges, ...removeSticks]

  return (
    <div className="relative" style={{ display: 'inline-block' }}>
      <TriSticksMatchFigure highlightEdges={allHi} dimEdges={dimEdges} />
      {/* triangle number badges */}
      {litTris.map(({ x, y, n }) => (
        <motion.div
          key={n}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.05 }}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
            background: AMBER,
            color: '#fff',
            fontFamily: '"Baloo 2", sans-serif',
            fontWeight: 900,
            fontSize: 11,
            borderRadius: '50%',
            width: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {n}
        </motion.div>
      ))}
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────
export default function TriSticks24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildStory(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map(s => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Strategy: count all 8 triangles, then remove 4 shared diagonal sticks to destroy them all. Answer: 8 + 4 = 12.',
    'Strategi: hitung 8 segitiga, lalu ambil 4 batang diagonal bersama untuk menghancurkan semuanya. Jawaban: 8 + 4 = 12.',
  )

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="flex min-h-[320px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* phase label */}
        <div
          className="font-display text-xs font-extrabold uppercase tracking-widest"
          style={{ color: beat.stickCount > 0 || beat.result ? ORANGE : BRAND_BLUE }}
        >
          {beat.result
            ? t('Answer', 'Jawaban')
            : beat.stickCount > 0
              ? t('Remove sticks', 'Ambil batang')
              : t('Count triangles', 'Hitung segitiga')}
        </div>

        {/* figure */}
        <div className="flex justify-center">
          <FigureWithOverlays
            hiEdges={beat.hiEdges}
            dimEdges={beat.dimEdges}
            litTris={beat.litTris}
            removeSticks={beat.removeSticks}
          />
        </div>

        {/* counters row */}
        <div className="flex gap-4">
          <CounterBadge
            label={t('Triangles', 'Segitiga')}
            value={beat.triCount}
            accent={beat.triCount === 8 ? GREEN : BRAND_BLUE}
          />
          <CounterBadge
            label={t('Sticks out', 'Batang keluar')}
            value={beat.stickCount}
            accent={beat.stickCount === 4 ? ORANGE : BRAND_BLUE}
          />
          {beat.result && (
            <motion.div
              key="answer"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 18 }}
              className="flex flex-col items-center rounded-xl px-3 py-1.5"
              style={{ background: '#D1FAE5', border: `2px solid ${GREEN}` }}
            >
              <span
                className="font-display text-[10px] font-bold uppercase tracking-wide"
                style={{ color: GREEN_INK }}
              >
                {t('Answer', 'Jawaban')}
              </span>
              <span
                className="font-display text-2xl font-black tabular-nums"
                style={{ color: GREEN_INK }}
              >
                12
              </span>
            </motion.div>
          )}
        </div>

        {/* sum line on final beat */}
        {beat.result && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-lg font-black tabular-nums"
            style={{ color: GREEN_INK }}
          >
            8 + 4 = 12
          </motion.div>
        )}

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
