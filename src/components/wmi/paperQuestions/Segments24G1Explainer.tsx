import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Segments24G1, SEGMENT_PATHS, SEGMENT_IDS, type SegmentId } from './Segments24G1Illustration'
import { buildSegments24G1Steps } from './segments24G1Steps'

// WMI-24F1A-Q3 (2024 Grade 1 Final) — multiple-choice answer = B ("A < B").
//
// Binds to the built Segments24G1 primitive (lit / revealLengths). We do NOT
// redraw the figure: the primitive renders the three panels each beat, and a
// thin transparent overlay SVG (same viewBox + geometry) grows an orange trace
// over the active segment while we count its unit steps.

// Palette echoes the static figure's tokens.
const LIT = '#f0853a' // qupu-brand-orange — the traced segment
const BRAND_BLUE = '#30598a' // qupu-brand-blue — labels / count badges
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const SHELL = '#FFF9F4' // qupu-shell panel
const PEACH = '#FFD3B1' // qupu-peach border

// Layout constants MIRROR the static Segments24G1Illustration so the overlay
// lines up pixel-for-pixel over the rendered figure (UNIT / PANEL_* are private
// there). 4×4 grid, 30px/unit, three panels.
const UNIT = 30
const GRID = 4
const PANEL_PAD = 14
const PANEL_INNER = GRID * UNIT // 120
const PANEL_W = PANEL_INNER + PANEL_PAD * 2 // 148
const LABEL_H = 26
const PANEL_GAP = 16
const PANEL_H = PANEL_INNER + PANEL_PAD * 2 + LABEL_H // 174
const VIEW_W = PANEL_W * 3 + PANEL_GAP * 2 // 476
const VIEW_H = PANEL_H
const RENDER_W = Math.min(300, VIEW_W) // the primitive caps its width at 300

function panelX(id: SegmentId): number {
  return SEGMENT_IDS.indexOf(id) * (PANEL_W + PANEL_GAP)
}

function toPx(id: SegmentId, col: number, row: number): [number, number] {
  return [panelX(id) + PANEL_PAD + col * UNIT, PANEL_PAD + row * UNIT]
}

/** "M…L…" path covering the first `v` vertices of the active segment. */
function partialPath(id: SegmentId, v: number): string {
  const pts = SEGMENT_PATHS[id].slice(0, Math.max(0, v))
  return pts
    .map(([c, r], i) => {
      const [px, py] = toPx(id, c, r)
      return `${i === 0 ? 'M' : 'L'}${px} ${py}`
    })
    .join(' ')
}

export default function Segments24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSegments24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { lengths, answer, answerStatement } = story

  // During tracing, only the active segment is lit; during compare/result all
  // three carry their length badges (via revealLengths on the primitive).
  const lit: SegmentId[] = beat.phase === 'trace' && beat.active ? [beat.active] : []

  const ariaLabel = t(
    `Strategy: count the unit steps in each segment — A = ${lengths.A}, B = ${lengths.B}, C = ${lengths.C}. Since A = C and ${lengths.A} < ${lengths.B}, the true statement is "${answerStatement}" — choice ${answer}.`,
    `Strategi: hitung langkah satuan tiap garis — A = ${lengths.A}, B = ${lengths.B}, C = ${lengths.C}. Karena A = C dan ${lengths.A} < ${lengths.B}, pernyataan benar adalah "${answerStatement}" — pilihan ${answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* The figure + trace overlay share the same box so the orange path registers. */}
        <div className="relative" style={{ width: RENDER_W }}>
          <Segments24G1 lit={lit} revealLengths={beat.revealLengths} />

          {/* trace overlay — grows the orange path over the active segment */}
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width={RENDER_W}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            {beat.phase === 'trace' && beat.active && beat.vertices >= 2 && (
              <motion.path
                key={`trace-${beat.active}-${beat.vertices}`}
                d={partialPath(beat.active, beat.vertices)}
                fill="none"
                stroke={LIT}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.5 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              />
            )}

            {/* drop a dot on the vertex we just reached while tracing */}
            {beat.phase === 'trace' && beat.active && beat.vertices >= 2 && (() => {
              const pts = SEGMENT_PATHS[beat.active]
              const [c, r] = pts[Math.min(beat.vertices, pts.length) - 1]
              const [px, py] = toPx(beat.active, c, r)
              return (
                <motion.circle
                  key={`dot-${beat.active}-${beat.vertices}`}
                  cx={px}
                  cy={py}
                  r={5}
                  fill={LIT}
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )
            })()}
          </svg>

          {/* running unit-step count, floated over the active panel while tracing */}
          {beat.phase === 'trace' && beat.active && (
            <motion.div
              key={`count-${beat.active}-${beat.running}`}
              className="absolute -top-1 font-display text-xl font-black tabular-nums"
              style={{
                color: LIT,
                left: `${((panelX(beat.active) + PANEL_W / 2) / VIEW_W) * 100}%`,
                transform: 'translateX(-50%)',
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            >
              {beat.running}
            </motion.div>
          )}
        </div>

        {/* compare row: the three settled counts, with B highlighted as the longest */}
        {beat.showCounts && (
          <div className="flex items-center gap-3 font-display text-xl font-black tabular-nums">
            {SEGMENT_IDS.map((id) => {
              const isAns = (beat.phase === 'compare' || beat.phase === 'result') && beat.active === id
              return (
                <motion.span
                  key={`cmp-${id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg px-2 py-0.5"
                  style={
                    isAns
                      ? { background: '#FFE7D2', color: LIT, border: `2px solid ${LIT}` }
                      : { color: BRAND_BLUE }
                  }
                >
                  {id} = {lengths[id]}
                </motion.span>
              )
            })}
          </div>
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'trace'
                ? { background: '#FFF1E6', borderColor: LIT, color: LIT }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
