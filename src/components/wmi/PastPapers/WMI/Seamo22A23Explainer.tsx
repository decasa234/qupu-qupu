/**
 * SEAMO-22-A-Q23 Explainer — "How many chicks equal ONE rabbit?"
 *
 * Animated beat-based walkthrough of the three-step chain substitution:
 *   Beat 0: Figure 1 — rabbit = 3 squirrels
 *   Beat 1: Figure 2 — squirrel = 3 ducks  → rabbit = 9 ducks
 *   Beat 2: Figure 3 — duck = 2 chicks      → rabbit = 18 chicks
 *   Beat 3: Figure 4 — conclusion: rabbit = 18 chicks ✓
 *
 * Uses motion from framer-motion for caption/scale transitions.
 * Imports animal glyphs from the illustration file.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  Rabbit,
  Squirrel,
  Duck,
  Chick,
  Fig1Scale,
  Fig2Scale,
  Fig3Scale,
  Row,
} from './Seamo22A23Illustration'
import { BalanceScale } from './primitives/BalanceScale'

// ── Palette (matches qupu tokens) ────────────────────────────────────────────
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const AMBER = '#D97706'
const AMBER_BG = '#FEF3C7'
const INK = '#1F2937'

// ── Beat definitions ──────────────────────────────────────────────────────────

interface Beat {
  figLabel_en: string
  figLabel_id: string
  caption_en: string
  caption_id: string
  chain_en: string
  chain_id: string
  result: boolean
  hold: number
}

const BEATS: Beat[] = [
  {
    figLabel_en: 'Figure 1',
    figLabel_id: 'Gambar 1',
    caption_en: '1 rabbit = 3 squirrels',
    caption_id: '1 kelinci = 3 tupai',
    chain_en: 'rabbit → 3 squirrels',
    chain_id: 'kelinci → 3 tupai',
    result: false,
    hold: 2200,
  },
  {
    figLabel_en: 'Figure 2',
    figLabel_id: 'Gambar 2',
    caption_en: '1 squirrel = 3 ducks → 1 rabbit = 3 × 3 = 9 ducks',
    caption_id: '1 tupai = 3 bebek → 1 kelinci = 3 × 3 = 9 bebek',
    chain_en: 'rabbit → 3 × 3 = 9 ducks',
    chain_id: 'kelinci → 3 × 3 = 9 bebek',
    result: false,
    hold: 2400,
  },
  {
    figLabel_en: 'Figure 3',
    figLabel_id: 'Gambar 3',
    caption_en: '1 duck = 2 chicks → 1 rabbit = 9 × 2 = 18 chicks',
    caption_id: '1 bebek = 2 anak ayam → 1 kelinci = 9 × 2 = 18 anak ayam',
    chain_en: 'rabbit → 9 × 2 = 18 chicks',
    chain_id: 'kelinci → 9 × 2 = 18 anak ayam',
    result: false,
    hold: 2600,
  },
  {
    figLabel_en: 'Answer',
    figLabel_id: 'Jawaban',
    caption_en: '1 rabbit = 18 chicks!',
    caption_id: '1 kelinci = 18 anak ayam!',
    chain_en: '1 rabbit = 3 × 3 × 2 = 18 chicks ✓',
    chain_id: '1 kelinci = 3 × 3 × 2 = 18 anak ayam ✓',
    result: true,
    hold: 3200,
  },
]

// ── Answer scale (Fig 4): 1 rabbit = 18 chicks ───────────────────────────────

function AnswerScale() {
  return (
    <BalanceScale
      tilt={0}
      panW={120}
      left={<Rabbit y={0} s={0.82} />}
      right={
        <>
          {/* 3 rows of 6 chicks */}
          {[0, 1, 2].map((row) => (
            <Row
              key={row}
              count={6}
              spacing={18}
              render={(x) => <Chick x={x} y={-row * 22} s={0.62} />}
            />
          ))}
        </>
      }
    />
  )
}

// ── Equation chain bar ────────────────────────────────────────────────────────

function ChainBar({ text, result }: { text: string; result: boolean }) {
  return (
    <div
      className="rounded-full px-4 py-1 text-xs font-bold"
      style={
        result
          ? { background: GREEN, color: '#FFFFFF' }
          : { background: AMBER_BG, border: `2px solid ${AMBER}`, color: AMBER }
      }
    >
      {text}
    </div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Seamo22A23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const holds = useMemo(() => BEATS.map((b) => b.hold), [])
  const index = useBeatControl(BEATS.length - 1, { ...props, holds })
  const beat = BEATS[index] ?? BEATS[BEATS.length - 1]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: rantai timbangan menunjukkan kelinci = 3 tupai, tupai = 3 bebek, bebek = 2 anak ayam. Jadi kelinci = 3 × 3 × 2 = 18 anak ayam.'
      : 'Explainer: the chain of balance scales shows rabbit = 3 squirrels, squirrel = 3 ducks, duck = 2 chicks. So rabbit = 3 × 3 × 2 = 18 chicks.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Figure label */}
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide"
            style={{ background: BLUE_BG, color: BLUE }}
          >
            {T(beat.figLabel_en, beat.figLabel_id)}
          </span>
        </div>

        {/* Active scale */}
        <motion.div
          key={`scale-${index}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="w-full"
        >
          {index === 0 && <Fig1Scale />}
          {index === 1 && <Fig2Scale />}
          {index === 2 && <Fig3Scale />}
          {index === 3 && <AnswerScale />}
        </motion.div>

        {/* Running chain */}
        <motion.div
          key={`chain-${index}`}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <ChainBar text={T(beat.chain_en, beat.chain_id)} result={beat.result} />
        </motion.div>

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: INK }
          }
        >
          {T(beat.caption_en, beat.caption_id)}
        </motion.div>
      </div>
    </div>
  )
}
