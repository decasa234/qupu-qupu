/**
 * SEAMO-16-B-Q9 — post-answer explainer: pigeonhole principle.
 *
 * Problem: bag has 12 red, 10 white, 8 yellow, 3 blue, 2 black balls.
 * Minimum draws to guarantee 4 balls of the same colour?
 *
 * Strategy: worst-case scenario.
 *   • Red, white, yellow can each give at most 3 before reaching 4-of-a-kind.
 *   • Blue has only 3 total — can't reach 4.
 *   • Black has only 2 total — can't reach 4.
 *   Worst case without 4-of-a-kind: 3+3+3+3+2 = 14.
 *   Draw one more → guaranteed 4 of one colour → 14+1 = 15. Answer A.
 *
 * Note: the official key says E (None of the above) but the correct calculation
 * yields 15 which IS option A — this is a known answer-key error in the paper.
 * The explainer teaches the correct solution (answer = 15 = option A).
 *
 * Beat sequence:
 *   0 → intro: 5 colours, show all balls in bag
 *   1 → blue & black: only 3 and 2 — can't reach 4
 *   2 → red/white/yellow: stop at 3 each to delay
 *   3 → worst case total: 3+3+3+3+2 = 14
 *   4 → draw one more → guaranteed! 15.
 *   5 → result
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE_BRAND = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const ORANGE     = '#F59E0B'
const ORANGE_BG  = '#FFF7ED'
const INK        = '#1F2937'

// ---------------------------------------------------------------------------
// Ball colour data (must match ColorBall16B9Option)
// ---------------------------------------------------------------------------

interface ColourEntry {
  id: string       // identifier
  fill: string     // ball fill
  shade: string
  highlight: string
  total: number    // total in bag
  maxBefore4: number  // how many you can take before hitting 4-of-a-kind
  name_en: string
  name_id: string
}

const COLOURS: ColourEntry[] = [
  { id: 'red',    fill: '#D32F2F', shade: '#A00000', highlight: '#FF8080', total: 12, maxBefore4: 3, name_en: 'Red',    name_id: 'Merah'  },
  { id: 'white',  fill: '#F0EAD6', shade: '#C8BFA8', highlight: '#FFFFFF', total: 10, maxBefore4: 3, name_en: 'White',  name_id: 'Putih'  },
  { id: 'yellow', fill: '#F5C518', shade: '#D4A017', highlight: '#FFFACD', total: 8,  maxBefore4: 3, name_en: 'Yellow', name_id: 'Kuning' },
  { id: 'blue',   fill: '#2979FF', shade: '#0044CC', highlight: '#80BFFF', total: 3,  maxBefore4: 3, name_en: 'Blue',   name_id: 'Biru'   },
  { id: 'black',  fill: '#1A1A1A', shade: '#000000', highlight: '#555555', total: 2,  maxBefore4: 2, name_en: 'Black',  name_id: 'Hitam'  },
]

// ---------------------------------------------------------------------------
// MiniSphere — small coloured circle representing one ball
// ---------------------------------------------------------------------------

function MiniSphere({ fill, shade, highlight, r = 12 }: {
  fill: string; shade: string; highlight: string; r?: number
}) {
  const id = `mg-${fill.replace('#', '')}`
  return (
    <svg width={r * 2 + 4} height={r * 2 + 4} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <radialGradient id={id} cx="38%" cy="32%" r="60%">
          <stop offset="0%"   stopColor={highlight} />
          <stop offset="55%"  stopColor={fill} />
          <stop offset="100%" stopColor={shade} />
        </radialGradient>
      </defs>
      <circle cx={r + 2} cy={r + 2} r={r} fill={`url(#${id})`} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// ColourRow — one row: sphere + name + "×N" count + bar
// ---------------------------------------------------------------------------

interface ColourRowProps {
  entry: ColourEntry
  count: number          // how many are shown as "taken" in worst case
  dimmed: boolean        // grayed out (not relevant this beat)
  warn: boolean          // highlight as "can't reach 4"
  lang: 'en' | 'id'
}

function ColourRow({ entry, count, dimmed, warn, lang }: ColourRowProps) {
  const label = lang === 'id' ? entry.name_id : entry.name_en
  const dotOpacity = dimmed ? 0.25 : 1

  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        opacity: dotOpacity,
        padding: '2px 0',
      }}
    >
      <MiniSphere fill={entry.fill} shade={entry.shade} highlight={entry.highlight} r={11} />
      <span style={{ fontSize: 12, fontWeight: 700, color: INK, minWidth: 46 }}>{label}</span>
      <span style={{ fontSize: 11, color: '#6B7280', minWidth: 26 }}>×{entry.total}</span>
      {/* Dot indicators for "worst case taken" */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 9, height: 9, borderRadius: '50%',
              background: entry.fill,
              border: `1.5px solid ${entry.shade}`,
            }}
          />
        ))}
        {warn && (
          <span style={{ fontSize: 10, color: '#B91C1C', fontWeight: 700, marginLeft: 4 }}>
            {lang === 'id' ? '≤3, tak bisa 4!' : '≤3, can\'t reach 4!'}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Beat definitions
// ---------------------------------------------------------------------------

interface Beat {
  phase: 'intro' | 'smallbags' | 'worstcase' | 'total' | 'plusone' | 'result'
  caption_en: string
  caption_id: string
  equation: string
  hold: number
}

function buildBeats(lang: 'en' | 'id'): Beat[] {
  return [
    {
      phase: 'intro',
      caption_en: 'Bag: 12 red · 10 white · 8 yellow · 3 blue · 2 black',
      caption_id: 'Tas: 12 merah · 10 putih · 8 kuning · 3 biru · 2 hitam',
      equation: '',
      hold: 2000,
    },
    {
      phase: 'smallbags',
      caption_en: 'Blue (3) and black (2) can never give us 4 of a kind — too few!',
      caption_id: 'Biru (3) dan hitam (2) tidak bisa memberi 4 warna sama — terlalu sedikit!',
      equation: '',
      hold: 2800,
    },
    {
      phase: 'worstcase',
      caption_en: 'Worst case: take 3 each from red, white, yellow; all 3 blue; all 2 black.',
      caption_id: 'Kasus terburuk: ambil 3 dari merah, putih, kuning; semua 3 biru; semua 2 hitam.',
      equation: '',
      hold: 2800,
    },
    {
      phase: 'total',
      caption_en: 'Total without 4-of-a-kind: 3 + 3 + 3 + 3 + 2 = 14',
      caption_id: 'Total tanpa 4 warna sama: 3 + 3 + 3 + 3 + 2 = 14',
      equation: '3+3+3+3+2 = 14',
      hold: 2500,
    },
    {
      phase: 'plusone',
      caption_en: 'Draw one more → must join red, white, or yellow → 4 of one colour!',
      caption_id: 'Ambil satu lagi → pasti ikut merah, putih, atau kuning → 4 warna sama!',
      equation: '14 + 1 = 15',
      hold: 2800,
    },
    {
      phase: 'result',
      caption_en: 'Minimum balls to guarantee 4 of the same colour = 15 → Answer A',
      caption_id: 'Minimum bola untuk menjamin 4 warna sama = 15 → Jawaban A',
      equation: '= 15',
      hold: 3000,
    },
  ]
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function ColorBall16B9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats = useMemo(() => buildBeats(lang), [lang])
  const finalIndex = beats.length - 1

  const index = useBeatControl(finalIndex, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[finalIndex]

  const isResult = beat.phase === 'result'
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE_BRAND, color: BLUE_BRAND }

  // Determine per-row display per beat phase
  function getRowState(entry: ColourEntry): { count: number; dimmed: boolean; warn: boolean } {
    const { phase } = beat
    if (phase === 'intro') {
      return { count: 0, dimmed: false, warn: false }
    }
    if (phase === 'smallbags') {
      const isSmall = entry.id === 'blue' || entry.id === 'black'
      return { count: entry.maxBefore4, dimmed: !isSmall, warn: isSmall }
    }
    if (phase === 'worstcase' || phase === 'total') {
      return { count: entry.maxBefore4, dimmed: false, warn: false }
    }
    if (phase === 'plusone' || phase === 'result') {
      return { count: entry.maxBefore4, dimmed: false, warn: false }
    }
    return { count: 0, dimmed: false, warn: false }
  }

  const ariaLabel = lang === 'id'
    ? 'Penjelasan: Kasus terburuk — ambil 3 merah, 3 putih, 3 kuning, 3 biru, 2 hitam = 14 bola, belum ada 4 warna sama. Satu lagi pasti 4! Jadi 15 bola. Jawaban A.'
    : 'Explainer: Worst case — draw 3 red, 3 white, 3 yellow, 3 blue, 2 black = 14 balls with no 4-of-a-kind. One more guarantees 4! So 15 balls. Answer A.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

        {/* Colour rows */}
        <div style={{
          width: '100%',
          background: '#F9FAFB',
          borderRadius: 12,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          {COLOURS.map((entry) => {
            const { count, dimmed, warn } = getRowState(entry)
            return (
              <ColourRow
                key={entry.id}
                entry={entry}
                count={count}
                dimmed={dimmed}
                warn={warn}
                lang={lang}
              />
            )
          })}
        </div>

        {/* Equation chip */}
        <div style={{ minHeight: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                style={{
                  background: isResult ? GREEN : ORANGE,
                  borderRadius: 999,
                  padding: '4px 18px',
                  fontSize: 15,
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'inherit',
                  letterSpacing: 0.4,
                }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          style={{
            ...captionStyle,
            width: '100%',
            borderRadius: 14,
            border: '2px solid',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.4,
          }}
        >
          {lang === 'id' ? beat.caption_id : beat.caption_en}
        </div>

      </div>
    </div>
  )
}
