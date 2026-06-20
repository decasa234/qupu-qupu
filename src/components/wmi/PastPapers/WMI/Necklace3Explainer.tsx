// IKMC-19-PE-Q3 — animated explainer for the necklace pattern question.
//
// Animation flow:
//   0. Show the necklace (intro).
//   1. Highlight the 4-bead repeating unit (white, black, black, gray).
//   2. Check each option A–E in sequence — dim failed options.
//   3. Crown C as the answer.
//
// Re-uses BeadGlyph / NECKLACE_BEADS / NECKLACE_CYCLE / OPTIONS_N3
// from Necklace3Illustration.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BeadGlyph,
  NECKLACE_BEADS,
  NECKLACE_CYCLE,
  OPTIONS_N3,
} from './Necklace3Illustration'
import type { BeadColor } from './Necklace3Illustration'
import { buildNecklace3Steps } from './necklace3Steps'

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const GREEN  = '#10B981'
const RED    = '#EF4444'
const PURPLE = '#341857'

// ---------------------------------------------------------------------------
// Necklace layout constants
// ---------------------------------------------------------------------------
const N = NECKLACE_BEADS.length   // 12
const CX_NECK   = 100
const CY_NECK   = 100
const NECK_R    = 68
const BEAD_R    = 11
const SVG_NECK_SIZE = 200

function beadAngle(i: number): number {
  return -Math.PI / 2 + (2 * Math.PI * i) / N
}

// ---------------------------------------------------------------------------
// Option row layout constants
// ---------------------------------------------------------------------------
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'] as const
const OPT_R        = 10
const OPT_GAP      = 5
const OPT_PAD      = 6
const OPT_LABEL_W  = 22
const OPT_ROW_H    = OPT_PAD * 2 + OPT_R * 2 + 6
const OPT_MAX_BEADS = 4
const OPT_CELL     = 2 * OPT_R
const OPT_W        = OPT_LABEL_W + OPT_PAD * 2 + OPT_MAX_BEADS * OPT_CELL + (OPT_MAX_BEADS - 1) * OPT_GAP + 8
const OPT_TOTAL_H  = OPTION_LABELS.length * (OPT_ROW_H + 6)

// ---------------------------------------------------------------------------
// Helper: is a bead sequence a valid contiguous segment of the necklace cycle?
// ---------------------------------------------------------------------------
function isValid(seq: BeadColor[]): boolean {
  const cycle = NECKLACE_CYCLE
  const L = seq.length
  const C = cycle.length
  for (let start = 0; start < C; start++) {
    let ok = true
    for (let j = 0; j < L; j++) {
      if (seq[j] !== cycle[(start + j) % C]) { ok = false; break }
    }
    if (ok) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Necklace3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNecklace3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: temukan unit berulang kalung, lalu cocokkan pilihan — hanya C yang cocok (putih, hitam, hitam, abu-abu).'
      : 'Explainer: find the necklace repeating unit then match choices — only C fits (white, black, black, gray).'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Necklace ───────────────────────────────────────────────────── */}
        <svg
          viewBox={`0 0 ${SVG_NECK_SIZE} ${SVG_NECK_SIZE}`}
          width="100%"
          style={{ maxWidth: SVG_NECK_SIZE }}
          aria-hidden="true"
        >
          {/* String */}
          <circle
            cx={CX_NECK}
            cy={CY_NECK}
            r={NECK_R}
            fill="none"
            stroke="#6B7280"
            strokeWidth={2}
          />

          {/* Beads */}
          {NECKLACE_BEADS.map((color, i) => {
            const a  = beadAngle(i)
            const bx = CX_NECK + NECK_R * Math.cos(a)
            const by = CY_NECK + NECK_R * Math.sin(a)
            const isUnit = beat.phase === 'unit' && beat.highlightIndices.includes(i)
            const dimBead = beat.phase === 'unit' && !isUnit
            return (
              <g key={i}>
                {isUnit && (
                  <circle
                    cx={bx}
                    cy={by}
                    r={BEAD_R + 5}
                    fill="none"
                    stroke={GREEN}
                    strokeWidth={2.5}
                  />
                )}
                <BeadGlyph
                  color={color}
                  cx={bx}
                  cy={by}
                  r={BEAD_R}
                  opacity={dimBead ? 0.3 : 1}
                />
              </g>
            )
          })}
        </svg>

        {/* ── Option rows ────────────────────────────────────────────────── */}
        <svg
          viewBox={`0 0 ${OPT_W} ${OPT_TOTAL_H}`}
          width="100%"
          style={{ maxWidth: Math.min(280, OPT_W) }}
          aria-hidden="true"
        >
          {OPTION_LABELS.map((label, row) => {
            const beads = OPTIONS_N3[label]
            const y  = row * (OPT_ROW_H + 6)
            const cy = y + OPT_ROW_H / 2

            // Determine visual state
            const isChecked = beat.checkLabel === label
            const isAnswer  = beat.answerLabel === label
            const labelIdx  = OPTION_LABELS.indexOf(label)
            const checkIdx  = beat.checkLabel ? OPTION_LABELS.indexOf(beat.checkLabel) : -1
            const wasFail   = (beat.phase === 'check' || beat.phase === 'result') &&
                               checkIdx > labelIdx &&
                               !isValid(beads)
            const dim       = wasFail ? 0.28 : 1

            const borderColor =
              isAnswer                               ? GREEN :
              isChecked && beat.checkPass === false  ? RED   :
              isChecked && beat.checkPass === true   ? GREEN :
              'transparent'

            return (
              <g key={label} opacity={dim}>
                {/* Highlight ring */}
                {(isChecked || isAnswer) && (
                  <rect
                    x={1}
                    y={y + 1}
                    width={OPT_W - 2}
                    height={OPT_ROW_H - 2}
                    rx={6}
                    fill="none"
                    stroke={borderColor}
                    strokeWidth={2}
                  />
                )}

                {/* Option label */}
                <text
                  x={OPT_LABEL_W / 2}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={900}
                  fill={isAnswer ? '#065F46' : PURPLE}
                >
                  {label}
                </text>

                {/* Beads */}
                {beads.map((c, j) => (
                  <BeadGlyph
                    key={j}
                    color={c}
                    cx={OPT_LABEL_W + OPT_PAD + OPT_R + j * (OPT_CELL + OPT_GAP)}
                    cy={cy}
                    r={OPT_R}
                    strokeWidth={1.8}
                  />
                ))}

                {/* Pass / fail mark */}
                {beat.phase !== 'intro' && beat.phase !== 'unit' && (
                  <>
                    {isChecked && beat.checkPass === true && (
                      <text x={OPT_W - 4} y={cy} textAnchor="end" dominantBaseline="central" fontSize={13} fill={GREEN} fontWeight={900}>✓</text>
                    )}
                    {isChecked && beat.checkPass === false && (
                      <text x={OPT_W - 4} y={cy} textAnchor="end" dominantBaseline="central" fontSize={13} fill={RED} fontWeight={900}>✗</text>
                    )}
                    {isAnswer && !isChecked && (
                      <text x={OPT_W - 4} y={cy} textAnchor="end" dominantBaseline="central" fontSize={13} fill={GREEN} fontWeight={900}>✓</text>
                    )}
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {/* ── Caption ────────────────────────────────────────────────────── */}
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
