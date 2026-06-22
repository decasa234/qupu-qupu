// IKMC-22-EC-Q5 — post-answer beat-by-beat explainer.
//
// Reuses NumberLineBase, JumpArc, KangarooFigure, and layout constants from
// NumberLine5ECIllustration. Animation traces 4 cycles of (large+small+small)
// arcs from 0 to 16, then reveals the final count.
//
// Beats (from numberLine5ECSteps):
//   0. intro         — show line + Kengu at 0, no arcs.
//   1. cycle-pattern — one full cycle (0→2→3→4) with "+2 / +1 / +1 = 4" labels.
//   2. cycles-count  — all 4 cycles shown from 0 to 16.
//   3. jumps-per     — cycle-0 arcs numbered 1, 2, 3 (badge circles).
//   4. total         — 4 × 3 = 12 → answer E (green).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  NumberLineBase,
  JumpArc,
  KangarooFigure,
  xAt,
  LINE_Y,
  COLOR,
} from './NumberLine5ECIllustration'
import { buildNumberLine5ECSteps } from './numberLine5ECSteps'

const GREEN  = '#10B981'
const BLUE   = '#1D4ED8'
const ORANGE = '#f0853a'
const INK    = COLOR.INK

// Heights for arcs
const LARGE_H = 48
const SMALL_H = 22

// The full 16-unit line — 4 cycles × 4 units
const MAX_VAL = 16

interface CycleData {
  start: number   // start value of this cycle
  large: number   // large-jump target (start + 2)
  s1: number      // first small target (start + 3)
  s2: number      // second small target (start + 4)
}

const CYCLES: CycleData[] = [0, 4, 8, 12].map((start) => ({
  start,
  large: start + 2,
  s1: start + 3,
  s2: start + 4,
}))

// ── Badge circle (jump number label) ──────────────────────────────────────────

function JumpBadge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill={ORANGE} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {n}
      </text>
    </g>
  )
}

// ── Arc label ("+N" above arc apex) ───────────────────────────────────────────

function ArcLabel({ fromVal, toVal, height, label }: { fromVal: number; toVal: number; height: number; label: string }) {
  const x = xAt((fromVal + toVal) / 2)
  const y = LINE_Y - height - 8
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={11}
      fontWeight={800}
      fill={BLUE}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {label}
    </text>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function NumberLine5ECExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildNumberLine5ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: '#1E3A8A' }

  // Kangaroo position: above the large arc of the LAST shown cycle
  const lastCycle = beat.cyclesShown > 0 ? CYCLES[beat.cyclesShown - 1] : null
  const kangX = lastCycle ? xAt((lastCycle.start + lastCycle.large) / 2) : xAt(1)
  const kangY = LINE_Y - LARGE_H - 20

  // Determine SVG viewBox width — show at least 0..6 for the intro/cycle beats,
  // full 0..18 for the multi-cycle beats
  const needFull = beat.cyclesShown >= 2
  const svgW = needFull ? 680 : 360
  const svgH = 130

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Kengu melompat besar (+2) lalu kecil (+1) lalu kecil (+1) = 4 per siklus. 4 siklus × 3 lompatan = 12 lompatan total — jawaban E.'
      : 'Explainer: Kengu jumps large (+2) then small (+1) then small (+1) = 4 per cycle. 4 cycles × 3 jumps = 12 total jumps — answer E.'

  return (
    <div className="mx-auto w-full max-w-[680px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ maxWidth: svgW, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={svgW} height={svgH} fill="white" />

          {/* ── Number line ── */}
          <NumberLineBase maxVal={needFull ? MAX_VAL : 4} extraTicks={needFull ? 2 : 2} />

          {/* ── Cycles ── */}
          {CYCLES.slice(0, beat.cyclesShown).map((cy, ci) => {
            const isFirstCycle = ci === 0

            return (
              <g key={cy.start}>
                {/* Large arc */}
                <JumpArc
                  fromVal={cy.start}
                  toVal={cy.large}
                  height={LARGE_H}
                  color={isResult ? GREEN : BLUE}
                  strokeWidth={2.4}
                />
                {/* Small arc 1 */}
                <JumpArc
                  fromVal={cy.large}
                  toVal={cy.s1}
                  height={SMALL_H}
                  color={isResult ? GREEN : BLUE}
                  strokeWidth={2.4}
                />
                {/* Small arc 2 */}
                <JumpArc
                  fromVal={cy.s1}
                  toVal={cy.s2}
                  height={SMALL_H}
                  color={isResult ? GREEN : BLUE}
                  strokeWidth={2.4}
                />

                {/* "+2 / +1 / +1" labels on cycle 0 during cycle-pattern beat */}
                {isFirstCycle && beat.showCycleLabels && (
                  <>
                    <ArcLabel fromVal={cy.start} toVal={cy.large} height={LARGE_H} label="+2" />
                    <ArcLabel fromVal={cy.large} toVal={cy.s1}    height={SMALL_H} label="+1" />
                    <ArcLabel fromVal={cy.s1}    toVal={cy.s2}    height={SMALL_H} label="+1" />
                  </>
                )}

                {/* Jump-count badges (1, 2, 3) on cycle 0 during jumps-per beat */}
                {isFirstCycle && beat.showJumpBadges && (
                  <>
                    <JumpBadge
                      x={xAt((cy.start + cy.large) / 2)}
                      y={LINE_Y - LARGE_H - 8}
                      n={1}
                    />
                    <JumpBadge
                      x={xAt((cy.large + cy.s1) / 2)}
                      y={LINE_Y - SMALL_H - 8}
                      n={2}
                    />
                    <JumpBadge
                      x={xAt((cy.s1 + cy.s2) / 2)}
                      y={LINE_Y - SMALL_H - 8}
                      n={3}
                    />
                  </>
                )}
              </g>
            )
          })}

          {/* ── Kangaroo at the last landing position ── */}
          {beat.cyclesShown > 0 && (
            <KangarooFigure cx={kangX} cy={kangY} />
          )}

          {/* ── Equation label at top-right ── */}
          {beat.equation && (
            <text
              x={needFull ? svgW - 16 : 340}
              y={16}
              textAnchor="end"
              fontSize={13}
              fontWeight={900}
              fill={isResult ? GREEN : BLUE}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {beat.equation}
            </text>
          )}

          {/* ── Result: final answer badge at position 16 ── */}
          {isResult && (
            <g>
              <circle cx={xAt(MAX_VAL)} cy={LINE_Y} r={10} fill={GREEN} />
              <text
                x={xAt(MAX_VAL)}
                y={LINE_Y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={9}
                fontWeight={900}
                fill="white"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                16
              </text>
            </g>
          )}
        </svg>

        {/* ── Result banner ── */}
        {isResult && (
          <div
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            {lang === 'id' ? '12 lompatan → Jawaban E' : '12 jumps → Answer E'}
          </div>
        )}

        {/* ── Caption box ── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
