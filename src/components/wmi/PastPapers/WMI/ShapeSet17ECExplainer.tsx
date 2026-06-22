import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeItem, SHAPES, SVG_W, SVG_H, STROKE } from './ShapeSet17ECIllustration'
import { buildShapeSet17ECSteps } from './shapeSet17ECSteps'

// IKMC-22-EC-Q17. Wanda chose a few shapes such that 2 are coloured, 2 are
// large, and 2 are round. The explainer walks through why 2 shapes can't
// satisfy all three pairs, then shows that the optimal pick of 3 shapes
// (large red □, large white ○, small red ●) covers all three rules exactly.

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'
const NEUTRAL = '#94A3B8'
const RED_VERDICT = '#DC2626'
const RED_BG = '#FEE2E2'
const RED_INK = '#991B1B'
const ORANGE_RING = '#F97316'

type Verdict = 'pass' | 'fail' | undefined

function RulePill({ label, verdict }: { label: string; verdict: Verdict }) {
  const isPass = verdict === 'pass'
  const isFail = verdict === 'fail'
  const bg = isPass ? GREEN_BG : isFail ? RED_BG : '#F1F5F9'
  const ink = isPass ? GREEN_INK : isFail ? RED_INK : NEUTRAL
  const border = isPass ? GREEN : isFail ? RED_VERDICT : '#CBD5E1'
  const mark = isPass ? '✓' : isFail ? '✗' : '·'
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-xs font-extrabold"
      style={{ background: bg, color: ink, borderColor: border }}
    >
      <span>{label}</span>
      <span aria-hidden="true">{mark}</span>
    </div>
  )
}

export default function ShapeSet17ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeSet17ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ruleColouredLabel = lang === 'id' ? '2 berwarna' : '2 coloured'
  const ruleLargeLabel    = lang === 'id' ? '2 besar'    : '2 large'
  const ruleRoundLabel    = lang === 'id' ? '2 bulat'    : '2 round'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Wanda memilih bentuk sehingga ada tepat 2 berwarna, 2 besar, dan 2 bulat. Dengan 2 bentuk tidak cukup. Pilih 3: kotak merah besar, lingkaran putih besar, lingkaran merah kecil — 2 berwarna ✓, 2 besar ✓, 2 bulat ✓. Jawaban ${story.answer}.`
      : `Explainer: Wanda needs 2 coloured, 2 large, and 2 round among her chosen shapes. Two shapes can't satisfy all three pairs. Pick 3: large red square, large white circle, small red circle — 2 coloured ✓, 2 large ✓, 2 round ✓. The minimum is 3, answer ${story.answer}.`

  // Explainer SVG: show all 6 shapes, highlight (orange ring) those in beat.highlighted.
  // viewBox 0 0 480 120 reuses the same layout as the illustration.
  const explainerSvg = (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block' }}
    >
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#FFFFFF" />
      {SHAPES.map((s, i) => {
        const isHighlighted = beat.highlighted.includes(i)
        return (
          <g key={i}>
            {isHighlighted && (
              <>
                {s.type === 'circle' && (
                  <circle
                    cx={s.cx}
                    cy={s.cy}
                    r={(s.large ? 28 : 16) + 7}
                    fill="none"
                    stroke={ORANGE_RING}
                    strokeWidth={3}
                  />
                )}
                {s.type === 'square' && (() => {
                  const side = (s.large ? 56 : 32) + 14
                  return (
                    <rect
                      x={s.cx - side / 2}
                      y={s.cy - side / 2}
                      width={side}
                      height={side}
                      fill="none"
                      stroke={ORANGE_RING}
                      strokeWidth={3}
                      rx={3}
                    />
                  )
                })()}
                {s.type === 'triangle' && (() => {
                  const base = (s.large ? 60 : 34) + 14
                  const height = (base * Math.sqrt(3)) / 2
                  const x1 = s.cx
                  const y1 = s.cy - height * (2 / 3)
                  const x2 = s.cx - base / 2
                  const y2 = s.cy + height * (1 / 3)
                  const x3 = s.cx + base / 2
                  const y3 = s.cy + height * (1 / 3)
                  return (
                    <polygon
                      points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
                      fill="none"
                      stroke={ORANGE_RING}
                      strokeWidth={3}
                    />
                  )
                })()}
              </>
            )}
            <ShapeItem {...s} />
          </g>
        )
      })}
      {/* dim non-highlighted shapes when there IS a highlight selection */}
      {beat.highlighted.length > 0 &&
        SHAPES.map((s, i) =>
          beat.highlighted.includes(i) ? null : (
            <rect
              key={`dim-${i}`}
              x={s.cx - 45}
              y={0}
              width={90}
              height={SVG_H}
              fill="rgba(255,255,255,0.55)"
            />
          ),
        )}
      {/* separator lines between shapes */}
      {[80, 160, 240, 320, 400].map((x) => (
        <line key={x} x1={x} y1={10} x2={x} y2={SVG_H - 10} stroke={STROKE} strokeWidth={0.5} opacity={0.18} />
      ))}
    </svg>
  )

  return (
    <div className="mx-auto w-full max-w-[500px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Shape row with highlights */}
        <motion.div
          key={`shapes-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full rounded-2xl border-2 bg-white px-2 py-1"
          style={{ borderColor: beat.result ? GREEN : '#E2E8F0' }}
        >
          {explainerSvg}
        </motion.div>

        {/* Three rule verdict pills */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <RulePill label={ruleColouredLabel} verdict={beat.colouredVerdict} />
          <RulePill label={ruleLargeLabel}    verdict={beat.largeVerdict}    />
          <RulePill label={ruleRoundLabel}    verdict={beat.roundVerdict}    />
        </div>

        {/* Caption box — blue while deducing, green on the winning beat */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
