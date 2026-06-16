import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ArrowGrid23, Q23_CELLS, GRID_VIEW } from './P20G2Q23Illustration'
import { buildP20G2Q23Steps } from './p20G2Q23Steps'

const GREEN = '#10B981'
const HILITE = '#FFD3B1' // qupu-peach
const HILITE_STROKE = '#f0853a' // qupu-brand-orange
const TURN = '#f0853a'

const CELL = 30
const PAD = 8

/** Translucent peach squares over the five shared cells. */
function CellHighlight() {
  return (
    <g>
      {Q23_CELLS.map(([r, c], i) => (
        <rect
          key={i}
          x={PAD + c * CELL + 2}
          y={PAD + r * CELL + 2}
          width={CELL - 4}
          height={CELL - 4}
          fill={HILITE}
          stroke={HILITE_STROKE}
          strokeWidth={1.6}
          opacity={0.55}
          rx={3}
        />
      ))}
    </g>
  )
}

/** A small clockwise rotation arc badge in each occupied cell. */
function TurnBadges() {
  return (
    <g stroke={TURN} strokeWidth={1.8} fill="none">
      {Q23_CELLS.map(([r, c], i) => {
        const cx = PAD + c * CELL + CELL / 2
        const cy = PAD + r * CELL + CELL / 2
        const rr = 11
        // three-quarter clockwise arc with a small head
        return (
          <g key={i}>
            <path d={`M ${cx + rr} ${cy} A ${rr} ${rr} 0 1 1 ${cx} ${cy - rr}`} opacity={0.85} />
            <polygon points={`${cx - 2},${cy - rr - 3} ${cx + 4},${cy - rr - 1} ${cx + 1},${cy - rr + 4}`} fill={TURN} stroke="none" />
          </g>
        )
      })}
    </g>
  )
}

/** The fourth panel: "?" until revealed, then the answer grid (variant 3). */
function FourthPanel({ reveal, highlight, turn }: { reveal: boolean; highlight: boolean; turn: boolean }) {
  return (
    <div style={{ position: 'relative', width: GRID_VIEW, height: GRID_VIEW }}>
      <ArrowGrid23 variant={3} unknown={!reveal} />
      {(highlight || turn) && (
        <svg viewBox={`0 0 ${GRID_VIEW} ${GRID_VIEW}`} width={GRID_VIEW} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          {highlight && <CellHighlight />}
          {turn && <TurnBadges />}
        </svg>
      )}
      {reveal && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md px-2 py-0.5 text-xs font-extrabold"
          style={{ background: '#D1FAE5', color: '#065F46', border: `1.5px solid ${GREEN}` }}
        >
          A
        </div>
      )}
    </div>
  )
}

/** Grids 1–3 with optional highlight / turn overlays. */
function GivenPanel({ variant, highlight, turn }: { variant: number; highlight: boolean; turn: boolean }) {
  return (
    <div style={{ position: 'relative', width: GRID_VIEW, height: GRID_VIEW }}>
      <ArrowGrid23 variant={variant} />
      {(highlight || turn) && (
        <svg viewBox={`0 0 ${GRID_VIEW} ${GRID_VIEW}`} width={GRID_VIEW} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
          {highlight && <CellHighlight />}
          {turn && <TurnBadges />}
        </svg>
      )}
    </div>
  )
}

export default function P20G2Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP20G2Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tiap panah berputar 90° searah jarum jam, sehingga kotak keempat adalah pilihan A.'
      : 'Explainer: every arrow turns 90° clockwise, so the fourth grid is option A.'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-1 overflow-x-auto">
          <GivenPanel variant={0} highlight={beat.highlightCells} turn={beat.showTurn} />
          <GivenPanel variant={1} highlight={beat.highlightCells} turn={beat.showTurn} />
          <GivenPanel variant={2} highlight={beat.highlightCells} turn={beat.showTurn} />
          <FourthPanel reveal={beat.revealAnswer} highlight={beat.highlightCells} turn={false} />
        </div>

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
