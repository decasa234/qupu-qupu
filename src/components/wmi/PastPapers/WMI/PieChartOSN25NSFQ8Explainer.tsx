// OSN-25-SD-NAS-SEMIFINAL-Q8 — animated explainer
//
// Reuses the pie-sector geometry and SectorLabel from the illustration.
// Animates through 6 beats: knowns → remaining → ratio → a° → b° → diff.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  SectorLabel,
  buildSectorGeo,
} from './PieChartOSN25NSFQ8Illustration'
import { buildPieChartOSN25NSFQ8Steps } from './pieChartOSN25NSFQ8Steps'

// Colours
const RESULT_BG = '#f0fdf4'
const RESULT_BORDER = '#86efac'
const DEFAULT_BG = '#f8fafc'
const DEFAULT_BORDER = '#e2e8f0'
const EQ_COLOR = '#1e40af'
const CAPTION_COLOR = '#334155'

export default function PieChartOSN25NSFQ8Explainer({
  lang = 'id',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(
    () => buildPieChartOSN25NSFQ8Steps(lang as 'en' | 'id'),
    [lang],
  )
  const beatIdx = useBeatControl(story.finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.steps.map((s) => s.hold),
  })
  const b = story.steps[beatIdx]

  const geo = useMemo(() => buildSectorGeo(), [])

  function isLit(key: string): boolean {
    if (b.highlight === 'all') return true
    if (b.highlight === 'both-unknown') return key === 'olahraga' || key === 'game'
    return b.highlight === key
  }

  function revealedLabel(key: string): string | null {
    if (key === 'game' && b.revealA) return '108°'
    if (key === 'olahraga' && b.revealB) return '72°'
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={SVG_W}
        height={SVG_H}
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {geo.map((s) => {
          const lit = isLit(s.key)
          return (
            <motion.g
              key={s.key}
              animate={{ opacity: lit ? 1 : 0.28 }}
              transition={{ duration: 0.35 }}
            >
              <path
                d={s.path}
                fill={s.color}
                stroke={s.strokeColor}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <SectorLabel
                lx={s.lx}
                ly={s.ly}
                lines={s.lines}
                sublabel={s.sublabel}
                varLabel={s.varLabel}
                revealedLabel={revealedLabel(s.key)}
              />
            </motion.g>
          )
        })}

        {/* Centre dot */}
        <circle cx={150} cy={148} r={3} fill="#334155" />
      </svg>

      {/* Caption card */}
      <div
        style={{
          maxWidth: SVG_W,
          width: '100%',
          padding: '8px 14px',
          background: b.result ? RESULT_BG : DEFAULT_BG,
          border: `1.5px solid ${b.result ? RESULT_BORDER : DEFAULT_BORDER}`,
          borderRadius: 10,
          fontSize: 13,
          lineHeight: 1.55,
          color: CAPTION_COLOR,
          textAlign: 'center',
        }}
      >
        {b.equation && (
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: b.result ? '#15803d' : EQ_COLOR,
              marginBottom: 5,
              letterSpacing: '0.01em',
            }}
          >
            {b.equation}
          </div>
        )}
        <div>{b.caption}</div>
      </div>
    </div>
  )
}
