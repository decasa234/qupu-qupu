/**
 * SASMO 2019 Grade 4 Q14 — post-answer explainer: largest shaded fraction.
 *
 * Teaches "compare fractions, not sizes" beat by beat:
 *   Beat 0 — intro:       "Compare the shaded fraction, not total size."
 *   Beat 1 — A & B:       "A=5/8  B=1/2"
 *   Beat 2 — C & E:       "C=1/2  E=1/2"
 *   Beat 3 — highlight D: "D=12/16=3/4 — largest!"
 *   Beat 4 — result:      "3/4 > 5/8 > 1/2  →  Answer D."
 *
 * Reuses the five figure SVGs from ShadedFractionSASMO19G4Q14Illustration via
 * the ShadedFractionSASMO19G4Q14Option renderer (same visual, but displayed here
 * with choice-label overlays and highlight rings).
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  buildShadedFractionSASMO19G4Q14Steps,
  type ShadedFracBeat,
} from './shadedFractionSASMO19G4Q14Steps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const INK        = '#1F2937'
const SHADE_FILL = '#9CA3AF'
const STROKE     = '#374151'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const AMBER      = '#F59E0B'
const AMBER_BG   = '#FFF7ED'
const BLUE       = '#2563EB'

// ---------------------------------------------------------------------------
// Inline figure renderers (same SVG as Illustration file, self-contained)
// ---------------------------------------------------------------------------
function FigA() {
  const C = 28
  return (
    <svg viewBox={`0 0 ${C*3} ${C*2}`} width={84} height={56} aria-hidden>
      <rect x={0}   y={C}   width={C*3} height={C} fill="#fff" />
      <rect x={C}   y={0}   width={C}   height={C} fill="#fff" />
      <rect x={C}   y={0}   width={C}   height={C} fill={SHADE_FILL} />
      <polygon points={`0,${C} 0,${C*2} ${C},${C*2}`}            fill={SHADE_FILL} />
      <polygon points={`${C},${C} ${C*2},${C} ${C*2},${C*2}`}    fill={SHADE_FILL} />
      <polygon points={`${C*2},${C} ${C*2},${C*2} ${C*3},${C*2}`} fill={SHADE_FILL} />
      <rect x={0} y={C} width={C*3} height={C} fill="none" stroke={STROKE} strokeWidth={1}/>
      <rect x={C} y={0} width={C}   height={C} fill="none" stroke={STROKE} strokeWidth={1}/>
      <line x1={C}   y1={C} x2={C}   y2={C*2} stroke={STROKE} strokeWidth={1}/>
      <line x1={C*2} y1={C} x2={C*2} y2={C*2} stroke={STROKE} strokeWidth={1}/>
      <line x1={0}   y1={C}   x2={C}   y2={C*2} stroke={STROKE} strokeWidth={1}/>
      <line x1={C}   y1={C}   x2={C*2} y2={C*2} stroke={STROKE} strokeWidth={1}/>
      <line x1={C*2} y1={C}   x2={C*3} y2={C*2} stroke={STROKE} strokeWidth={1}/>
    </svg>
  )
}

function FigB() {
  const C = 24, COLS = 4, ROWS = 2, W = C*COLS, H = C*ROWS
  const tris = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c*C, y = r*C
      const ul = (c+r)%2===0
      tris.push(<polygon key={`${c}${r}`} points={ul?`${x},${y} ${x+C},${y} ${x},${y+C}`:`${x+C},${y} ${x+C},${y+C} ${x},${y+C}`} fill={SHADE_FILL}/>)
    }
  }
  const lines = []
  for (let i=0;i<=COLS;i++) lines.push(<line key={`v${i}`} x1={i*C} y1={0} x2={i*C} y2={H} stroke={STROKE} strokeWidth={1}/>)
  for (let i=0;i<=ROWS;i++) lines.push(<line key={`h${i}`} x1={0} y1={i*C} x2={W} y2={i*C} stroke={STROKE} strokeWidth={1}/>)
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) lines.push(<line key={`d${c}${r}`} x1={c*C} y1={r*C} x2={(c+1)*C} y2={(r+1)*C} stroke={STROKE} strokeWidth={1}/>)
  return <svg viewBox={`0 0 ${W} ${H}`} width={96} height={48} aria-hidden><rect x={0} y={0} width={W} height={H} fill="#fff"/>{tris}{lines}</svg>
}

function FigC() {
  const C = 24, N = 3, S = C*N
  const tris = []
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
    const x=c*C,y=r*C,ul=(c+r)%2===0
    tris.push(<polygon key={`${c}${r}`} points={ul?`${x},${y} ${x+C},${y} ${x},${y+C}`:`${x+C},${y} ${x+C},${y+C} ${x},${y+C}`} fill={SHADE_FILL}/>)
  }
  const lines = []
  for (let i=0;i<=N;i++) { lines.push(<line key={`v${i}`} x1={i*C} y1={0} x2={i*C} y2={S} stroke={STROKE} strokeWidth={1}/>); lines.push(<line key={`h${i}`} x1={0} y1={i*C} x2={S} y2={i*C} stroke={STROKE} strokeWidth={1}/>)}
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) lines.push(<line key={`d${c}${r}`} x1={c*C} y1={r*C} x2={(c+1)*C} y2={(r+1)*C} stroke={STROKE} strokeWidth={1}/>)
  return <svg viewBox={`0 0 ${S} ${S}`} width={72} height={72} aria-hidden><rect x={0} y={0} width={S} height={S} fill="#fff"/>{tris}{lines}</svg>
}

function FigD() {
  const C = 20, N = 4, S = C*N
  type K = 'F'|'TL'|'0'
  const MAP: K[][] = [['F','F','F','F'],['F','TL','TL','F'],['TL','F','F','TL'],['F','0','0','F']]
  const fills = []
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) {
    const x=c*C,y=r*C,k=MAP[r][c]
    if (k==='F') fills.push(<rect key={`${c}${r}`} x={x} y={y} width={C} height={C} fill={SHADE_FILL}/>)
    else if (k==='TL') fills.push(<polygon key={`${c}${r}`} points={`${x},${y} ${x+C},${y} ${x},${y+C}`} fill={SHADE_FILL}/>)
  }
  const lines = []
  for (let i=0;i<=N;i++) { lines.push(<line key={`v${i}`} x1={i*C} y1={0} x2={i*C} y2={S} stroke={STROKE} strokeWidth={1}/>); lines.push(<line key={`h${i}`} x1={0} y1={i*C} x2={S} y2={i*C} stroke={STROKE} strokeWidth={1}/>)}
  for (let r=0;r<N;r++) for (let c=0;c<N;c++) { const k=MAP[r][c]; if (k==='TL') lines.push(<line key={`d${c}${r}`} x1={(c+1)*C} y1={r*C} x2={c*C} y2={(r+1)*C} stroke={STROKE} strokeWidth={1}/>)}
  return <svg viewBox={`0 0 ${S} ${S}`} width={80} height={80} aria-hidden><rect x={0} y={0} width={S} height={S} fill="#fff"/>{fills}{lines}</svg>
}

function FigE() {
  const W=112,H=56
  return <svg viewBox={`0 0 ${W} ${H}`} width={112} height={56} aria-hidden><rect x={0} y={0} width={W} height={H} fill="#fff" stroke={STROKE} strokeWidth={1}/><polygon points={`0,0 0,${H} ${W},${H/2}`} fill={SHADE_FILL} stroke={STROKE} strokeWidth={1}/></svg>
}

const FIG_MAP: Record<string, () => JSX.Element> = { A: FigA, B: FigB, C: FigC, D: FigD, E: FigE }
const FRACTIONS: Record<string, string> = { A:'5/8', B:'1/2', C:'1/2', D:'3/4', E:'1/2' }
const LABELS = ['A','B','C','D','E'] as const

// ---------------------------------------------------------------------------
// FigureCard — single figure tile with optional highlight ring
// ---------------------------------------------------------------------------
interface FigureCardProps {
  label: string
  highlighted: boolean
  isAnswer: boolean
  showFraction: boolean
}
function FigureCard({ label, highlighted, isAnswer, showFraction }: FigureCardProps) {
  const Fig = FIG_MAP[label]
  const borderColor = isAnswer ? GREEN : highlighted ? AMBER : '#D1D5DB'
  const bgColor     = isAnswer ? GREEN_BG : highlighted ? AMBER_BG : '#F9FAFB'

  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '6px 8px',
        borderRadius: 8,
        border: `2px solid ${borderColor}`,
        background: bgColor,
        transition: 'border-color 0.3s, background 0.3s',
      }}
    >
      <Fig />
      <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{label}</div>
      {showFraction && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: isAnswer ? GREEN_TEXT : '#374151',
            fontFamily: 'monospace',
          }}
        >
          {FRACTIONS[label]}
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Explainer
// ---------------------------------------------------------------------------
export default function ShadedFractionSASMO19G4Q14Explainer({
  lang = 'en',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(() => buildShadedFractionSASMO19G4Q14Steps(lang as 'en' | 'id'), [lang])
  const holds = useMemo(() => story.steps.map((s) => s.hold), [story])

  const beatIndex = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds,
  })

  const beat: ShadedFracBeat = story.steps[beatIndex] ?? story.steps[0]

  const showFractionFor = (label: string): boolean => {
    if (beat.phase === 'intro') return false
    if (beat.phase === 'ab') return label === 'A' || label === 'B'
    if (beat.phase === 'ce') return label === 'C' || label === 'E' || label === 'A' || label === 'B'
    return true // highlight-d or result
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 8px' }}>
      {/* Figure grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {LABELS.map((label) => (
          <FigureCard
            key={label}
            label={label}
            highlighted={beat.highlight.includes(label)}
            isAnswer={beat.result && label === 'D'}
            showFraction={showFractionFor(label)}
          />
        ))}
      </div>

      {/* Equation row */}
      {beat.equation && (
        <motion.div
          key={beat.equation}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'monospace',
            fontSize: 15,
            fontWeight: 700,
            color: beat.result ? GREEN_TEXT : BLUE,
            background: beat.result ? GREEN_BG : '#EFF6FF',
            borderRadius: 8,
            padding: '6px 14px',
          }}
        >
          {beat.equation}
        </motion.div>
      )}

      {/* Caption */}
      <motion.div
        key={beat.caption}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontSize: 13,
          color: INK,
          textAlign: 'center',
          maxWidth: 380,
          lineHeight: 1.5,
        }}
      >
        {beat.caption}
      </motion.div>
    </div>
  )
}
