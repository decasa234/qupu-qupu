// WMI-25F2A-Q5 — Rope on a ruler: measure each straight piece, add them.
// Post-answer explainer. SSR-safe and deterministic.
// Answer E = 12 cm  (upper 3→7 = 4 cm, lower 3→11 = 8 cm, total 12 cm).

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// ── Colour tokens (mirror the illustration) ──────────────────────────────────
const ROPE_DARK  = '#1565C0'   // deep blue rope outline
const ROPE_LIGHT = '#42A5F5'   // lighter blue rope fill
const RULER_BODY = '#FFF8DC'   // cream
const RULER_BORDER = '#C4A64A' // gold
const TICK_DARK  = '#7A6010'
const LABEL_CLR  = '#5A4A00'
const HIGHLIGHT_UPPER = '#FF6F00'  // amber for upper-piece bracket
const HIGHLIGHT_LOWER = '#388E3C'  // green for lower-piece bracket
const RESULT_BG  = '#D1FAE5'
const RESULT_BD  = '#10B981'
const RESULT_FG  = '#065F46'
const INFO_BG    = '#E1EFFB'
const INFO_BD    = '#30598A'
const INFO_FG    = '#30598A'

// ── Layout constants (reuse the same ruler geometry) ─────────────────────────
const VW = 320
const VH = 148

const RULER_X0 = 16
const RULER_Y  = 82
const RULER_W  = 288
const RULER_H  = 46
const RULER_RX = 7

const CM_LEFT  = 2
const CM_RIGHT = 11
const CM_SPAN  = CM_RIGHT - CM_LEFT   // 9

const PX_PER_CM = RULER_W / (CM_SPAN + 0.8)

function cmX(cm: number): number {
  return RULER_X0 + (cm - CM_LEFT) * PX_PER_CM
}

// Rope geometry (identical to the illustration)
const ROPE_UPPER_Y = RULER_Y - 18
const ROPE_UPPER_X1 = cmX(3)
const ROPE_UPPER_X2 = cmX(7)

const ROPE_LOWER_Y = RULER_Y - 6
const ROPE_LOWER_X1 = cmX(3)
const ROPE_LOWER_X2 = cmX(11)

const LOOP_CX = cmX(5.5) - 18
const LOOP_D = [
  `M ${ROPE_UPPER_X2} ${ROPE_UPPER_Y}`,
  `C ${LOOP_CX} ${ROPE_UPPER_Y},`,
  `  ${LOOP_CX} ${ROPE_LOWER_Y},`,
  `  ${cmX(6.5)} ${ROPE_LOWER_Y}`,
].join(' ')

// ── Bilingual helper ──────────────────────────────────────────────────────────
function t(lang: 'en' | 'id', en: string, id: string): string {
  return lang === 'id' ? id : en
}

// ── Beat types ────────────────────────────────────────────────────────────────
type BeatPhase = 'intro' | 'upper' | 'lower' | 'sum'

interface Beat {
  phase: BeatPhase
  caption: string
  hold: number
  result: boolean
}

// ── Storyboard builder ────────────────────────────────────────────────────────
function buildSteps(lang: 'en' | 'id'): { steps: Beat[]; finalIndex: number } {
  const steps: Beat[] = [
    {
      phase: 'intro',
      caption: t(lang,
        'The rope has two straight pieces — read each one on the ruler!',
        'Tali punya dua bagian lurus — baca masing-masing di penggaris!',
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'upper',
      caption: t(lang,
        'Top piece: from 3 cm to 7 cm → 7 − 3 = 4 cm',
        'Bagian atas: dari 3 cm ke 7 cm → 7 − 3 = 4 cm',
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'lower',
      caption: t(lang,
        'Bottom piece: from 3 cm to 11 cm → 11 − 3 = 8 cm',
        'Bagian bawah: dari 3 cm ke 11 cm → 11 − 3 = 8 cm',
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'sum',
      caption: t(lang,
        '4 + 8 = 12 cm → answer E ✓',
        '4 + 8 = 12 cm → jawaban E ✓',
      ),
      hold: 0,
      result: true,
    },
  ]
  return { steps, finalIndex: steps.length - 1 }
}

// ── Ruler sub-component ───────────────────────────────────────────────────────
function Ruler() {
  const halfTicks: number[] = []
  for (let c = CM_LEFT; c < CM_RIGHT; c++) halfTicks.push(c + 0.5)

  const mmTicks: number[] = []
  for (let i = 0; i <= (CM_RIGHT - CM_LEFT) * 10; i++) {
    const c = CM_LEFT + i / 10
    const rounded = Math.round(c * 10) / 10
    const isCm   = rounded === Math.round(rounded)
    const isHalf = Math.abs(rounded - Math.round(rounded)) === 0.5
    if (!isCm && !isHalf) mmTicks.push(rounded)
  }

  return (
    <g>
      {/* ruler body */}
      <rect x={RULER_X0} y={RULER_Y} width={RULER_W} height={RULER_H} rx={RULER_RX}
        fill={RULER_BODY} stroke={RULER_BORDER} strokeWidth={1.8} />
      {/* sheen */}
      <rect x={RULER_X0 + RULER_RX} y={RULER_Y} width={RULER_W - RULER_RX * 2} height={5}
        fill="rgba(255,255,255,0.45)" />

      {/* mm ticks */}
      {mmTicks.map((c) => (
        <line key={`mm-${c}`} x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 5}
          stroke="#A08020" strokeWidth={0.6} />
      ))}

      {/* half-cm ticks */}
      {halfTicks.map((c) => (
        <line key={`half-${c}`} x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 9}
          stroke="#A08020" strokeWidth={0.9} />
      ))}

      {/* full-cm ticks + labels */}
      {Array.from({ length: 10 }, (_, i) => {
        const c = CM_LEFT + i
        return (
          <g key={`cm-${c}`}>
            <line x1={cmX(c)} y1={RULER_Y} x2={cmX(c)} y2={RULER_Y + 15}
              stroke={TICK_DARK} strokeWidth={1.3} />
            <text x={cmX(c)} y={RULER_Y + 28} textAnchor="middle"
              fontSize="10" fontWeight="600" fill={LABEL_CLR}>{c}</text>
          </g>
        )
      })}
      <text x={cmX(11) + 13} y={RULER_Y + 28} textAnchor="start"
        fontSize="9" fontWeight="500" fill={LABEL_CLR}>cm</text>
    </g>
  )
}

// ── Rope sub-component ────────────────────────────────────────────────────────
function Rope({ dimUpper, dimLower }: { dimUpper: boolean; dimLower: boolean }) {
  const upperOpacity = dimUpper ? 0.25 : 1
  const loopOpacity  = dimUpper && dimLower ? 0.25 : 0.55
  const lowerOpacity = dimLower ? 0.25 : 1

  return (
    <g>
      {/* upper piece */}
      <g opacity={upperOpacity}>
        <line x1={ROPE_UPPER_X1} y1={ROPE_UPPER_Y} x2={ROPE_UPPER_X2} y2={ROPE_UPPER_Y}
          stroke={ROPE_DARK} strokeWidth={9} strokeLinecap="round" />
        <line x1={ROPE_UPPER_X1} y1={ROPE_UPPER_Y} x2={ROPE_UPPER_X2} y2={ROPE_UPPER_Y}
          stroke={ROPE_LIGHT} strokeWidth={5} strokeLinecap="round" strokeDasharray="3 5" />
      </g>

      {/* U-turn loop */}
      <g opacity={loopOpacity}>
        <path d={LOOP_D} fill="none" stroke={ROPE_DARK} strokeWidth={9}
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={LOOP_D} fill="none" stroke={ROPE_LIGHT} strokeWidth={5}
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 5" />
      </g>

      {/* lower piece */}
      <g opacity={lowerOpacity}>
        <line x1={ROPE_LOWER_X1} y1={ROPE_LOWER_Y} x2={ROPE_LOWER_X2} y2={ROPE_LOWER_Y}
          stroke={ROPE_DARK} strokeWidth={9} strokeLinecap="round" />
        <line x1={ROPE_LOWER_X1} y1={ROPE_LOWER_Y} x2={ROPE_LOWER_X2} y2={ROPE_LOWER_Y}
          stroke={ROPE_LIGHT} strokeWidth={5} strokeLinecap="round" strokeDasharray="3 5" />
      </g>
    </g>
  )
}

// ── Bracket / annotation overlay ──────────────────────────────────────────────
function UpperBracket() {
  const y  = ROPE_UPPER_Y - 11
  const x1 = ROPE_UPPER_X1
  const x2 = ROPE_UPPER_X2
  const mid = (x1 + x2) / 2
  return (
    <g>
      {/* horizontal line */}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={HIGHLIGHT_UPPER} strokeWidth={2} />
      {/* end ticks */}
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={HIGHLIGHT_UPPER} strokeWidth={2} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={HIGHLIGHT_UPPER} strokeWidth={2} />
      {/* label */}
      <text x={mid} y={y - 7} textAnchor="middle" fontSize="10" fontWeight="800" fill={HIGHLIGHT_UPPER}>
        4 cm
      </text>
    </g>
  )
}

function LowerBracket() {
  const y  = ROPE_LOWER_Y + 18
  const x1 = ROPE_LOWER_X1
  const x2 = ROPE_LOWER_X2
  const mid = (x1 + x2) / 2
  return (
    <g>
      {/* horizontal line below the ruler to avoid overlap */}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={HIGHLIGHT_LOWER} strokeWidth={2} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={HIGHLIGHT_LOWER} strokeWidth={2} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={HIGHLIGHT_LOWER} strokeWidth={2} />
      <text x={mid} y={y + 12} textAnchor="middle" fontSize="10" fontWeight="800" fill={HIGHLIGHT_LOWER}>
        8 cm
      </text>
    </g>
  )
}

// ── Sum badge (final beat) ────────────────────────────────────────────────────
function SumBadge() {
  const cx = VW / 2
  const cy = 28
  return (
    <g>
      <rect x={cx - 58} y={cy - 14} width={116} height={26} rx={10}
        fill="#D1FAE5" stroke={RESULT_BD} strokeWidth={2} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
        fontSize="14" fontWeight="900" fill={RESULT_FG}>
        4 + 8 = 12 cm
      </text>
    </g>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RopeRuler25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(lang,
    'Read each straight piece on the ruler: top piece 3 to 7 cm is 4 cm, bottom piece 3 to 11 cm is 8 cm. Total 4 + 8 = 12 cm, answer E.',
    'Baca tiap bagian lurus di penggaris: bagian atas 3 ke 7 cm adalah 4 cm, bagian bawah 3 ke 11 cm adalah 8 cm. Total 4 + 8 = 12 cm, jawaban E.',
  )

  // decide what the SVG shows per phase
  const dimUpper = beat.phase === 'lower'
  const dimLower = beat.phase === 'upper'
  const showUpperBracket = beat.phase === 'upper' || beat.phase === 'sum'
  const showLowerBracket = beat.phase === 'lower' || beat.phase === 'sum'
  const showSum = beat.phase === 'sum'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* background */}
          <rect x={0} y={0} width={VW} height={VH} rx={10} fill="#EFF6FF" />

          {showSum && <SumBadge />}

          <Ruler />
          <Rope dimUpper={dimUpper} dimLower={dimLower} />

          {showUpperBracket && <UpperBracket />}
          {showLowerBracket && <LowerBracket />}
        </svg>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: RESULT_BG, borderColor: RESULT_BD, color: RESULT_FG }
              : { background: INFO_BG, borderColor: INFO_BD, color: INFO_FG }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
