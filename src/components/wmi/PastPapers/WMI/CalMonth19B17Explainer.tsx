// CalMonth19B17Explainer — SEAMO 2019 Paper B Q17
//
// Animates the solution beat-by-beat:
//   0. intro      — blank calendar, state the two constraints.
//   1. try-d2     — Sunday cells teal-highlighted (d=2 gives 2,9,16,23,30).
//   2. even-check — ring the three even Sundays (2, 16, 30).
//   3. locate-24  — amber-highlight the 24th cell.
//   4. result     — show "Mon" inside the 24th cell → answer A.
//
// Reuses CalMonth19B17Figure from CalMonth19B17Fig so the animation
// reads as the static illustration coming to life.
//
// SSR-safe: framer-motion only in the caption pill; SVG figure is pure.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CalMonth19B17Figure } from './CalMonth19B17Fig'
import { buildCalMonth19B17Steps } from './calMonth19B17Steps'

// Even Sundays that get an extra ring overlay in beat 2+
// (dates 2, 16, 30 — drawn as a thin amber ring around the teal cell)
const EVEN_SUNDAYS = new Set([2, 16, 30])

// ── EvenRingOverlay ───────────────────────────────────────────────────────────
// Drawn on top of the CalMonth19B17Figure to mark even Sundays with a ring.
// Mirrors the cell geometry constants from CalMonth19B17Fig.

const CELL_W   = 44
const CELL_H   = 38
const HEADER_H = 28
const N_COLS   = 7
const PAD      = 12
const FIRST_COL = 6   // Saturday is column 6

const GRID_X = PAD
const GRID_Y = PAD + HEADER_H

const SVG_W = PAD + N_COLS * CELL_W + PAD
const SVG_H = PAD + HEADER_H + 6 * CELL_H + PAD

function cellPos(date: number) {
  const idx = date - 1 + FIRST_COL
  return { row: Math.floor(idx / N_COLS), col: idx % N_COLS }
}

function EvenRingOverlay() {
  return (
    <>
      {[...EVEN_SUNDAYS].map((date) => {
        const { row, col } = cellPos(date)
        const cx = GRID_X + col * CELL_W
        const cy = GRID_Y + row * CELL_H
        return (
          <rect
            key={`er-${date}`}
            x={cx + 3}
            y={cy + 3}
            width={CELL_W - 6}
            height={CELL_H - 6}
            fill="none"
            stroke="#D97706"
            strokeWidth={2.5}
            strokeDasharray="4 2"
            rx={3}
          />
        )
      })}
    </>
  )
}

// ── CalendarWithOverlay ────────────────────────────────────────────────────────
// Wraps CalMonth19B17Figure in an <svg> that can host the even-ring overlay.

function CalendarWithOverlay({
  showSundays,
  showEvenRing,
  showTarget,
  showAnswer,
}: {
  showSundays: boolean
  showEvenRing: boolean
  showTarget: boolean
  showAnswer: boolean
}) {
  return (
    <div style={{ position: 'relative', maxWidth: SVG_W, margin: '0 auto' }}>
      {/* Base calendar figure */}
      <CalMonth19B17Figure
        showSundays={showSundays}
        showTarget={showTarget}
        showAnswer={showAnswer}
      />
      {/* Even-ring overlay rendered as an absolute SVG on top */}
      {showEvenRing && (
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          aria-hidden="true"
        >
          <EvenRingOverlay />
        </svg>
      )}
    </div>
  )
}

// ── Explainer ─────────────────────────────────────────────────────────────────

const GREEN = '#10B981'
const BLUE  = '#30598A'

export default function CalMonth19B17Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildCalMonth19B17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: hari Minggu jatuh pada tanggal d, d+7, d+14, d+21, d+28. Agar 3 tanggal genap, d harus genap. d=2 menghasilkan Minggu pada 2,9,16,23,30 dengan 3 tanggal genap (2,16,30). Tanggal 24 adalah satu hari setelah Minggu tanggal 23, yaitu hari Senin (jawaban A).'
      : 'Explainer: Sundays fall on d, d+7, d+14, d+21, d+28. For 3 even dates, d must be even. d=2 gives Sundays on 2,9,16,23,30 with 3 even dates (2,16,30). The 24th is one day after Sunday the 23rd — Monday, answer A.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Animated calendar */}
        <CalendarWithOverlay
          showSundays={beat.showSundays}
          showEvenRing={beat.showEvenRing}
          showTarget={beat.showTarget}
          showAnswer={beat.showAnswer}
        />

        {/* Equation line */}
        {beat.equation && (
          <div
            className="rounded-lg border px-3 py-1 text-center font-mono text-xs font-bold"
            style={{ background: '#F8FAFC', borderColor: '#CBD5E1', color: '#374151' }}
          >
            {beat.equation}
          </div>
        )}

        {/* Caption pill */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
