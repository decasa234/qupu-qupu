/**
 * WMI-23F2A-Q4 — Peggy's reverse-route explainer.
 *
 * Strategy: to find the way home, (1) reverse the ORDER of the legs, then
 * (2) flip each direction to its opposite.
 *
 * Beats:
 *   0 – intro: going to school is W → NW → S; to go home, reverse + flip.
 *   1 – reverse order: list legs last-to-first  → S, NW, W
 *   2 – flip leg 1 (S → N): show arrow on map + compass
 *   3 – flip leg 2 (NW → SE): show arrow on map + compass
 *   4 – flip leg 3 (W → E): show arrow on map + compass
 *   5 – final (result:true): full return route N → SE → E = C, map lit
 *
 * Pure render, SSR-safe, deterministic. No Math.random, no Date.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PeggyMap23G2 } from './PeggyMap23G2Illustration'

// ─── colour tokens ────────────────────────────────────────────────────────────
const BRAND_BLUE        = '#30598A'
const BRAND_BLUE_SHADOW = '#263B55'
const BRAND_ORANGE      = '#f0853a'
const PEACH             = '#FFD3B1'
const SHELL             = '#FFF9F4'
const GREEN             = '#10B981'
const GREEN_INK         = '#065F46'
const INK               = '#1F2937'
const MUTED             = '#9CA3AF'
const ROSE              = '#e11d48'

// ─── storyboard ───────────────────────────────────────────────────────────────

interface PeggyBeat {
  /** Which flip step is active (null = none or all). */
  flipStep: null | 0 | 1 | 2
  /** Show the full return path overlay on the map. */
  showReturn: boolean
  hold: number
  result: boolean
  caption: string
}

function buildSteps(lang: 'en' | 'id'): PeggyBeat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      flipStep: null,
      showReturn: false,
      hold: 2800,
      result: false,
      caption: t(
        'Going to school: W → NW → S.  To go home: reverse the order, then flip each direction!',
        'Pergi ke sekolah: W → NW → S.  Pulang: balik urutannya, lalu balikkan tiap arah!',
      ),
    },
    {
      flipStep: null,
      showReturn: false,
      hold: 2200,
      result: false,
      caption: t(
        'Reversed order = last leg first → S, NW, W',
        'Urutan dibalik = langkah terakhir dulu → S, NW, W',
      ),
    },
    {
      flipStep: 0,
      showReturn: false,
      hold: 2100,
      result: false,
      caption: t(
        'Flip leg 1: S → opposite = N',
        'Balik langkah 1: S → lawannya = U (N)',
      ),
    },
    {
      flipStep: 1,
      showReturn: false,
      hold: 2100,
      result: false,
      caption: t(
        'Flip leg 2: NW → opposite = SE',
        'Balik langkah 2: NW → lawannya = TL (SE)',
      ),
    },
    {
      flipStep: 2,
      showReturn: false,
      hold: 2100,
      result: false,
      caption: t(
        'Flip leg 3: W → opposite = E',
        'Balik langkah 3: W → lawannya = T (E)',
      ),
    },
    {
      flipStep: null,
      showReturn: true,
      hold: 0,
      result: true,
      caption: t(
        'Home route: N → SE → E  =  C ✓',
        'Rute pulang: U → TL → T  =  C ✓',
      ),
    },
  ]
}

// ─── small compass showing the flip for each leg ─────────────────────────────

/** Bearing from North clockwise (0 = N, 90 = E, 180 = S, 270 = W). */
const BEARINGS: Record<string, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
}

const PAIRS: Array<{ from: string; to: string }> = [
  { from: 'S',  to: 'N'  },   // flip 0
  { from: 'NW', to: 'SE' },   // flip 1
  { from: 'W',  to: 'E'  },   // flip 2
]

function bearingToXY(bearing: number, r: number, cx: number, cy: number) {
  // bearing 0 = North = up = (cx, cy - r)
  const rad = ((bearing - 90) * Math.PI) / 180
  return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r }
}

function FlipCompass({ flipStep }: { flipStep: 0 | 1 | 2 }) {
  const cx = 50
  const cy = 50
  const R  = 36
  const pair = PAIRS[flipStep]

  const fromPt = bearingToXY(BEARINGS[pair.from], R * 0.78, cx, cy)
  const toPt   = bearingToXY(BEARINGS[pair.to],   R * 0.78, cx, cy)

  // All 8 compass labels
  const allPoints = Object.entries(BEARINGS).map(([label, angle]) => {
    const pt = bearingToXY(angle, R + 11, cx, cy)
    const isMajor = ['N', 'S', 'E', 'W'].includes(label)
    const isFrom  = label === pair.from
    const isTo    = label === pair.to
    return { label, pt, isMajor, isFrom, isTo }
  })

  return (
    <svg viewBox="0 0 100 100" width={92} height={92} aria-hidden="true">
      {/* outer ring */}
      <circle cx={cx} cy={cy} r={R} fill="white" stroke={PEACH} strokeWidth={1.5} />

      {/* FROM arrow (rose) */}
      <line
        x1={cx} y1={cy}
        x2={fromPt.x} y2={fromPt.y}
        stroke={ROSE} strokeWidth={2.5} strokeLinecap="round"
      />
      {/* TO arrow (green) */}
      <line
        x1={cx} y1={cy}
        x2={toPt.x} y2={toPt.y}
        stroke={GREEN} strokeWidth={2.5} strokeLinecap="round"
      />

      {/* centre dot */}
      <circle cx={cx} cy={cy} r={3} fill={INK} />

      {/* labels */}
      {allPoints.map(({ label, pt, isMajor, isFrom, isTo }) => (
        <text
          key={label}
          x={pt.x}
          y={pt.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={label.length > 1 ? 7 : 9}
          fontWeight={isMajor ? '800' : '600'}
          fill={isFrom ? ROSE : isTo ? GREEN : isTo ? GREEN : MUTED}
        >
          {label}
        </text>
      ))}

      {/* FROM label box */}
      <rect
        x={fromPt.x - 8} y={fromPt.y - 8}
        width={16} height={14}
        rx={3}
        fill={ROSE} opacity={0.15}
      />
      {/* TO label box */}
      <rect
        x={toPt.x - 8} y={toPt.y - 8}
        width={16} height={14}
        rx={3}
        fill={GREEN} opacity={0.18}
      />
    </svg>
  )
}

// ─── direction sequence pill row ──────────────────────────────────────────────

interface DirSeqProps {
  /** The three legs in display order. */
  legs: string[]
  /** Which index is currently being flipped (null = none highlighted). */
  activeIdx: null | number
  /** For the active index, what the flipped-to direction is. */
  flippedTo?: string
  lang: 'en' | 'id'
}

function DirSequence({ legs, activeIdx, flippedTo, lang }: DirSeqProps) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return (
    <div className="flex items-center gap-1 font-display text-base font-black">
      {legs.map((leg, i) => {
        const isActive = activeIdx === i
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <span style={{ color: MUTED }} className="text-xs font-semibold">→</span>
            )}
            <motion.span
              animate={{
                color: isActive ? ROSE : BRAND_BLUE,
                scale: isActive ? 1.12 : 1,
              }}
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              className="rounded-lg px-2 py-0.5"
              style={{
                background: isActive ? '#FFF1F2' : SHELL,
                border: `2px solid ${isActive ? ROSE : PEACH}`,
              }}
            >
              {leg}
            </motion.span>
            {isActive && flippedTo && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28 }}
                className="flex items-center gap-0.5"
              >
                <span style={{ color: MUTED }} className="text-xs font-semibold">
                  {t('→', '→')}
                </span>
                <span
                  className="rounded-lg px-2 py-0.5 font-display text-base font-black"
                  style={{
                    background: '#ECFDF5',
                    border: `2px solid ${GREEN}`,
                    color: GREEN_INK,
                  }}
                >
                  {flippedTo}
                </span>
              </motion.span>
            )}
          </span>
        )
      })}
    </div>
  )
}

// ─── component ───────────────────────────────────────────────────────────────

export default function PeggyMap23G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildSteps(lang), [lang])

  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel = t(
    'Strategy: reverse the order of the legs (S, NW, W) then flip each to its opposite (N, SE, E). The home route is N → SE → E, which is choice C.',
    'Strategi: balik urutan langkah (S, NW, W) lalu balikkan tiap arah ke lawannya (N, SE, E). Rute pulang adalah U → TL → T, yaitu pilihan C.',
  )

  // For the reversed-order row (beats 1–4) and the final beat.
  const reversedLegs = ['S', 'NW', 'W']

  // For the final answer row.
  const answerLegs = ['N', 'SE', 'E']

  // Map beat index → which reversed leg is being shown as "flipping"
  // beat 2 → index 0 (S→N), beat 3 → index 1 (NW→SE), beat 4 → index 2 (W→E)
  const activeReversedIdx: null | number =
    beat.flipStep !== null ? beat.flipStep : null

  const flippedDir: string | undefined =
    beat.flipStep !== null ? PAIRS[beat.flipStep].to : undefined

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="flex min-h-[360px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* ── header banner ──────────────────────────────────────────────── */}
        <div
          className="relative flex w-full max-w-[320px] items-center justify-center gap-2 overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          <div
            className="absolute inset-x-0 top-0 h-3 rounded-t-xl"
            style={{ background: BRAND_BLUE_SHADOW }}
          />
          <span
            className="relative font-display text-sm font-extrabold"
            style={{ color: '#FFF9F4' }}
          >
            {t('Reverse order · Flip each direction', 'Balik urutan · Balikkan tiap arah')}
          </span>
        </div>

        {/* ── map (always shown; return path appears on final beat) ─────── */}
        <div className="w-full max-w-[320px]">
          <PeggyMap23G2 highlightReverse={beat.showReturn} />
        </div>

        {/* ── direction sequence rows ────────────────────────────────────── */}
        <div className="flex w-full max-w-[320px] flex-col items-center gap-2">

          {/* Going-to-school row */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-[11px] font-extrabold uppercase tracking-wide"
              style={{ color: BRAND_BLUE }}
            >
              {t('To school (forward)', 'Ke sekolah (maju)')}
            </span>
            <div className="flex items-center gap-1 font-display text-base font-black" style={{ color: BRAND_BLUE }}>
              {['W', 'NW', 'S'].map((leg, i) => (
                <span key={leg} className="flex items-center gap-1">
                  {i > 0 && <span style={{ color: MUTED }} className="text-xs font-semibold">→</span>}
                  <span
                    className="rounded-lg px-2 py-0.5"
                    style={{ background: '#E1EFFB', border: `2px solid ${PEACH}`, color: BRAND_BLUE }}
                  >
                    {leg}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Reversed / flipping row — visible from beat 1 onward */}
          {index >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="flex flex-col items-center gap-1"
            >
              <span
                className="font-display text-[11px] font-extrabold uppercase tracking-wide"
                style={{ color: beat.result ? GREEN_INK : BRAND_ORANGE }}
              >
                {beat.result
                  ? t('Home route = C ✓', 'Rute pulang = C ✓')
                  : index === 1
                    ? t('Reversed order', 'Urutan dibalik')
                    : t('Flipping…', 'Membalikkan…')}
              </span>

              {beat.result ? (
                /* Final: show the answer legs in green */
                <div className="flex items-center gap-1 font-display text-base font-black">
                  {answerLegs.map((leg, i) => (
                    <span key={leg} className="flex items-center gap-1">
                      {i > 0 && <span style={{ color: MUTED }} className="text-xs font-semibold">→</span>}
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 22, delay: i * 0.1 }}
                        className="rounded-lg px-2 py-0.5"
                        style={{
                          background: '#ECFDF5',
                          border: `2px solid ${GREEN}`,
                          color: GREEN_INK,
                        }}
                      >
                        {leg}
                      </motion.span>
                    </span>
                  ))}
                </div>
              ) : (
                <DirSequence
                  legs={reversedLegs}
                  activeIdx={activeReversedIdx}
                  flippedTo={flippedDir}
                  lang={lang}
                />
              )}
            </motion.div>
          )}
        </div>

        {/* ── compass (only when a flip is in progress) ─────────────────── */}
        {beat.flipStep !== null && (
          <motion.div
            key={beat.flipStep}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="flex flex-col items-center gap-1"
          >
            <span
              className="font-display text-[11px] font-extrabold uppercase tracking-wide"
              style={{ color: INK }}
            >
              {t('Flip on the compass', 'Balik pada kompas')}
            </span>
            <FlipCompass flipStep={beat.flipStep} />
          </motion.div>
        )}

        {/* ── caption ───────────────────────────────────────────────────── */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
