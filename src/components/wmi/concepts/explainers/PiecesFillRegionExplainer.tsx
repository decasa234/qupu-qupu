import { Fragment, useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Polyomino } from '../../PastPapers/WMI/primitives/Polyomino'
import type { ExplainerProps } from './registry'
import { buildPiecesFillRegionSteps, cellKey, type PfrBeat, type PfrCell } from './piecesFillRegionSteps'
import { useBeatControl } from './useBeatControl'

// Warm brand palette — literal hex so the figure reads the same on any surface.
const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const TILE = '#FFD3B1'
const GAP_INK = '#B9C0CC'
const MUTED_SOFT = '#F2F4F7'

const BOARD_CELL = 26
const PAD = 4

const minOf = (cells: PfrCell[], axis: 0 | 1): number => Math.min(...cells.map((c) => c[axis]))
const spanOf = (cells: PfrCell[], axis: 0 | 1): number =>
  Math.max(...cells.map((c) => c[axis])) - minOf(cells, axis) + 1

function Cross({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
      <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  )
}

function Check({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" width={11} height={11} role="presentation">
      <path d="M3 8.5 L6.5 12 L13 4" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Small pill used for the hole facts and the per-option verdicts. */
function Chip({ tone, children }: { tone: 'neutral' | 'wrong' | 'right' | 'target'; children: ReactNode }) {
  const map = {
    neutral: { bg: BLUE_SOFT, border: BLUE, ink: BLUE },
    wrong: { bg: ROSE_SOFT, border: ROSE, ink: ROSE },
    right: { bg: GREEN_SOFT, border: GREEN, ink: GREEN_INK },
    target: { bg: AMBER_SOFT, border: AMBER, ink: AMBER },
  }[tone]
  return (
    <span
      className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
      style={{ background: map.bg, borderColor: map.border, color: map.ink }}
    >
      {children}
    </span>
  )
}

/**
 * The tiled board with its hole. On the closing beat the hole is filled in
 * square by square with the colour of the piece that actually covers it —
 * `seatPieces` searched for that placement, so the picture is the proof.
 */
function Board({ region, hole, seated }: { region: PfrCell[]; hole: PfrCell[]; seated: Record<string, number> | null }) {
  if (region.length === 0 || hole.length === 0) return null
  const width = spanOf(region, 1) * BOARD_CELL + PAD * 2
  const height = spanOf(region, 0) * BOARD_CELL + PAD * 2
  const baseR = minOf(region, 0)
  const baseC = minOf(region, 1)

  // One group of hole squares per covering piece, so each piece keeps its own
  // colour; before the closing beat there is one group and it reads as empty.
  const groups = new Map<number, PfrCell[]>()
  for (const cell of hole) {
    const owner = seated ? seated[cellKey(cell)] ?? -1 : -1
    const list = groups.get(owner)
    if (list) list.push(cell)
    else groups.set(owner, [cell])
  }
  const fills = [GREEN_SOFT, BLUE_SOFT]
  const strokes = [GREEN, BLUE]

  return (
    <div className="relative" style={{ width, height }}>
      <Polyomino cells={region} cellSize={BOARD_CELL} pad={PAD} fill={TILE} stroke={BLUE} strokeWidth={2.5} />
      {[...groups.entries()].map(([owner, cells]) => (
        <div
          key={owner}
          className="absolute"
          style={{ top: (minOf(cells, 0) - baseR) * BOARD_CELL, left: (minOf(cells, 1) - baseC) * BOARD_CELL }}
        >
          <Polyomino
            cells={cells}
            cellSize={BOARD_CELL}
            pad={PAD}
            fill={owner < 0 ? SHELL : fills[owner % fills.length]}
            stroke={owner < 0 ? GAP_INK : strokes[owner % strokes.length]}
            strokeWidth={2}
          />
        </div>
      ))}
    </div>
  )
}

export default function PiecesFillRegionExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildPiecesFillRegionSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat: PfrBeat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const still = !!reduce

  // Four options share the row, so the squares shrink to fit the widest one.
  const pieceCell = useMemo(() => {
    const cols = Math.max(1, ...story.options.map((o) => o.pieces.reduce((sum, p) => sum + spanOf(p, 1), 0)))
    const rows = Math.max(1, ...story.options.flatMap((o) => o.pieces.map((p) => spanOf(p, 0))))
    return Math.max(5, Math.min(12, Math.floor(64 / cols), Math.floor(48 / rows)))
  }, [story.options])

  // Which options have already been crossed off by the time we reach this beat.
  const struck = useMemo(() => {
    const out = new Set<number>()
    for (let i = 0; i <= index && i < story.steps.length; i++) {
      const s = story.steps[i]
      if (s.tone === 'wrong' && s.optionIndex != null) out.add(s.optionIndex)
    }
    return out
  }, [index, story.steps])

  const captionStyle =
    beat.tone === 'wrong'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.tone === 'right'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: count the hole's squares, measure its longest straight line, then turn each piece — never flipping it — until only one can go in.`,
    `Strategi: hitung kotak lubangnya, ukur garis lurus terpanjangnya, lalu putar tiap kepingan — tanpa pernah membaliknya — sampai hanya satu yang bisa masuk.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[20rem] flex-col items-center justify-start gap-2.5 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* The two numbers every elimination is measured against. */}
        <div className="flex min-h-[1.75rem] w-full flex-wrap items-center justify-center gap-2">
          <Chip tone="target">{T(`Hole ${story.n} squares`, `Lubang ${story.n} kotak`)}</Chip>
          <Chip tone="target">{T(`Longest line ${story.holeRun}`, `Garis terpanjang ${story.holeRun}`)}</Chip>
          {beat.verdict && beat.optionLabel && (
            <Chip tone="wrong">
              <Cross color={ROSE} />
              {beat.optionLabel}: {beat.verdict}
            </Chip>
          )}
          {beat.tone === 'right' && beat.optionLabel && (
            <Chip tone="right">
              <Check color={GREEN_INK} />
              {beat.optionLabel} {T('fits', 'pas')}
            </Chip>
          )}
        </div>

        <Board region={story.region} hole={story.hole} seated={beat.seated} />

        {/* Every option stays on screen, dimming as it is crossed off, so the
            final one is visibly the last shape standing. */}
        <div className="grid w-full grid-cols-4 gap-1.5">
          {story.options.map((option, i) => {
            const out = struck.has(i) && beat.optionIndex !== i
            const live = beat.optionIndex === i
            const accent = live ? (beat.tone === 'right' ? GREEN : ROSE) : out ? GAP_INK : BLUE
            const bg = live ? (beat.tone === 'right' ? GREEN_SOFT : ROSE_SOFT) : out ? MUTED_SOFT : BLUE_SOFT
            return (
              <motion.div
                key={option.label}
                animate={still ? undefined : { scale: live ? 1.05 : 1, opacity: out ? 0.45 : 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                className="flex flex-col items-center justify-end gap-1 rounded-xl border-2 px-1 py-1.5"
                style={{ background: bg, borderColor: accent }}
              >
                <div className="flex min-h-[2.75rem] items-end justify-center gap-0.5">
                  {option.pieces.map((piece, j) => (
                    <Fragment key={j}>
                      {j > 0 && (
                        <span className="pb-0.5 font-display text-[0.625rem] font-black" style={{ color: accent }}>
                          +
                        </span>
                      )}
                      <Polyomino cells={piece} cellSize={pieceCell} pad={1} fill={bg} stroke={accent} strokeWidth={1.25} />
                    </Fragment>
                  ))}
                </div>
                <span className="font-display text-[0.6875rem] font-black tabular-nums" style={{ color: accent }}>
                  {option.label} · {option.squares}
                </span>
              </motion.div>
            )
          })}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
