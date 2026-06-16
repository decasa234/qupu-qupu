import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { buildTangram24Steps } from './tangram24G2Steps'
import {
  Tangram24G2Illustration,
  TANGRAM24_GLYPH,
  TANGRAM24_PIECES,
  type Tangram24Label,
} from './Tangram24G2Illustration'

// WMI-24F2A-Q13 (HARD, tangram). The five answer figures spell WMI24; the
// question asks which has the MOST right angles. This post-answer explainer
// shows the stem target, then walks the five option figures one per beat,
// counting each figure's square corners and tracking a running leader, before
// crowning M (choice B) on the final beat.

// Palette echoes the static figure (qupu tokens, as hex constants).
const INK = '#1F2937' // fill-qupu-ink
const CREAM = '#FFF2DF' // fill-qupu-cream
const ORANGE = '#f0853a' // qupu-brand-orange
const SHELL = '#FFF9F4' // qupu-shell
const PEACH = '#FFD3B1' // qupu-peach
const BRAND_BLUE = '#30598A' // qupu-brand-blue
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const MUTED = '#9aa3b2'

type Pt = [number, number]
const VISIT_ORDER: Tangram24Label[] = ['A', 'B', 'C', 'D', 'E']

function ptsToString(pts: Pt[], s: number, ox: number, oy: number): string {
  return pts.map(([x, y]) => `${ox + x * s},${oy + y * s}`).join(' ')
}

// A right angle marked as a tiny square nestled into a polygon corner. We don't
// try to compute true geometry — for the kid-facing tally we drop a fixed set
// of corner ticks per figure that match the captioned count, animating them in.
const CORNER_TICKS: Record<Tangram24Label, Pt[]> = {
  // W — only the two flat tops are square corners.
  A: [
    [0.4, 1.4],
    [9.6, 1.4],
  ],
  // M — the two upright posts: four square corners each (8 total).
  B: [
    [0.4, 1.4],
    [1.8, 1.4],
    [0.4, 8.6],
    [1.8, 8.6],
    [8.2, 1.4],
    [9.6, 1.4],
    [8.2, 8.6],
    [9.6, 8.6],
  ],
  // I — top bar (2) + bottom bar (2) + the stem shoulders (2) = 6.
  C: [
    [2.4, 1.4],
    [7.6, 1.4],
    [4.2, 6.8],
    [5.8, 6.8],
    [2.4, 8.6],
    [7.6, 8.6],
  ],
  // 2 — the two flat bars give four square corners.
  D: [
    [1.9, 1.4],
    [8.1, 1.4],
    [1.9, 8.6],
    [8.1, 8.6],
  ],
  // 4 — the upright stem + crossbar give four square corners.
  E: [
    [6.9, 1.4],
    [8.1, 1.4],
    [6.9, 8.6],
    [8.1, 8.6],
  ],
}

// One option figure drawn as a tangram glyph, with optional corner ticks fading
// in to mark its right angles. Recolors green when it is the crowned winner.
function GlyphFigure({
  label,
  active,
  showTicks,
  win,
  ticksUpTo,
  size,
}: {
  label: Tangram24Label
  active: boolean
  showTicks: boolean
  win: boolean
  /** How many corner ticks to reveal (animated count-up). */
  ticksUpTo: number
  size: number
}) {
  const pieces = TANGRAM24_PIECES[label]
  const ticks = CORNER_TICKS[label]
  const PAD = 0.8
  const S = size / (10 + PAD * 2)
  const stroke = win ? GREEN : active ? ORANGE : '#cbb8a3'
  const fill = win ? '#ECFDF5' : active ? CREAM : '#FBF4EC'
  const tickSize = 0.95 * S

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      style={{ display: 'block' }}
      role="presentation"
    >
      {pieces.map((piece, i) => (
        <polygon
          key={i}
          points={ptsToString(piece, S, PAD * S, PAD * S)}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}
      {showTicks &&
        ticks.slice(0, ticksUpTo).map(([x, y], i) => {
          const cx = PAD * S + x * S
          const cy = PAD * S + y * S
          return (
            <motion.rect
              key={i}
              x={cx - tickSize / 2}
              y={cy - tickSize / 2}
              width={tickSize}
              height={tickSize}
              rx={1.2}
              fill="none"
              stroke={win ? GREEN_INK : BRAND_BLUE}
              strokeWidth={1.6}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22, delay: i * 0.06 }}
            />
          )
        })}
    </svg>
  )
}

// Verdict badge — a green check on the crowned winner.
function WinBadge() {
  return (
    <motion.span
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="ml-1 inline-flex"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={22} height={22}>
        <circle cx={12} cy={12} r={11} fill="#ECFDF5" stroke={GREEN} strokeWidth={2} />
        <path
          d="M7 12.5 L10.5 16 L17 8.5"
          fill="none"
          stroke={GREEN}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  )
}

export default function Tangram24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTangram24Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    `Strategy: count the square corners (right angles) in each tangram figure W, M, I, 2, 4. M has the most, so the answer is ${story.answer}.`,
    `Strategi: hitung sudut persegi (siku-siku) di tiap gambar tangram W, M, I, 2, 4. M punya yang terbanyak, jadi jawabannya ${story.answer}.`,
  )

  // Per-figure visual state for the current beat.
  const isActive = (lbl: Tangram24Label) => beat.label === lbl
  const isWin = (lbl: Tangram24Label) => beat.result && beat.label === lbl
  const isLeader = (lbl: Tangram24Label) => beat.leader === lbl

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Stem target reminder — the printed tangram the figures are built from. */}
        <div className="flex items-center gap-2">
          <div className="font-display text-[11px] font-extrabold" style={{ color: BRAND_BLUE }}>
            {T('The tangram pieces', 'Kepingan tangram')}
          </div>
        </div>
        <div className="-my-1 scale-[0.62]">
          <Tangram24G2Illustration />
        </div>

        {/* The five option figures spelling WMI24, one highlighted per beat. */}
        <div className="grid grid-cols-5 place-items-center gap-x-1">
          {VISIT_ORDER.map((lbl) => {
            const active = isActive(lbl)
            const win = isWin(lbl)
            const leader = isLeader(lbl)
            return (
              <motion.div
                key={lbl}
                className="flex flex-col items-center"
                animate={{ scale: active ? 1.1 : 1, y: active ? -3 : 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              >
                <div
                  className="rounded-lg border-2 p-0.5"
                  style={{
                    borderColor: win ? GREEN : active ? ORANGE : leader ? '#f6c177' : 'transparent',
                    background: win ? '#ECFDF5' : 'transparent',
                  }}
                >
                  <GlyphFigure
                    label={lbl}
                    active={active || win}
                    showTicks={active || win}
                    win={win}
                    ticksUpTo={active || win ? story.counts[lbl] : 0}
                    size={56}
                  />
                </div>
                <div
                  className="font-display text-[10px] font-extrabold"
                  style={{ color: win ? GREEN_INK : active ? BRAND_BLUE : MUTED }}
                >
                  {lbl}. {TANGRAM24_GLYPH[lbl]}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Running right-angle tally for the active figure. */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          {beat.rightAngles != null && beat.label != null ? (
            <motion.div
              key={`${beat.label}-${index}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center font-display text-xl font-black tabular-nums"
            >
              <span style={{ color: beat.result ? GREEN_INK : BRAND_BLUE }}>
                {TANGRAM24_GLYPH[beat.label]}
              </span>
              <span style={{ color: MUTED }}>:&nbsp;</span>
              <span style={{ color: beat.result ? GREEN_INK : INK }}>
                {beat.rightAngles}
              </span>
              <span className="ml-1 font-display text-xs font-bold" style={{ color: MUTED }}>
                {T('square corners', 'sudut persegi')}
              </span>
              {beat.result && <WinBadge />}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-sm font-extrabold"
              style={{ color: BRAND_BLUE }}
            >
              {T('Count square corners in each figure', 'Hitung sudut persegi di tiap gambar')}
            </motion.div>
          )}
        </div>

        {/* Caption box. */}
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
