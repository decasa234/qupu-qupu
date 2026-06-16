import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  ShapeEqFigure,
  SHAPE_EQ_24G2_ROWS,
} from './ShapeEq24G2Illustration'

// ── colour tokens (mirrors fill-qupu-* palette) ──────────────────────────────
const BLUE = '#30598A'
const GREEN = '#10B981'
const AMBER = '#D97706'
const RED = '#DC2626'
const INK = '#1F2937'
const LIGHT_BLUE = '#E1EFFB'
const LIGHT_GREEN = '#D1FAE5'
const LIGHT_AMBER = '#FEF3C7'

// ── beat type ─────────────────────────────────────────────────────────────────

type BeatKind =
  | 'intro'          // show blank equations, introduce the goal
  | 'try-times-A'   // try □×○=12 with 4×3; fill row 1
  | 'fill-plus-A'   // □+○=7 becomes 6+1 (arrangement A)
  | 'fill-minus-A'  // □−○=2 becomes 7−5 (arrangement A)
  | 'unused-A'      // reveal unused number = 2 for arrangement A
  | 'try-times-B'   // try □×○=12 with 6×2; fill row 1
  | 'fill-plus-B'   // □+○=7 becomes 4+3 (arrangement B)
  | 'fill-minus-B'  // □−○=2 still 7−5 (arrangement B)
  | 'unused-B'      // reveal unused number = 1 for arrangement B
  | 'sum'           // both valid → sum unused 2+1=3

interface Beat {
  kind: BeatKind
  /** boxValues for ShapeEqFigure (row index → value) */
  boxValues: Partial<Record<number, number>>
  /** circValues for ShapeEqFigure (row index → value) */
  circValues: Partial<Record<number, number>>
  /** Which rows are "confirmed" (green highlight) */
  confirmedRows: number[]
  /** Currently highlighted row index (-1 for none) */
  activeRow: number
  /** Badge text to show (null = hide) */
  badge: string | null
  /** Badge is success (green) or error (red) or info (blue) */
  badgeKind: 'success' | 'reject' | 'info' | null
  caption: string
  hold: number
}

// ── storyboard builder ────────────────────────────────────────────────────────

function buildSteps(lang: 'en' | 'id'): Beat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  return [
    // 0 — intro
    {
      kind: 'intro',
      boxValues: {},
      circValues: {},
      confirmedRows: [],
      activeRow: -1,
      badge: null,
      badgeKind: null,
      caption: t(
        'Fill 1–7 (no repeats) so □ > ○ in each equation. Which number is never used?',
        'Isi 1–7 (tanpa ulang) agar □ > ○ di setiap persamaan. Bilangan mana yang tidak terpakai?',
      ),
      hold: 2600,
    },
    // 1 — start with ×=12; try 4×3
    {
      kind: 'try-times-A',
      boxValues: { 1: 4 },
      circValues: { 1: 3 },
      confirmedRows: [],
      activeRow: 1,
      badge: t('4 × 3 = 12 ✓', '4 × 3 = 12 ✓'),
      badgeKind: 'info',
      caption: t(
        '× = 12 has two pairs: 4×3 or 6×2. Try 4×3 first.',
        '× = 12 punya dua pasang: 4×3 atau 6×2. Coba 4×3 dulu.',
      ),
      hold: 2200,
    },
    // 2 — fill + row for arrangement A: 6+1=7
    {
      kind: 'fill-plus-A',
      boxValues: { 0: 6, 1: 4 },
      circValues: { 0: 1, 1: 3 },
      confirmedRows: [1],
      activeRow: 0,
      badge: t('6 + 1 = 7 ✓', '6 + 1 = 7 ✓'),
      badgeKind: 'info',
      caption: t(
        '4 and 3 are used. Remaining: 1,2,5,6,7. For + = 7: 6+1=7. ✓',
        '4 dan 3 sudah terpakai. Sisa: 1,2,5,6,7. Untuk + = 7: 6+1=7. ✓',
      ),
      hold: 2200,
    },
    // 3 — fill − row for arrangement A: 7−5=2
    {
      kind: 'fill-minus-A',
      boxValues: { 0: 6, 1: 4, 2: 7 },
      circValues: { 0: 1, 1: 3, 2: 5 },
      confirmedRows: [0, 1],
      activeRow: 2,
      badge: t('7 − 5 = 2 ✓', '7 − 5 = 2 ✓'),
      badgeKind: 'info',
      caption: t(
        'Remaining: 2,5,7. For − = 2: 7−5=2. ✓',
        'Sisa: 2,5,7. Untuk − = 2: 7−5=2. ✓',
      ),
      hold: 2200,
    },
    // 4 — show unused = 2 for arrangement A
    {
      kind: 'unused-A',
      boxValues: { 0: 6, 1: 4, 2: 7 },
      circValues: { 0: 1, 1: 3, 2: 5 },
      confirmedRows: [0, 1, 2],
      activeRow: -1,
      badge: t('Unused: 2', 'Tidak terpakai: 2'),
      badgeKind: 'info',
      caption: t(
        'Arrangement A uses 1,3,4,5,6,7 → unused = 2.',
        'Susunan A memakai 1,3,4,5,6,7 → tidak terpakai = 2.',
      ),
      hold: 2400,
    },
    // 5 — now try 6×2 (arrangement B), clear previous fills
    {
      kind: 'try-times-B',
      boxValues: { 1: 6 },
      circValues: { 1: 2 },
      confirmedRows: [],
      activeRow: 1,
      badge: t('6 × 2 = 12 ✓', '6 × 2 = 12 ✓'),
      badgeKind: 'info',
      caption: t(
        'Now try the other pair: 6×2=12. Fresh arrangement!',
        'Sekarang coba pasang lain: 6×2=12. Susunan baru!',
      ),
      hold: 2200,
    },
    // 6 — fill + row for arrangement B: 4+3=7
    {
      kind: 'fill-plus-B',
      boxValues: { 0: 4, 1: 6 },
      circValues: { 0: 3, 1: 2 },
      confirmedRows: [1],
      activeRow: 0,
      badge: t('4 + 3 = 7 ✓', '4 + 3 = 7 ✓'),
      badgeKind: 'info',
      caption: t(
        '6 and 2 used. Remaining: 1,3,4,5,7. For + = 7: 4+3=7. ✓',
        '6 dan 2 terpakai. Sisa: 1,3,4,5,7. Untuk + = 7: 4+3=7. ✓',
      ),
      hold: 2200,
    },
    // 7 — fill − row for arrangement B: 7−5=2
    {
      kind: 'fill-minus-B',
      boxValues: { 0: 4, 1: 6, 2: 7 },
      circValues: { 0: 3, 1: 2, 2: 5 },
      confirmedRows: [0, 1],
      activeRow: 2,
      badge: t('7 − 5 = 2 ✓', '7 − 5 = 2 ✓'),
      badgeKind: 'info',
      caption: t(
        'Remaining: 1,5,7. For − = 2: 7−5=2. ✓',
        'Sisa: 1,5,7. Untuk − = 2: 7−5=2. ✓',
      ),
      hold: 2200,
    },
    // 8 — show unused = 1 for arrangement B
    {
      kind: 'unused-B',
      boxValues: { 0: 4, 1: 6, 2: 7 },
      circValues: { 0: 3, 1: 2, 2: 5 },
      confirmedRows: [0, 1, 2],
      activeRow: -1,
      badge: t('Unused: 1', 'Tidak terpakai: 1'),
      badgeKind: 'info',
      caption: t(
        'Arrangement B uses 2,3,4,5,6,7 → unused = 1.',
        'Susunan B memakai 2,3,4,5,6,7 → tidak terpakai = 1.',
      ),
      hold: 2400,
    },
    // 9 — final: two valid arrangements → sum unused = 2+1 = 3
    {
      kind: 'sum',
      boxValues: { 0: 4, 1: 6, 2: 7 },
      circValues: { 0: 3, 1: 2, 2: 5 },
      confirmedRows: [0, 1, 2],
      activeRow: -1,
      badge: t('2 + 1 = 3', '2 + 1 = 3'),
      badgeKind: 'success',
      caption: t(
        'Both arrangements work! Sum of unused: 2 + 1 = 3.',
        'Kedua susunan sah! Jumlah bilangan tidak terpakai: 2 + 1 = 3.',
      ),
      hold: 0,
    },
  ]
}

// ── row highlight overlay (SVG rect behind each equation row) ─────────────────

const VW = 280
const ROW_H = 72
const PAD_T = 18
const TOTAL_H = PAD_T + SHAPE_EQ_24G2_ROWS.length * ROW_H + 8

function RowHighlights({
  confirmedRows,
  activeRow,
}: {
  confirmedRows: number[]
  activeRow: number
}) {
  return (
    <>
      {confirmedRows.map((r) => (
        <rect
          key={`conf-${r}`}
          x={2}
          y={PAD_T + r * ROW_H + 2}
          width={VW - 4}
          height={ROW_H - 4}
          rx={8}
          fill={LIGHT_GREEN}
          stroke={GREEN}
          strokeWidth={1.5}
          opacity={0.7}
        />
      ))}
      {activeRow >= 0 && !confirmedRows.includes(activeRow) && (
        <rect
          x={2}
          y={PAD_T + activeRow * ROW_H + 2}
          width={VW - 4}
          height={ROW_H - 4}
          rx={8}
          fill={LIGHT_AMBER}
          stroke={AMBER}
          strokeWidth={1.5}
          opacity={0.7}
        />
      )}
    </>
  )
}

// ── pool strip (shows the 7 numbers with used ones crossed out) ───────────────

const POOL = [1, 2, 3, 4, 5, 6, 7] as const

function PoolStrip({
  usedNumbers,
  unusedHighlight,
}: {
  usedNumbers: number[]
  unusedHighlight: number | null
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      {POOL.map((n) => {
        const used = usedNumbers.includes(n)
        const highlight = unusedHighlight === n
        return (
          <div
            key={n}
            className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold font-display"
            style={{
              background: highlight
                ? LIGHT_GREEN
                : used
                  ? '#F3F4F6'
                  : LIGHT_BLUE,
              color: highlight ? '#065F46' : used ? '#9CA3AF' : INK,
              border: `2px solid ${highlight ? GREEN : used ? '#D1D5DB' : BLUE}`,
              textDecoration: used && !highlight ? 'line-through' : 'none',
              opacity: used && !highlight ? 0.5 : 1,
            }}
          >
            {n}
          </div>
        )
      })}
    </div>
  )
}

// ── derive which numbers are currently placed ─────────────────────────────────

function usedFromBeat(beat: Beat): number[] {
  const used: number[] = []
  for (let i = 0; i < 3; i++) {
    const bv = beat.boxValues[i]
    const cv = beat.circValues[i]
    if (bv != null) used.push(bv)
    if (cv != null) used.push(cv)
  }
  return used
}

function unusedHighlightFromBeat(beat: Beat): number | null {
  if (beat.kind === 'unused-A') return 2
  if (beat.kind === 'unused-B') return 1
  return null
}

// ── main component ────────────────────────────────────────────────────────────

export default function ShapeEq24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildSteps(lang), [lang])

  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })

  const beat = steps[index] ?? steps[steps.length - 1]
  const usedNums = usedFromBeat(beat)
  const unusedHL = unusedHighlightFromBeat(beat)

  const isFinal = beat.kind === 'sum'
  const badgeBg = isFinal ? LIGHT_GREEN : beat.badgeKind === 'reject' ? '#FEE2E2' : LIGHT_AMBER
  const badgeBorder = isFinal ? GREEN : beat.badgeKind === 'reject' ? RED : AMBER
  const badgeText = isFinal ? '#065F46' : beat.badgeKind === 'reject' ? '#991B1B' : '#92400E'

  const ariaLabel = t(
    'Shape equations: start with the product (×=12 gives 4×3 or 6×2), then fit the other numbers to + and −. Both arrangements work; sum the two unused numbers: 2+1=3.',
    'Persamaan bentuk: mulai dari perkalian (×=12 memberi 4×3 atau 6×2), lalu cocokkan bilangan lain ke + dan −. Kedua susunan sah; jumlahkan dua bilangan yang tidak terpakai: 2+1=3.',
  )

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Pool strip */}
        <PoolStrip usedNumbers={usedNums} unusedHighlight={unusedHL} />

        {/* Equations figure with highlight overlay */}
        <div className="relative w-full" style={{ maxWidth: 280, margin: '0 auto' }}>
          {/* Background highlight rects rendered before the figure SVG so they
              appear behind the shapes. We do it via an absolute-positioned SVG. */}
          <svg
            viewBox={`0 0 ${VW} ${TOTAL_H}`}
            width="100%"
            style={{ position: 'absolute', top: 0, left: 0, maxWidth: 280 }}
            aria-hidden="true"
          >
            <RowHighlights
              confirmedRows={beat.confirmedRows}
              activeRow={beat.activeRow}
            />
          </svg>
          {/* The figure itself (renders on top of highlights) */}
          <ShapeEqFigure
            boxValues={beat.boxValues}
            circValues={beat.circValues}
          />
        </div>

        {/* Badge */}
        {beat.badge != null && (
          <motion.div
            key={beat.badge}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="rounded-full px-4 py-1 font-display text-sm font-extrabold"
            style={{
              background: badgeBg,
              border: `2px solid ${badgeBorder}`,
              color: badgeText,
            }}
          >
            {beat.badge}
          </motion.div>
        )}

        {/* Final answer callout */}
        {isFinal && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="flex items-center gap-2 rounded-2xl px-5 py-2"
            style={{
              background: LIGHT_GREEN,
              border: `2.5px solid ${GREEN}`,
            }}
          >
            <span className="font-display text-2xl font-black" style={{ color: '#065F46' }}>
              {t('Answer: 3', 'Jawaban: 3')}
            </span>
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-bold"
          style={
            isFinal
              ? { background: LIGHT_GREEN, borderColor: GREEN, color: '#065F46' }
              : { background: LIGHT_BLUE, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
