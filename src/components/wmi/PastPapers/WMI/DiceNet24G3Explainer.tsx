/**
 * DiceNet24G3Explainer — post-answer animation for WMI-24F3A-Q14 (2024 Grade 3 Final, HARD)
 *
 * Teaches the opposite-pair + chirality method:
 *   1. Fold the net into a cube — every pair of opposite faces sums to 7
 *      (6 + 1, 5 + 2, 3 + 4).
 *   2. A net can fold into a cube OR its mirror, and a real die has a fixed
 *      turning sense (1 → 2 → 3 spins one way). A candidate die only matches
 *      when BOTH its faces AND its turn agree with the folded net.
 *   3. Of the 7 dice, the ones with the right faces but the mirror turn are
 *      rejected — at most 4 survive both tests.
 *   → answer B = 4.
 *
 * The seven specific dice images were not captured, so the comparison row is a
 * schematic of "7 dice, 4 match" — we teach the method, we do not fabricate the
 * actual dice. Reuses ReferenceDie + the net data/glyphs from the illustrator's
 * file so the animation reads as the same scene coming alive.
 *
 * SSR-safe, deterministic. No Math.random, no Date.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  ReferenceDie,
  NetFaceCell,
  NET_FACES,
  OPPOSITE_PAIRS,
  CELL,
} from './DiceNet24G3Illustration'
import { buildDiceNet24G3Steps } from './diceNet24G3Steps'

// Palette echoing the illustration's qupu colour tokens.
const BRAND_BLUE = '#30598A' // qupu-brand-blue
const ORANGE = '#f0853a' // lit highlight
const GREEN = '#10B981' // qupu green (match)
const GREEN_INK = '#065F46'
const RED = '#EF4444' // rejection
const SHELL = '#F0F7FC'
const PEACH = '#cfe8f5'
const PIP_FILL = '#263B55' // qupu-brand-blue-shadow (near-black dots)

// Layout constants for the net SVG.
const PAD = 10
const GRID_COLS = 4
const GRID_ROWS = 3
const NET_W = GRID_COLS * CELL + PAD * 2
const NET_H = GRID_ROWS * CELL + PAD * 2
const DISPLAY_W = 300

// Pip layouts so the schematic mini-dice (compare row) can show a face value.
const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  3: [
    [0.28, 0.28],
    [0.5, 0.5],
    [0.72, 0.72],
  ],
}

/** Fold-line segments shared by two present net faces (dotted creases). */
function foldSegments(): { x1: number; y1: number; x2: number; y2: number }[] {
  const present = new Set(NET_FACES.map((f) => `${f.row},${f.col}`))
  const segs: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (const f of NET_FACES) {
    if (present.has(`${f.row},${f.col + 1}`)) {
      const x = (f.col + 1) * CELL
      segs.push({ x1: x, y1: f.row * CELL, x2: x, y2: (f.row + 1) * CELL })
    }
    if (present.has(`${f.row + 1},${f.col}`)) {
      const y = (f.row + 1) * CELL
      segs.push({ x1: f.col * CELL, y1: y, x2: (f.col + 1) * CELL, y2: y })
    }
  }
  return segs
}

const FOLD_SEGS = foldSegments()

/** A small schematic die showing one face value (used in the compare row). */
function MiniDie({ x, y, s, value, state }: { x: number; y: number; s: number; value: 1 | 3; state: 'match' | 'reject' }) {
  const stroke = state === 'match' ? GREEN : RED
  const fill = state === 'match' ? '#D1FAE5' : '#FEE2E2'
  const r = s * 0.07
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} rx={s * 0.16} fill={fill} stroke={stroke} strokeWidth={1.8} />
      {(PIP_LAYOUTS[value] ?? PIP_LAYOUTS[1]).map(([ux, uy], i) => (
        <circle key={i} cx={x + ux * s} cy={y + uy * s} r={r} fill={PIP_FILL} />
      ))}
      {state === 'match' ? (
        <text x={x + s / 2} y={y - 4} textAnchor="middle" fontSize={s * 0.42} fontWeight={900} fill={GREEN}>
          ✓
        </text>
      ) : (
        <text x={x + s / 2} y={y - 4} textAnchor="middle" fontSize={s * 0.42} fontWeight={900} fill={RED}>
          ✗
        </text>
      )}
    </g>
  )
}

export default function DiceNet24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildDiceNet24G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Strategy: fold the net into a cube so opposite faces sum to 7 (6+1, 5+2, 3+4), then a die matches only if its faces AND turning sense agree with the net — at most ${story.answerCount} of the ${story.diceCount} dice match. Answer B.`,
    `Strategi: lipat jaring jadi kubus sehingga sisi berhadapan berjumlah 7 (6+1, 5+2, 3+4), lalu dadu cocok hanya jika sisi DAN arah putarnya sesuai jaring — paling banyak ${story.answerCount} dari ${story.diceCount} dadu cocok. Jawaban B.`,
  )

  // Which net face-ids are lit on this beat (the active opposite pair).
  const litIds = new Set<number>()
  if (beat.litPair != null) {
    const pair = OPPOSITE_PAIRS[beat.litPair]
    if (pair) {
      litIds.add(pair.a)
      litIds.add(pair.b)
    }
  }

  const isResult = beat.result
  const isPair = beat.phase === 'pair'
  const isChirality = beat.phase === 'chirality'
  const isCompare = beat.phase === 'compare' || beat.phase === 'result'
  const accent = isResult ? GREEN : isPair ? ORANGE : BRAND_BLUE

  // Compare-row schematic: 7 dice, the first `matched` ones marked match.
  const matched = beat.matched ?? 0

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Stage 1: the net (intro / fold / pair beats) */}
        {!isCompare && (
          <motion.div
            key={`net-${beat.phase}-${String(beat.litPair)}-${String(beat.showFolded)}`}
            initial={{ opacity: 0.75, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <svg
              viewBox={`0 0 ${NET_W} ${NET_H}`}
              width={DISPLAY_W}
              style={{ display: 'block' }}
              aria-hidden="true"
            >
              <g transform={`translate(${PAD}, ${PAD})`}>
                {/* dotted creases */}
                {FOLD_SEGS.map((seg, i) => (
                  <line
                    key={i}
                    x1={seg.x1}
                    y1={seg.y1}
                    x2={seg.x2}
                    y2={seg.y2}
                    stroke={BRAND_BLUE}
                    strokeWidth={1.4}
                    strokeDasharray="3 3"
                  />
                ))}
                {/* faces — light the active opposite pair */}
                {NET_FACES.map((face) => (
                  <NetFaceCell key={face.id} face={face} lit={litIds.has(face.id)} />
                ))}
                {/* on a pair beat, connect the two lit faces with a "7" tag */}
                {isPair && beat.a != null && beat.b != null && (
                  <g>
                    <text
                      x={GRID_COLS * CELL - CELL * 0.5}
                      y={CELL * 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={CELL * 0.46}
                      fontWeight={900}
                      fill={ORANGE}
                    >
                      = 7
                    </text>
                  </g>
                )}
              </g>
            </svg>
          </motion.div>
        )}

        {/* Stage 2: chirality — the die and its mirror twin */}
        {isChirality && (
          <motion.div
            key={`chiral-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className="flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 82 108" width={96} aria-hidden="true">
              <g transform="translate(6, 4)">
                <ReferenceDie size={70} />
              </g>
            </svg>
            <div className="font-display text-2xl font-black" style={{ color: BRAND_BLUE }}>
              ↔
            </div>
            {/* mirror twin: same die, flipped left-to-right */}
            <svg viewBox="0 0 82 108" width={96} aria-hidden="true">
              <g transform="translate(76, 4) scale(-1, 1)">
                <ReferenceDie size={70} />
              </g>
            </svg>
          </motion.div>
        )}

        {/* Stage 3: compare row — 7 schematic dice, `matched` of them match */}
        {isCompare && (
          <motion.div
            key={`compare-${index}`}
            initial={{ opacity: 0.7, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <svg viewBox={`0 0 ${story.diceCount * 38 + 8} 60`} width={DISPLAY_W} aria-hidden="true">
              {Array.from({ length: story.diceCount }).map((_, i) => {
                const isMatch = i < matched
                return (
                  <MiniDie
                    key={i}
                    x={8 + i * 38}
                    y={20}
                    s={28}
                    value={isMatch ? 3 : 1}
                    state={isMatch ? 'match' : 'reject'}
                  />
                )
              })}
              {/* tally */}
              <text x={(story.diceCount * 38 + 8) / 2} y={14} textAnchor="middle" fontSize={13} fontWeight={900} fill={isResult ? GREEN_INK : BRAND_BLUE}>
                {t(`${matched} of ${story.diceCount} match`, `${matched} dari ${story.diceCount} cocok`)}
              </text>
            </svg>
          </motion.div>
        )}

        {/* Pair readout — the sum, fixed height to avoid layout shift */}
        <div className="flex h-8 items-center justify-center">
          {isPair && beat.a != null && beat.b != null && (
            <motion.div
              key={`sum-${beat.litPair}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="font-display text-xl font-black tabular-nums"
              style={{ color: ORANGE }}
            >
              {Math.max(beat.a, beat.b)} + {Math.min(beat.a, beat.b)} = 7
            </motion.div>
          )}
          {isResult && (
            <motion.div
              key="result-count"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="font-display text-2xl font-black tabular-nums"
              style={{ color: GREEN }}
            >
              {story.answerCount}
            </motion.div>
          )}
        </div>

        {/* Caption box */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : isPair
                ? { background: '#FFFFFF', borderColor: accent, color: accent }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
