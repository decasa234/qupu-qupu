// WMI-25F2A-Q2 post-answer explainer
// Vertical addition: [★]8 + [□][□] = 73
// Strategy: try ★ from largest downward, check digits stay distinct.
// Answer: ★ = 4 (D), second addend = 25, digits {4,8,2,5,7,3} all distinct.
//
// Beats:
//   0  Goal: make ★ as big as possible — second addend ≥ 10, so ★8 ≤ 63, ★ ≤ 5
//   1  Try ★ = 7: 78 > 73 already — impossible
//   2  Try ★ = 6: 68 + 05 = 73, but 05 is not two-digit (second addend must be 2 digits) — no
//   3  Try ★ = 5: 58 + 15 = 73, but 5 appears twice — rejected
//   4  Try ★ = 4: 48 + 25 = 73, digits 4,8,2,5,7,3 all distinct — accepted!  (hold 0)

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// ── colour tokens (mirror StarAdd25G2Illustration) ───────────────────────────
const INK = '#1F2937'
const STAR_FILL = '#F2994A'     // qupu-brand-orange
const GREEN = '#059669'          // accepted
const RED = '#DC2626'            // rejected
const BLUE = '#2563EB'           // neutral highlight
const CAPTION_BG_NEUTRAL = '#E1EFFB'
const CAPTION_BORDER_NEUTRAL = '#30598A'
const CAPTION_TEXT_NEUTRAL = '#30598A'
const CAPTION_BG_OK = '#D1FAE5'
const CAPTION_BORDER_OK = '#059669'
const CAPTION_TEXT_OK = '#065F46'
const CAPTION_BG_BAD = '#FEE2E2'
const CAPTION_BORDER_BAD = '#DC2626'
const CAPTION_TEXT_BAD = '#991B1B'

type Mood = 'neutral' | 'ok' | 'bad'

interface Beat {
  starTry: number | null   // digit being tried (null = no candidate yet)
  secondTry: [number, number] | null  // [tens, units] of second addend (null = hidden)
  mood: Mood
  hold: number
  caption: { en: string; id: string }
}

function buildBeats(): Beat[] {
  return [
    {
      starTry: null,
      secondTry: null,
      mood: 'neutral',
      hold: 2800,
      caption: {
        en: 'We want ★ as BIG as possible. The second number has 2 digits (≥ 10), so ★8 is at most 63 — meaning ★ ≤ 5.',
        id: 'Kita ingin ★ sebesar mungkin. Bilangan kedua 2 angka (≥ 10), jadi ★8 paling besar 63 — artinya ★ ≤ 5.',
      },
    },
    {
      starTry: 7,
      secondTry: null,
      mood: 'bad',
      hold: 2100,
      caption: {
        en: 'Try ★ = 7: 78 is already bigger than 73 — impossible!',
        id: 'Coba ★ = 7: 78 sudah lebih besar dari 73 — tidak mungkin!',
      },
    },
    {
      starTry: 5,
      secondTry: [1, 5],
      mood: 'bad',
      hold: 2100,
      caption: {
        en: 'Try ★ = 5: 58 + 15 = 73, but 5 appears twice — rejected!',
        id: 'Coba ★ = 5: 58 + 15 = 73, tapi 5 muncul dua kali — ditolak!',
      },
    },
    {
      starTry: 4,
      secondTry: [2, 5],
      mood: 'ok',
      hold: 0,
      caption: {
        en: '★ = 4: 48 + 25 = 73. Digits 4, 8, 2, 5, 7, 3 are all different. Answer D!',
        id: '★ = 4: 48 + 25 = 73. Angka 4, 8, 2, 5, 7, 3 semua berbeda. Jawaban D!',
      },
    },
  ]
}

// ── digit cell constants matching the illustration ──────────────────────────
const CELL = 38
const GAP = 6
const PAD_X = 14
const PAD_Y = 14

const xU = PAD_X + 30 + CELL * 2 + GAP
const xT = xU - CELL - GAP
const xP = xT - CELL - 4

const yR1 = PAD_Y + CELL / 2
const yR2 = yR1 + CELL + GAP
const yLine = yR2 + CELL / 2 + 8
const yR3 = yLine + 18 + CELL / 2

const VB_W = xU + CELL / 2 + PAD_X
const VB_H = yR3 + CELL / 2 + PAD_Y

// ── star path (same formula as illustration) ─────────────────────────────────
function starPath(cx: number, cy: number, rOut: number): string {
  const rIn = rOut * 0.42
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOut : rIn
    const a = (-90 + i * 36) * (Math.PI / 180)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join('L')}Z`
}

// ── animated figure ──────────────────────────────────────────────────────────

interface FigureProps {
  starTry: number | null
  secondTry: [number, number] | null
  mood: Mood
}

function AnimatedFigure({ starTry, secondTry, mood }: FigureProps) {
  const starColor =
    mood === 'ok' ? GREEN :
    mood === 'bad' ? RED :
    STAR_FILL

  const secondColor =
    mood === 'ok' ? GREEN :
    mood === 'bad' ? RED :
    INK

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(240, VB_W)}
      aria-hidden="true"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* Row 1: [★/digit] 8 */}
      <rect
        x={xT - CELL / 2}
        y={yR1 - CELL / 2}
        width={CELL}
        height={CELL}
        rx={4}
        fill="#FFFFFF"
        stroke={starColor}
        strokeWidth={2.4}
      />
      {starTry != null ? (
        <text
          x={xT}
          y={yR1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={26}
          fontWeight={900}
          fill={starColor}
          fontFamily="sans-serif"
        >
          {starTry}
        </text>
      ) : (
        <path d={starPath(xT, yR1, CELL * 0.32)} fill={STAR_FILL} />
      )}
      <text
        x={xU}
        y={yR1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={900}
        fill={INK}
        fontFamily="sans-serif"
      >
        8
      </text>

      {/* Row 2: + [□/digit] [□/digit] */}
      <text
        x={xP}
        y={yR2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
        fontWeight={700}
        fill={INK}
        fontFamily="sans-serif"
      >
        +
      </text>

      {secondTry != null ? (
        <>
          <text
            x={xT}
            y={yR2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={26}
            fontWeight={900}
            fill={secondColor}
            fontFamily="sans-serif"
          >
            {secondTry[0]}
          </text>
          <text
            x={xU}
            y={yR2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={26}
            fontWeight={900}
            fill={secondColor}
            fontFamily="sans-serif"
          >
            {secondTry[1]}
          </text>
        </>
      ) : (
        <>
          <rect
            x={xT - CELL / 2}
            y={yR2 - CELL / 2}
            width={CELL}
            height={CELL}
            rx={4}
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth={2.4}
          />
          <rect
            x={xU - CELL / 2}
            y={yR2 - CELL / 2}
            width={CELL}
            height={CELL}
            rx={4}
            fill="#FFFFFF"
            stroke={INK}
            strokeWidth={2.4}
          />
        </>
      )}

      {/* Horizontal rule */}
      <line
        x1={xP - CELL / 2 - 4}
        y1={yLine}
        x2={xU + CELL / 2 + 2}
        y2={yLine}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Result: 7 3 */}
      <text
        x={xT}
        y={yR3}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={900}
        fill={INK}
        fontFamily="sans-serif"
      >
        7
      </text>
      <text
        x={xU}
        y={yR3}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
        fontWeight={900}
        fill={INK}
        fontFamily="sans-serif"
      >
        3
      </text>

      {/* Verdict badge (cross or tick) overlaid on the figure */}
      <AnimatePresence mode="wait">
        {mood === 'bad' && (
          <motion.text
            key="cross"
            x={VB_W - 20}
            y={20}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fill={RED}
            fontWeight={900}
            fontFamily="sans-serif"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            ✗
          </motion.text>
        )}
        {mood === 'ok' && (
          <motion.text
            key="tick"
            x={VB_W - 20}
            y={20}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fill={GREEN}
            fontWeight={900}
            fontFamily="sans-serif"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          >
            ✓
          </motion.text>
        )}
      </AnimatePresence>
    </svg>
  )
}

// ── digit chip row (shows the 6 digits for the winning beat) ─────────────────

function DigitChips({ digits, show }: { digits: number[]; show: boolean }) {
  if (!show) return null
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {digits.map((d, i) => (
        <span
          key={i}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold"
          style={{ background: '#D1FAE5', color: '#065F46', border: `2px solid ${GREEN}` }}
        >
          {d}
        </span>
      ))}
    </motion.div>
  )
}

// ── try indicator pill ───────────────────────────────────────────────────────

function TryPill({ starTry, mood }: { starTry: number | null; mood: Mood }) {
  if (starTry == null) return null
  const bg = mood === 'ok' ? CAPTION_BG_OK : CAPTION_BG_BAD
  const border = mood === 'ok' ? GREEN : RED
  const color = mood === 'ok' ? '#065F46' : '#991B1B'
  return (
    <motion.div
      key={`pill-${starTry}`}
      className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold"
      style={{ background: bg, border: `2px solid ${border}`, color }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
    >
      <span style={{ color: STAR_FILL }}>★</span>
      <span>= {starTry}</span>
    </motion.div>
  )
}

// ── main explainer ───────────────────────────────────────────────────────────

export default function StarAdd25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats = useMemo(() => buildBeats(), [])

  const index = useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b) => b.hold),
  })

  const beat = beats[index] ?? beats[beats.length - 1]

  const captionBg =
    beat.mood === 'ok' ? CAPTION_BG_OK :
    beat.mood === 'bad' ? CAPTION_BG_BAD :
    CAPTION_BG_NEUTRAL
  const captionBorder =
    beat.mood === 'ok' ? CAPTION_BORDER_OK :
    beat.mood === 'bad' ? CAPTION_BORDER_BAD :
    CAPTION_BORDER_NEUTRAL
  const captionText =
    beat.mood === 'ok' ? CAPTION_TEXT_OK :
    beat.mood === 'bad' ? CAPTION_TEXT_BAD :
    CAPTION_TEXT_NEUTRAL

  const ariaLabel = t(
    'Try ★ from 7 down. 78 is already bigger than 73, so ★ cannot be 7. 58 + 15 = 73 but digit 5 repeats. 48 + 25 = 73 with digits 4, 8, 2, 5, 7, 3 all different — so ★ = 4, answer D.',
    'Coba ★ dari 7 ke bawah. 78 sudah lebih besar dari 73, jadi ★ tidak bisa 7. 58 + 15 = 73 tapi angka 5 berulang. 48 + 25 = 73 dengan angka 4, 8, 2, 5, 7, 3 semua berbeda — jadi ★ = 4, jawaban D.',
  )

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Figure */}
        <motion.div
          key={`fig-${index}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <AnimatedFigure
            starTry={beat.starTry}
            secondTry={beat.secondTry}
            mood={beat.mood}
          />
        </motion.div>

        {/* Try pill */}
        <AnimatePresence mode="wait">
          {beat.starTry != null && (
            <TryPill key={`try-${beat.starTry}`} starTry={beat.starTry} mood={beat.mood} />
          )}
        </AnimatePresence>

        {/* Digit chips (winning beat only) */}
        <AnimatePresence>
          {beat.mood === 'ok' && (
            <DigitChips
              digits={[4, 8, 2, 5, 7, 3]}
              show={beat.mood === 'ok'}
            />
          )}
        </AnimatePresence>

        {/* Strategy badge (first beat only) */}
        {beat.starTry == null && (
          <div
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: '#EFF6FF', color: BLUE, border: `1.5px solid ${BLUE}` }}
          >
            {t('Strategy: try from largest, check no repeats', 'Strategi: coba dari terbesar, cek tidak ada ulang')}
          </div>
        )}

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{ background: captionBg, borderColor: captionBorder, color: captionText }}
        >
          {lang === 'id' ? beat.caption.id : beat.caption.en}
        </div>
      </div>
    </div>
  )
}
