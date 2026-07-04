/**
 * SASMO-19-G2-Q6 — post-answer explainer: snowflake matching.
 *
 * Beat walk:
 *   0. intro  — show reference snowflake, name its features.
 *   1. checkA — Option A: 6 arms, no fork tips → eliminate.
 *   2. checkB — Option B: 8 arms but shorter branches, no between-arm diamonds → eliminate.
 *   3. checkD — Option D: 6 barbell arms, plain centre → eliminate.
 *   4. answer — Option C matches the reference exactly → answer C.
 *
 * Imports SnowflakeSASMO19G2Q6Illustration and SnowflakeSASMO19G2Q6Option so the
 * scene reads as the same snowflakes coming alive.
 */

import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import SnowflakeSASMO19G2Q6Illustration, {
  SnowflakeSASMO19G2Q6Option,
} from './SnowflakeSASMO19G2Q6Illustration'
import { buildSnowflakeSASMO19G2Q6Steps } from './snowflakeSASMO19G2Q6Steps'
import type { Lang } from './snowflakeSASMO19G2Q6Steps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const INK = '#1F2937'
const BLUE_BG = '#E1EFFB'
const RED = '#DC2626'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const GREY = '#9CA3AF'

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------

export default function SnowflakeSASMO19G2Q6Explainer(props: ExplainerProps) {
  const lang: Lang = (props.lang === 'id' ? 'id' : 'en')
  const { steps, finalIndex } = buildSnowflakeSASMO19G2Q6Steps(lang)

  const beatIndex = useBeatControl(finalIndex, {
    ...props,
    holds: steps.map((s) => s.hold),
  })

  const beat = steps[beatIndex] ?? steps[finalIndex]

  const choiceFor = (label: string) => ({ label, text: `Option ${label}` })

  const isEliminated = (label: string) => {
    if (label === 'A' && beatIndex >= 1) return true
    if (label === 'B' && beatIndex >= 2) return true
    if (label === 'D' && beatIndex >= 3) return true
    return false
  }

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        padding: '12px 8px',
        maxWidth: 420,
        margin: '0 auto',
      }}
    >
      {/* Reference snowflake header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 11, color: GREY, marginBottom: 4 }}>
          {lang === 'id' ? 'Referensi' : 'Reference'}
        </div>
        <SnowflakeSASMO19G2Q6Illustration />
      </div>

      {/* Option grid */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        {(['A', 'B', 'C', 'D'] as const).map((label) => {
          const active = beat.activeChoice === label
          const eliminated = isEliminated(label)
          const correct = beat.isAnswer && label === 'C'

          return (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 6,
                borderRadius: 10,
                border: `2px solid ${
                  correct
                    ? GREEN
                    : active && !eliminated
                    ? '#3B82F6'
                    : active && eliminated
                    ? RED
                    : '#E5E7EB'
                }`,
                background:
                  correct ? GREEN_BG : eliminated ? '#FEF2F2' : 'white',
                opacity: eliminated && !active ? 0.45 : 1,
                transition: 'all 0.3s ease',
                minWidth: 80,
              }}
            >
              <SnowflakeSASMO19G2Q6Option choice={choiceFor(label)} />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: correct ? GREEN_TEXT : eliminated ? RED : INK,
                }}
              >
                {eliminated && !correct ? '✗ ' : correct ? '✓ ' : ''}
                {label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={beatIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          style={{
            background: beat.result ? GREEN_BG : BLUE_BG,
            border: `1px solid ${beat.result ? GREEN : '#BFDBFE'}`,
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 13,
            color: beat.result ? GREEN_TEXT : INK,
            lineHeight: 1.55,
            textAlign: 'center',
          }}
        >
          {beat.caption}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
