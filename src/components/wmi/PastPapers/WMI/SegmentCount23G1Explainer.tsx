import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SegmentCount23G1, GRID_COLS } from './SegmentCount23G1Illustration'
import { buildSegmentCount23G1Steps } from './segmentCount23G1Steps'

// WMI-23F1A-Q17 (2023 Grade 1 Final) — fill-in answer = 3.
//
// Binds to the built SegmentCount23G1 primitive (showDigit / heat). We do NOT
// redraw the grid: the primitive renders the figure each beat, and a thin
// transparent overlay SVG (same viewBox + geometry) rings the □ / △ squares
// during the highlight phases.

// Palette echoes the static figure's tokens.
const BRAND_BLUE = '#30598a' // qupu-brand-blue (heat text + □ ring)
const AMBER = '#f0853a' // qupu-brand-orange (△ ring, matches the "lit" colour)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const SHELL = '#FFF9F4' // qupu-shell panel
const PEACH = '#FFD3B1' // qupu-peach border

// Layout constants MIRROR the static SegmentCount23G1Illustration so the overlay
// lines up pixel-for-pixel over the rendered figure (PAD / CELL there are private).
const PAD = 14
const CELL = 50
const GRID_ROWS = 5
const BOARD_W = GRID_COLS * CELL
const BOARD_H = GRID_ROWS * CELL
const VIEW_W = BOARD_W + PAD * 2
const VIEW_H = BOARD_H + PAD * 2
const RENDER_W = Math.min(220, VIEW_W) // primitive caps its width at 220

function squareXY(s: number): { x: number; y: number } {
  const i = s - 1
  const col = i % GRID_COLS
  const row = Math.floor(i / GRID_COLS)
  return { x: PAD + col * CELL, y: PAD + row * CELL }
}

export default function SegmentCount23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSegmentCount23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ringColor = beat.ring === 'triangle' ? AMBER : BRAND_BLUE

  const ariaLabel = t(
    `Strategy: draw digits 0–9 on the grid and tally each square. ${story.boxCount} squares are drawn 9 times (□) and ${story.triangleCount} are drawn 7 times (△), so □ − △ = ${story.answer}.`,
    `Strategi: gambar angka 0–9 di kisi dan catat tiap kotak. ${story.boxCount} kotak tergambari 9 kali (□) dan ${story.triangleCount} tergambari 7 kali (△), jadi □ − △ = ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* The figure + highlight overlay share the same box so rings register. */}
        <div className="relative" style={{ width: RENDER_W }}>
          <SegmentCount23G1 showDigit={beat.showDigit} heat={beat.heat} />

          {/* highlight overlay — rings the □ (9×) or △ (7×) squares */}
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width={RENDER_W}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            {beat.highlight.map((s) => {
              const { x, y } = squareXY(s)
              return (
                <motion.rect
                  key={`ring-${beat.ring}-${s}`}
                  x={x + 3}
                  y={y + 3}
                  width={CELL - 6}
                  height={CELL - 6}
                  rx={6}
                  fill={ringColor}
                  fillOpacity={0.16}
                  stroke={ringColor}
                  strokeWidth={3.5}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )
            })}
          </svg>
        </div>

        {/* running tally: □ and △ counts as they get discovered */}
        {(beat.phase === 'box' || beat.phase === 'triangle' || beat.phase === 'result') && (
          <div className="flex items-center gap-4 font-display text-2xl font-black tabular-nums">
            <span style={{ color: BRAND_BLUE }}>
              {'□'} ={' '}
              {beat.phase === 'box' ? beat.highlight.length : story.boxCount}
            </span>
            {(beat.phase === 'triangle' || beat.phase === 'result') && (
              <motion.span
                key="tri-count"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ color: AMBER }}
              >
                {'△'} ={' '}
                {beat.phase === 'triangle' ? beat.highlight.length : story.triangleCount}
              </motion.span>
            )}
          </div>
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.ring === 'triangle'
                ? { background: '#FFF1E6', borderColor: AMBER, color: AMBER }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
