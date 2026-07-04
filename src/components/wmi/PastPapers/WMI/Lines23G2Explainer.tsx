import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { PATHS23G2, LinePath23G2 } from './Lines23G2Illustration'
import type { PathDef } from './Lines23G2Illustration'

// ── design tokens (echoing the illustration) ──────────────────────────────────
const INK         = '#1F2937'  // qupu-brand-dark — default path stroke
const GRID_LINE   = '#cdc5bc'  // qupu-cream-dark — grid
const ACTIVE      = '#f0853a'  // qupu-brand-orange — highlighted path
const EQUAL_CLR   = '#10B981'  // green — matched pair
const BRAND_BLUE  = '#30598A'  // qupu-brand-blue
const SHELL       = '#FFF9F4'  // qupu-shell — panel bg
const PEACH       = '#FFD3B1'  // qupu-peach — panel border
const GREEN_INK   = '#065F46'  // dark green — final caption

// ── geometry (must match Lines23G2Illustration.tsx) ───────────────────────────
const CELL    = 20
const PAD     = 18
const ZONE_W  = 7
const GRID_H  = 9
const N_ZONES = 5

const VIEW_W = PAD * 2 + N_ZONES * ZONE_W * CELL
const VIEW_H = PAD * 2 + GRID_H * CELL + 26

// ── unit-segment counter (sum of Manhattan distances between consecutive vertices)
function unitSegmentCount(path: PathDef): number {
  let total = 0
  for (let i = 1; i < path.points.length; i++) {
    const [x1, y1] = path.points[i - 1]
    const [x2, y2] = path.points[i]
    total += Math.abs(x2 - x1) + Math.abs(y2 - y1)
  }
  return total
}

// ── storyboard types ──────────────────────────────────────────────────────────
interface LinesBeat {
  /** Which path label is being highlighted; null = no highlight (intro/final). */
  focus: string | null
  /** True only on the final answer beat. */
  result: boolean
  hold: number
  caption: string
}

function buildSteps(lang: 'en' | 'id'): { steps: LinesBeat[]; finalIndex: number } {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Derive counts from PATHS23G2 data
  const counts = PATHS23G2.map((p) => ({ label: p.label, count: unitSegmentCount(p) }))
  // counts: A=15, B=14, C=17, D=17, E=16

  const steps: LinesBeat[] = []

  // Beat 0 — intro
  steps.push({
    focus: null,
    result: false,
    hold: 2800,
    caption: t(
      'Count the unit grid segments along each zig-zag path.',
      'Hitung ruas kotak di sepanjang tiap jalur berliku.',
    ),
  })

  // Beats 1–5 — measure each path
  for (const { label, count } of counts) {
    steps.push({
      focus: label,
      result: false,
      hold: 2100,
      caption: t(
        `Path ${label}: ${count} unit segment${count !== 1 ? 's' : ''}`,
        `Jalur ${label}: ${count} ruas`,
      ),
    })
  }

  // Beat 6 — final answer
  const equalLabels = counts.filter((c) => c.count === counts.find((x) => x.label === 'C')!.count).map((c) => c.label)
  steps.push({
    focus: null,
    result: true,
    hold: 0,
    caption: t(
      `${equalLabels.join(' and ')} both have ${counts.find((c) => c.label === 'C')!.count} segments → same length → answer E`,
      `${equalLabels.join(' dan ')} keduanya ${counts.find((c) => c.label === 'C')!.count} ruas → sama panjang → jawaban E`,
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}

// ── SVG grid helpers (same coordinate system as the illustration) ─────────────
function svgX(zoneIdx: number, col: number): number {
  return PAD + zoneIdx * ZONE_W * CELL + col * CELL
}

// ── Count badge that appears next to a highlighted path ───────────────────────
function CountBadge({ zoneIdx, count, isEqual }: { zoneIdx: number; count: number; isEqual: boolean }) {
  const cx = PAD + zoneIdx * ZONE_W * CELL + 3.5 * CELL
  const cy = PAD + GRID_H * CELL - 8
  const color = isEqual ? EQUAL_CLR : ACTIVE
  return (
    <motion.g
      key={`badge-${zoneIdx}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
    >
      <rect x={cx - 18} y={cy - 11} width={36} height={22} rx={7} fill={color} />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={900}
        fill="#fff"
      >
        {count}
      </text>
    </motion.g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────
export default function Lines23G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Derive counts for rendering (SSR-safe: no random, no Date)
  const counts = useMemo(
    () => PATHS23G2.map((p) => ({ label: p.label, count: unitSegmentCount(p) })),
    [],
  )
  const maxCount = Math.max(...counts.map((c) => c.count)) // 17

  // On the final beat, all equal paths are green; focus drives the active state
  const isFinalBeat = beat.result

  // For the intro beat, show all paths dimmed (no focus)
  // For a focus beat, show the focused path bright, all others dim
  // For the final beat, show the equal-length pair green, others dim
  const equalCount = counts.find((c) => c.label === 'C')!.count // 17

  const pathColor = (label: string): string => {
    if (isFinalBeat) {
      const cnt = counts.find((c) => c.label === label)!.count
      return cnt === equalCount ? EQUAL_CLR : GRID_LINE
    }
    if (beat.focus === null) return INK // intro: all shown normally
    if (label === beat.focus) return ACTIVE
    return GRID_LINE
  }

  const pathWidth = (label: string): number => {
    if (isFinalBeat) {
      const cnt = counts.find((c) => c.label === label)!.count
      return cnt === equalCount ? 4 : 2
    }
    if (beat.focus === null) return 2.5
    return label === beat.focus ? 4 : 2
  }

  // Count badge appears when a path is focused or on the final beat (all counts shown)
  const showBadge = (idx: number, label: string): boolean => {
    if (isFinalBeat) return true
    return label === beat.focus
  }

  const totalW = N_ZONES * ZONE_W * CELL
  const totalH = GRID_H * CELL

  // Running segment count bar (like a progress bar) for the focused path
  const focusedCount = beat.focus ? counts.find((c) => c.label === beat.focus)!.count : null
  const barFillRatio = focusedCount !== null ? focusedCount / maxCount : 0

  const ariaLabel = t(
    'Each zig-zag path is measured by counting its unit grid segments. C and D both have 17 segments, so they are the same length. Answer E.',
    'Tiap jalur berliku diukur dengan menghitung ruasnya. C dan D keduanya 17 ruas, jadi sama panjang. Jawaban E.',
  )

  return (
    <div className="mx-auto w-full max-w-[540px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* ── SVG scene ── */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block' }}
          aria-hidden="true"
        >
          {/* grid vertical lines */}
          {Array.from({ length: N_ZONES * ZONE_W + 1 }, (_, i) => (
            <line
              key={`gv${i}`}
              x1={PAD + i * CELL}
              y1={PAD}
              x2={PAD + i * CELL}
              y2={PAD + totalH}
              stroke={GRID_LINE}
              strokeWidth={0.75}
            />
          ))}
          {/* grid horizontal lines */}
          {Array.from({ length: GRID_H + 1 }, (_, j) => (
            <line
              key={`gh${j}`}
              x1={PAD}
              y1={PAD + j * CELL}
              x2={PAD + totalW}
              y2={PAD + j * CELL}
              stroke={GRID_LINE}
              strokeWidth={0.75}
            />
          ))}

          {/* five paths */}
          {PATHS23G2.map((path, i) => (
            <LinePath23G2
              key={path.label}
              zoneIndex={i}
              path={path}
              stroke={pathColor(path.label)}
              strokeWidth={pathWidth(path.label)}
              showLabel
            />
          ))}

          {/* count badges */}
          {PATHS23G2.map((path, i) =>
            showBadge(i, path.label) ? (
              <CountBadge
                key={`${path.label}-${index}`}
                zoneIdx={i}
                count={counts[i].count}
                isEqual={counts[i].count === equalCount && (isFinalBeat || path.label === beat.focus)}
              />
            ) : null,
          )}

          {/* zone highlight rectangle for the focused path */}
          {beat.focus !== null && !isFinalBeat && (() => {
            const zi = PATHS23G2.findIndex((p) => p.label === beat.focus)
            if (zi < 0) return null
            return (
              <motion.rect
                key={`zone-${beat.focus}`}
                x={PAD + zi * ZONE_W * CELL + 1}
                y={PAD}
                width={ZONE_W * CELL - 2}
                height={GRID_H * CELL}
                rx={6}
                fill={ACTIVE}
                fillOpacity={0.08}
                stroke={ACTIVE}
                strokeWidth={1.5}
                strokeOpacity={0.35}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              />
            )
          })()}

          {/* final beat: equal bracket connecting C and D zones */}
          {isFinalBeat && (() => {
            const cIdx = PATHS23G2.findIndex((p) => p.label === 'C')
            const dIdx = PATHS23G2.findIndex((p) => p.label === 'D')
            const x1 = svgX(cIdx, 3.5)
            const x2 = svgX(dIdx, 3.5)
            const ym = PAD + totalH + 6
            return (
              <motion.g
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                style={{ transformOrigin: `${(x1 + x2) / 2}px ${ym}px` }}
              >
                <line x1={x1} y1={ym} x2={x2} y2={ym} stroke={EQUAL_CLR} strokeWidth={2.5} />
                <circle cx={x1} cy={ym} r={4} fill={EQUAL_CLR} />
                <circle cx={x2} cy={ym} r={4} fill={EQUAL_CLR} />
                <text
                  x={(x1 + x2) / 2}
                  y={ym - 9}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={900}
                  fill={EQUAL_CLR}
                >
                  {t('equal!', 'sama!')}
                </text>
              </motion.g>
            )
          })()}
        </svg>

        {/* ── segment counter bar (shown while measuring a path) ── */}
        {focusedCount !== null && !isFinalBeat && (
          <div className="w-full max-w-[300px]">
            <div
              className="mb-1 flex items-center justify-between font-display text-[11px] font-extrabold"
              style={{ color: BRAND_BLUE }}
            >
              <span>0</span>
              <span style={{ color: ACTIVE }}>
                {t(`Path ${beat.focus}: ${focusedCount} segments`, `Jalur ${beat.focus}: ${focusedCount} ruas`)}
              </span>
              <span>{maxCount}</span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-full" style={{ background: '#E1EFFB', border: `2px solid ${PEACH}` }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: ACTIVE }}
                initial={false}
                animate={{ width: `${barFillRatio * 100}%` }}
                transition={{ type: 'spring', stiffness: 130, damping: 22 }}
              />
            </div>
          </div>
        )}

        {/* ── caption box ── */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: EQUAL_CLR, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
