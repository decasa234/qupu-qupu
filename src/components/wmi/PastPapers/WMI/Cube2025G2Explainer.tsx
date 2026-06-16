// Post-answer explainer for WMI-25F2A-Q17 (2025 Grade-2 Final).
// The year 2025 is built from 66 unit cubes (each digit one cube thick) and
// painted. We deduce WHY exactly 60 cubes have 4 painted faces: front + back are
// always painted (2); a straight-run cube adds 2 more side faces (-> 4, counts);
// an END / corner cube adds 3 (-> 5, does NOT count). So 66 − 6 free ends = 60.
//
// The scene reuses IsoCube + the digit grids from the static illustration so the
// animation reads as the same figure coming alive. End cubes get a red reject
// marker as we cross them off, digit by digit, before subtracting.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { buildCube2025G2Steps } from './cube2025G2Steps'
import { IsoCube, YEAR_2025, type DigitGrid } from './Cube2025G2Illustration'

// ---- palette (mirrors the static figure's qupu cube tokens) --------------- //
const INK = '#1F2937'
const GREEN = '#10B981'
const REJECT = '#DC2626' // red — marks the 5-face end cubes that don't count
const KEEP = '#2563EB' // blue — rings the straight-run cube being highlighted

// Layout constants — must match Cube2025G2Figure exactly so the scene aligns.
const SIZE = 17
const CX = SIZE * 0.62
const CY = SIZE * 0.42
const GAP_COLS = 1.6
const DIGIT_COLS = 4

interface Cell {
  digit: number
  row: number
  col: number // absolute column (digit origin + local col)
  showTop: boolean
  showRight: boolean
}

/** Build the full cube list with the same painter ordering as the figure. */
function buildScene() {
  let col = 0
  const origins = YEAR_2025.map((grid: DigitGrid) => {
    const originCol = col
    col += DIGIT_COLS + GAP_COLS
    return { grid, originCol }
  })
  const totalCols = col - GAP_COLS
  const rows = YEAR_2025[0].length

  const cells: Cell[] = []
  origins.forEach(({ grid, originCol }, digit) => {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c]) continue
        const above = r > 0 && grid[r - 1][c] === 1
        const right = c < grid[r].length - 1 && grid[r][c + 1] === 1
        cells.push({ digit, row: r, col: originCol + c, showTop: !above, showRight: !right })
      }
    }
  })
  // Top rows first, then right-to-left within a row (matches the figure).
  cells.sort((a, b) => a.row - b.row || b.col - a.col)

  const width = totalCols * SIZE + CX
  const height = rows * SIZE + CY
  return { cells, width, height }
}

export default function Cube2025G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCube2025G2Steps(lang), [lang])
  const scene = useMemo(() => buildScene(), [])

  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Fast lookup of the end cubes marked so far (digit:row:col).
  const markedKeys = useMemo(
    () => new Set(beat.marked.map((m) => `${m.digit}:${m.row}:${m.col}`)),
    [beat.marked],
  )
  const allEndKeys = useMemo(
    () => new Set(story.allEnds.map((m) => `${m.digit}:${m.row}:${m.col}`)),
    [story.allEnds],
  )

  // Pick one representative straight-run cube to ring blue on the 'straight'
  // beat, and one end cube to ring red on the 'end' beat (the first digit-2 ends).
  const sampleEnd = story.allEnds[0]
  const sampleStraight = useMemo(() => {
    // A cube that is NOT an end and is not the sample end — pick a stable one.
    for (const c of scene.cells) {
      const key = `${c.digit}:${c.row}:${c.col}`
      if (!allEndKeys.has(key)) return c
    }
    return scene.cells[0]
  }, [scene.cells, allEndKeys])

  const pad = 10
  const vbW = scene.width + pad * 2
  const vbH = scene.height + pad * 2 + CY

  // Tally chips at the bottom: total, ends crossed, remaining.
  const remaining = story.total - beat.endCount

  return (
    <div
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label={t(
        `Front and back of every cube are always painted; only end cubes show a third side, so ${story.total} cubes minus ${story.ends} end cubes leaves ${story.answer} with exactly four painted faces.`,
        `Depan dan belakang tiap kubus selalu dicat; hanya kubus ujung yang menampakkan sisi ketiga, jadi ${story.total} kubus dikurangi ${story.ends} kubus ujung menyisakan ${story.answer} kubus dengan tepat empat sisi dicat.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`${-pad} ${-pad - CY} ${vbW} ${vbH}`}
          width="100%"
          style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* the cube-built year, mirroring the static figure */}
          {scene.cells.map((c) => {
            const key = `${c.digit}:${c.row}:${c.col}`
            const isEnd = allEndKeys.has(key)
            const isMarked = markedKeys.has(key)
            // Dim everything but the sample on the focused single-cube beats.
            const focusStraight = beat.phase === 'straight'
            const focusEnd = beat.phase === 'end'
            const isFocus =
              (focusStraight && c === sampleStraight) ||
              (focusEnd && sampleEnd && c.digit === sampleEnd.digit && c.row === sampleEnd.row && c.col === sampleEnd.col)
            const dim = (focusStraight || focusEnd) && !isFocus
            return (
              <g key={key} opacity={dim ? 0.28 : 1} style={{ transition: 'opacity 220ms' }}>
                <IsoCube fx={c.col * SIZE} fy={c.row * SIZE} showTop={c.showTop} showRight={c.showRight} />
                {/* reject marker on end cubes once crossed off */}
                {isEnd && isMarked && (
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  >
                    <line
                      x1={c.col * SIZE + 3}
                      y1={c.row * SIZE + 3}
                      x2={c.col * SIZE + SIZE - 3}
                      y2={c.row * SIZE + SIZE - 3}
                      stroke={REJECT}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                    <line
                      x1={c.col * SIZE + SIZE - 3}
                      y1={c.row * SIZE + 3}
                      x2={c.col * SIZE + 3}
                      y2={c.row * SIZE + SIZE - 3}
                      stroke={REJECT}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                    />
                  </motion.g>
                )}
              </g>
            )
          })}

          {/* spotlight ring on the focused cube */}
          {beat.phase === 'straight' && (
            <motion.rect
              key="ring-straight"
              x={sampleStraight.col * SIZE - 2}
              y={sampleStraight.row * SIZE - 2}
              width={SIZE + 4}
              height={SIZE + 4}
              rx={4}
              fill="none"
              stroke={KEEP}
              strokeWidth={2.4}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          )}
          {beat.phase === 'end' && sampleEnd && (
            <motion.rect
              key="ring-end"
              x={(() => {
                const cell = scene.cells.find(
                  (c) => c.digit === sampleEnd.digit && c.row === sampleEnd.row && c.col === sampleEnd.col,
                )
                return (cell ? cell.col : 0) * SIZE - 2
              })()}
              y={sampleEnd.row * SIZE - 2}
              width={SIZE + 4}
              height={SIZE + 4}
              rx={4}
              fill="none"
              stroke={REJECT}
              strokeWidth={2.4}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          )}
        </svg>

        {/* running tally: total / crossed ends / remaining */}
        <div className="flex items-center gap-2 font-display text-xs font-bold">
          <span className="rounded-lg px-2.5 py-1" style={{ background: '#FCF1D6', color: INK }}>
            {t('cubes', 'kubus')} {story.total}
          </span>
          <span className="rounded-lg px-2.5 py-1" style={{ background: '#FEE2E2', color: REJECT }}>
            {t('ends', 'ujung')} −{beat.endCount}
          </span>
          <motion.span
            key={remaining}
            className="rounded-lg px-2.5 py-1"
            style={beat.result ? { background: '#D1FAE5', color: '#065F46' } : { background: '#E1EFFB', color: '#30598A' }}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            {t('= 4 faces', '= 4 sisi')} {remaining}
          </motion.span>
        </div>

        {/* caption */}
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
