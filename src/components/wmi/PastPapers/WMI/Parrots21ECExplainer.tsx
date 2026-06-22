/**
 * Parrots21ECExplainer — IKMC-20-EC-Q21
 *
 * Post-answer beat-by-beat explainer. Reuses ParrotPrimitive from the
 * illustration. Shows all 6 permutations of (R, G, B) across (head, wings,
 * tail), then crosses out the one already used, leaving 5. Answer D.
 *
 * SSR-safe, deterministic. No Math.random, no Date, no window/document at
 * module top.
 */

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ParrotPrimitive, P21_W, P21_H } from './Parrots21ECIllustration'
import { buildParrots21ECSteps, ALL_PERMS } from './parrots21ECSteps'
import type { PartColor } from './parrots21ECSteps'

// ── Colour map ────────────────────────────────────────────────────────────────
const FILL: Record<NonNullable<PartColor>, string> = {
  R: '#EF4444', // red-500
  G: '#22C55E', // green-500
  B: '#3B82F6', // blue-500
}

const NEUTRAL = '#F5F0E8' // uncoloured body (from illustration)

function partFill(c: PartColor): string {
  return c ? FILL[c] : NEUTRAL
}

// ── Blue / green tokens ───────────────────────────────────────────────────────
const BLUE = '#30598A'
const GREEN = '#10B981'

// ── Mini parrot card ──────────────────────────────────────────────────────────
// Each card shows a tiny parrot (~80×70 px) with its colour assignment labelled.

const CARD_W = P21_W * 0.48
const CARD_H = P21_H * 0.46

interface ParrotCardProps {
  permIndex: number
  /** Show the "used / terpakai" cross-out overlay. */
  used: boolean
  /** Highlight border (bright outline for the focused parrot). */
  active: boolean
  /** Row 1 label (colour name for head). */
  labelHead: string
  labelWings: string
  labelTail: string
}

function parrotLabel(c: PartColor, lang: 'en' | 'id'): string {
  if (!c) return ''
  const names: Record<NonNullable<PartColor>, { en: string; id: string }> = {
    R: { en: 'Red', id: 'Merah' },
    G: { en: 'Green', id: 'Hijau' },
    B: { en: 'Blue', id: 'Biru' },
  }
  return lang === 'id' ? names[c].id : names[c].en
}

function ParrotCard({ permIndex, used, active, labelHead, labelWings, labelTail }: ParrotCardProps) {
  const [head, wings, tail] = ALL_PERMS[permIndex]
  const borderCol = used ? '#EF4444' : active ? '#F5A623' : BLUE
  const borderW = active ? 2.5 : 1.5

  return (
    <svg
      viewBox={`0 0 ${P21_W} ${P21_H + 48}`}
      width={CARD_W}
      height={CARD_H + 22}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* card background */}
      <rect
        x={1} y={1}
        width={P21_W - 2} height={P21_H + 46}
        rx={10}
        fill={used ? '#FEF2F2' : '#F8FAFF'}
        stroke={borderCol}
        strokeWidth={borderW}
      />

      {/* parrot at native coords, no scaling needed (viewBox handles it) */}
      <g transform={`translate(0, 0)`}>
        <ParrotPrimitive
          headFill={partFill(head)}
          wingFill={partFill(wings)}
          tailFill={partFill(tail)}
        />
      </g>

      {/* colour label strip */}
      <g fontSize={11} fontWeight={700} fontFamily="ui-sans-serif, system-ui, sans-serif">
        {/* head label */}
        <rect x={4} y={P21_H + 2} width={76} height={15} rx={4} fill={head ? FILL[head] : NEUTRAL} />
        <text x={42} y={P21_H + 10} textAnchor="middle" dominantBaseline="central" fill="#fff">
          {labelHead}
        </text>
        {/* wings label */}
        <rect x={84} y={P21_H + 2} width={88} height={15} rx={4} fill={wings ? FILL[wings] : NEUTRAL} />
        <text x={128} y={P21_H + 10} textAnchor="middle" dominantBaseline="central" fill="#fff">
          {labelWings}
        </text>
        {/* tail label */}
        <rect x={176} y={P21_H + 2} width={80} height={15} rx={4} fill={tail ? FILL[tail] : NEUTRAL} />
        <text x={216} y={P21_H + 10} textAnchor="middle" dominantBaseline="central" fill="#fff">
          {labelTail}
        </text>
      </g>

      {/* cross-out overlay for used parrot */}
      {used && (
        <g stroke="#EF4444" strokeWidth={5} strokeLinecap="round" opacity={0.8}>
          <line x1={20} y1={20} x2={P21_W - 20} y2={P21_H - 20} />
          <line x1={P21_W - 20} y1={20} x2={20} y2={P21_H - 20} />
        </g>
      )}
    </svg>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Parrots21ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildParrots21ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  // Caption / equation colours
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const equationStyle = isResult
    ? { background: GREEN }
    : { background: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ada 3! = 6 cara mewarnai kepala/sayap/ekor dengan 3 warna berbeda; satu sudah dipakai; tersisa 5 burung beo. Jawaban D.'
      : 'Explainer: there are 3! = 6 ways to colour head/wings/tail with 3 different colours; one is already used; 5 remain. Answer D.'

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 2×3 grid of parrot cards */}
        {beat.visibleCount > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(3, ${CARD_W}px)`,
              gap: 6,
            }}
          >
            {ALL_PERMS.slice(0, beat.visibleCount).map((_, i) => {
              const [h, w, tl] = ALL_PERMS[i]
              return (
                <ParrotCard
                  key={i}
                  permIndex={i}
                  used={beat.showUsed && i === 0}
                  active={beat.activeIndex === i}
                  labelHead={parrotLabel(h, lang)}
                  labelWings={parrotLabel(w, lang) + (lang === 'id' ? '' : '')}
                  labelTail={parrotLabel(tl, lang)}
                />
              )
            })}
          </div>
        )}

        {/* equation pill */}
        {beat.equation !== '' && (
          <span
            className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
            style={equationStyle}
          >
            {beat.equation}
          </span>
        )}

        {/* caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
