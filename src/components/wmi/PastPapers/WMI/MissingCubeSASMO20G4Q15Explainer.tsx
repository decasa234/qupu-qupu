/**
 * SASMO-20-G4-Q15 — post-answer animated explainer.
 *
 * Teaches the "match each face's triangle" strategy beat-by-beat:
 *   Beat 0 — identify the missing corner on the large cube.
 *   Beat 1 — read the required triangle direction on each of the 3 faces.
 *   Beat 2 — B and E have correct faces; E is a mirror (L/R swapped) → doesn't fit.
 *   Beat 3 — answer: B.
 *
 * Imports OptionCubeSVG and OPTION_CONFIGS from MissingCubeSASMO20G4Q15Illustration
 * so the pieces look identical to the stem's options.
 */

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import MissingCubeSASMO20G4Q15Illustration, {
  OptionCubeSVG,
  OPTION_CONFIGS,
} from './MissingCubeSASMO20G4Q15Illustration'
import {
  buildMissingCubeSASMO20G4Q15Steps,
  type MissingCubeBeat,
} from './missingCubeSASMO20G4Q15Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const INK       = '#1F2937'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const BLUE      = '#3B82F6'
const BLUE_BG   = '#EFF6FF'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FFFBEB'
const LABEL_C   = '#6B7280'

// ── option display ────────────────────────────────────────────────────────────

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

const OPT_SVG_VB_X = -6
const OPT_SVG_VB_Y = -(44 * 0.5 + 6)
const OPT_SVG_VB_W = 2 * 44 * 0.866 + 12
const OPT_SVG_VB_H = 44 * 0.5 + 44 + 12

interface OptionPanelProps {
  label: string
  highlight: string[]
  beat: MissingCubeBeat
}

function OptionPanel({ label, highlight, beat }: OptionPanelProps) {
  const cfg = OPTION_CONFIGS[label]
  const isHighlighted = highlight.length === 0 || highlight.includes(label)
  const isAnswer = beat.id === 'answer' && label === 'B'
  const isCrossed = beat.id === 'match' && !['B', 'E'].includes(label)

  return (
    <motion.div
      key={`${label}-${beat.id}`}
      initial={{ opacity: 0.3, scale: 0.9 }}
      animate={{
        opacity: isHighlighted ? 1 : 0.3,
        scale: isAnswer ? 1.12 : 1,
      }}
      transition={{ duration: 0.35 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
    >
      <svg
        viewBox={`${OPT_SVG_VB_X} ${OPT_SVG_VB_Y} ${OPT_SVG_VB_W.toFixed(1)} ${OPT_SVG_VB_H.toFixed(1)}`}
        width={72}
        height={72}
        aria-hidden
        style={{ display: 'block' }}
      >
        <OptionCubeSVG cfg={cfg} dim={!isHighlighted} />
        {isCrossed && (
          <line
            x1={OPT_SVG_VB_X + 8} y1={OPT_SVG_VB_Y + 8}
            x2={OPT_SVG_VB_X + OPT_SVG_VB_W - 8} y2={OPT_SVG_VB_Y + OPT_SVG_VB_H - 8}
            stroke="#EF4444" strokeWidth={3} strokeLinecap="round"
          />
        )}
      </svg>
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: isAnswer ? GREEN : isHighlighted ? INK : LABEL_C,
        }}
      >
        {label}{isAnswer ? ' ✓' : ''}
      </span>
    </motion.div>
  )
}

// ── beat content card ─────────────────────────────────────────────────────────

interface BeatCardProps { beat: MissingCubeBeat; lang: string }

function BeatCard({ beat, lang }: BeatCardProps) {
  const isId = lang === 'id'
  const headline = isId ? beat.headline_id : beat.headline_en
  const detail   = isId ? beat.detail_id   : beat.detail_en

  const bgColor =
    beat.id === 'answer' ? GREEN_BG :
    beat.id === 'match'  ? AMBER_BG :
    BLUE_BG

  const headColor =
    beat.id === 'answer' ? GREEN  :
    beat.id === 'match'  ? AMBER  :
    BLUE

  return (
    <motion.div
      key={beat.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: bgColor,
        borderRadius: 10,
        padding: '10px 14px',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div style={{ fontWeight: 700, color: headColor, fontSize: 15, marginBottom: 4 }}>
        {headline}
      </div>
      <div style={{ color: INK, fontSize: 13, lineHeight: 1.5 }}>
        {detail}
      </div>
    </motion.div>
  )
}

// ── main explainer ────────────────────────────────────────────────────────────

export default function MissingCubeSASMO20G4Q15Explainer({ lang = 'id' }: ExplainerProps) {
  const storyboard = buildMissingCubeSASMO20G4Q15Steps(lang as 'en' | 'id')
  // Local beat navigation (house pattern — see ShadedSquare20B5Explainer).
  const totalBeats = storyboard.beats.length
  const [beatIndex, setBeatIndex] = useState(0)
  const prev = useCallback(() => setBeatIndex((i) => Math.max(i - 1, 0)), [])
  const next = useCallback(
    () => setBeatIndex((i) => Math.min(i + 1, totalBeats - 1)),
    [totalBeats],
  )

  const currentBeat: MissingCubeBeat = storyboard.beats[beatIndex]
  const highlight   = currentBeat.highlight

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>

      {/* Stem cube (always shown) */}
      {beatIndex === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <MissingCubeSASMO20G4Q15Illustration />
        </motion.div>
      )}

      {/* Options grid */}
      {beatIndex > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {LABELS.map((label) => (
            <OptionPanel
              key={label}
              label={label}
              highlight={highlight}
              beat={currentBeat}
            />
          ))}
        </div>
      )}

      {/* Beat content */}
      <BeatCard beat={currentBeat} lang={lang} />

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 4 }}>
        <button
          onClick={prev}
          disabled={beatIndex === 0}
          style={{
            padding: '6px 16px', borderRadius: 6, border: '1.5px solid #D1D5DB',
            background: '#F9FAFB', color: INK, fontSize: 13, cursor: beatIndex === 0 ? 'not-allowed' : 'pointer',
            opacity: beatIndex === 0 ? 0.4 : 1,
          }}
        >
          ← Prev
        </button>
        <span style={{ fontSize: 12, color: LABEL_C, alignSelf: 'center' }}>
          {beatIndex + 1} / {totalBeats}
        </span>
        <button
          onClick={next}
          disabled={beatIndex === totalBeats - 1}
          style={{
            padding: '6px 16px', borderRadius: 6, border: '1.5px solid #D1D5DB',
            background: beatIndex === totalBeats - 1 ? '#F9FAFB' : '#1F2937',
            color: beatIndex === totalBeats - 1 ? LABEL_C : '#FFFFFF',
            fontSize: 13, cursor: beatIndex === totalBeats - 1 ? 'not-allowed' : 'pointer',
            opacity: beatIndex === totalBeats - 1 ? 0.4 : 1,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
