// HKIMO-18-P2H-Q16 — animated explainer for "How many squares?"
//
// Teaches the count-by-size strategy beat-by-beat on a 4-column × 3-row grid:
//   Beat 0 (intro)   — plain grid, prompt to count ALL sizes.
//   Beat 1 (1×1)     — amber tint on every unit cell; count = 12.
//   Beat 2 (2×2)     — green outlines over all 6 possible 2×2 squares.
//   Beat 3 (3×3)     — blue outlines over all 2 possible 3×3 squares.
//   Beat 4 (answer)  — both large-square overlays + equation 12+6+2=20.
//
// Pure SVG via GridBoard primitive. No framer-motion. SSR-safe.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import {
  buildCountSquaresHK18P2Q16Steps,
  type SquareHighlight,
} from './countSquaresHK18P2Q16Steps'

// ── grid constants ────────────────────────────────────────────────────────────

const ROWS = 3
const COLS = 4
const CELL = 52

const W = COLS * CELL   // 208
const H = ROWS * CELL   // 156

// ── colour tokens ─────────────────────────────────────────────────────────────

const GREEN_BG  = '#D1FAE5'
const GREEN_STR = '#10B981'
const BLUE_BG   = '#DBEAFE'
const BLUE_STR  = '#2563EB'
const BLUE_UI   = '#1A6FA0'
const BLUE_UI_BG = '#E1EFFB'
const ANS_BG    = '#ECFDF5'
const ANS_STR   = '#059669'
const ANS_TXT   = '#065F46'

// ── helper: all (startRow, startCol) positions for squares of given size ───────

function squarePositions(size: number): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (let r = 0; r <= ROWS - size; r++) {
    for (let c = 0; c <= COLS - size; c++) {
      out.push([r, c])
    }
  }
  return out
}

const POS_2X2 = squarePositions(2)   // 3 × 2 = 6 positions
const POS_3X3 = squarePositions(3)   // 2 × 1 = 2 positions

// ── MultiSquareOverlay — draws multi-cell square outlines over the GridBoard ──

interface OverlayProps {
  positions: Array<[number, number]>
  size: number
  stroke: string
  fill: string
}

function MultiSquareOverlay({ positions, size, stroke, fill }: OverlayProps) {
  const px = size * CELL
  return (
    <>
      {positions.map(([r, c], i) => (
        <rect
          key={i}
          x={c * CELL + 3}
          y={r * CELL + 3}
          width={px - 6}
          height={px - 6}
          fill={fill}
          stroke={stroke}
          strokeWidth={2.5}
          rx={3}
          opacity={0.55}
        />
      ))}
    </>
  )
}

// ── CountSquaresHK18P2Q16Explainer ───────────────────────────────────────────

export default function CountSquaresHK18P2Q16Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const story = useMemo(() => buildCountSquaresHK18P2Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const hl: SquareHighlight = beat.highlight

  const vb = gridBoardViewBox(ROWS, COLS, CELL)
  const isAnswer = hl === 'answer'

  const captionBg  = isAnswer ? ANS_BG    : BLUE_UI_BG
  const captionBdr = isAnswer ? ANS_STR   : BLUE_UI
  const captionTxt = isAnswer ? ANS_TXT   : BLUE_UI

  // 1×1 beat: amber highlight on every cell
  const highlightFn =
    hl === '1x1'
      ? (_r: number, _c: number) => 'amber' as const
      : undefined

  return (
    <div
      className="mx-auto w-full max-w-[280px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: hitung persegi berdasarkan ukuran. Total = 20.'
          : 'Explainer: count squares by size. Total = 20.'
      }
    >
      <div className="flex flex-col items-center gap-3">

        {/* Animated grid */}
        <svg
          viewBox={vb}
          width={W}
          height={H}
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          <GridBoard
            rows={ROWS}
            cols={COLS}
            cellSize={CELL}
            gridStroke="#374151"
            highlight={highlightFn}
          />

          {/* 2×2 square outlines */}
          {(hl === '2x2' || isAnswer) && (
            <MultiSquareOverlay
              positions={POS_2X2}
              size={2}
              stroke={GREEN_STR}
              fill={GREEN_BG}
            />
          )}

          {/* 3×3 square outlines */}
          {(hl === '3x3' || isAnswer) && (
            <MultiSquareOverlay
              positions={POS_3X3}
              size={3}
              stroke={BLUE_STR}
              fill={BLUE_BG}
            />
          )}
        </svg>

        {/* Equation badge (answer beat only) */}
        {isAnswer && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: ANS_TXT,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            12 + 6 + 2 = 20
          </div>
        )}

        {/* Caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{
            background: captionBg,
            borderColor: captionBdr,
            color: captionTxt,
          }}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
