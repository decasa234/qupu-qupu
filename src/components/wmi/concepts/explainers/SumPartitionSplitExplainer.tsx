import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildSumPartitionSteps } from './logicSteps'
import { LogicFrame } from './LogicVisuals'
import { useLogicBeat } from './useLogicBeat'

interface Params { small: number; k: number }

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'

// Tape width in px — fits inside LogicFrame's max-w-[440px] container
const TAPE_W = 400
const TAPE_H = 56

export default function SumPartitionSplitExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildSumPartitionSteps((params ?? {}) as Params, lang), [params, lang])
  const { beat } = useLogicBeat(story, props)

  // Defensive: ensure all derived values are finite and positive
  const k = Number.isFinite(story.k) && story.k > 0 ? story.k : 2
  const parts = Number.isFinite(story.parts) && story.parts > 0 ? story.parts : k + 1
  const total = Number.isFinite(story.total) && story.total > 0 ? story.total : parts * (story.answer ?? 1)
  const answer = Number.isFinite(story.answer) && story.answer > 0 ? story.answer : Math.round(total / parts)

  const phase = beat.phase
  const isRina = phase === 'rina'
  const isDoni = phase === 'doni'
  const isParts = phase === 'parts'
  const isResult = phase === 'result'

  // Which segments are visible by phase
  // phase 'rina':  segment 0 only (Rina's 1 part)
  // phase 'doni':  segments 0..parts-1 (all; Doni's k parts added)
  // phase 'parts': all segments (same as doni but bracket appears)
  // phase 'result': all segments with per-part value + answer pulse
  const visibleCount = isRina ? 1 : parts

  const segW = TAPE_W / parts

  return (
    <LogicFrame beat={beat} label="Tape diagram: ratio partition">
      <div className="flex flex-col items-center gap-3" style={{ width: TAPE_W }}>

        {/* Total bracket (phases: parts, result) */}
        <div style={{ width: TAPE_W, height: 28, position: 'relative' }}>
          {(isParts || isResult) && (
            <motion.div
              key="total-bracket"
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              {/* Bracket line */}
              <div style={{ width: TAPE_W, height: 2, background: '#64748B', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: 2, height: 8, background: '#64748B' }} />
                <div style={{ position: 'absolute', right: 0, top: 0, width: 2, height: 8, background: '#64748B' }} />
              </div>
              <span
                className="font-display font-extrabold tabular-nums"
                style={{ fontSize: 13, color: '#475569', marginTop: 2 }}
              >
                {total}
              </span>
            </motion.div>
          )}
        </div>

        {/* TAPE */}
        <div
          style={{
            width: TAPE_W,
            height: TAPE_H,
            display: 'flex',
            borderRadius: 8,
            overflow: 'hidden',
            border: '2px solid #CBD5E1',
            position: 'relative',
          }}
        >
          {Array.from({ length: parts }, (_, i) => {
            const isRinaSeg = i === 0
            const visible = i < visibleCount
            // Color: Rina = blue, Doni = orange
            const segColor = isRinaSeg ? BLUE : ORANGE
            // On result phase, Rina's segment pulses green
            const fillColor = isResult && isRinaSeg ? GREEN : segColor

            // Label inside segment
            const showLabel = visible && !isResult
            const labelText = isRinaSeg ? 'Rina' : 'Doni'

            // Value inside segment (result phase)
            const showValue = isResult && visible

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRight: i < parts - 1 ? '2px solid rgba(255,255,255,0.35)' : undefined,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Segment fill — grows in width from 0 */}
                {visible && (
                  <motion.div
                    key={`seg-${i}-${phase}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: fillColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    initial={{ scaleX: 0, originX: '0%' }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 26,
                      // Doni segments stagger slightly; Rina always instant
                      delay: isRinaSeg ? 0 : (i - 1) * 0.07,
                    }}
                  >
                    {showLabel && (
                      <motion.span
                        className="font-display font-black"
                        style={{ fontSize: segW < 48 ? 10 : 13, color: '#fff', userSelect: 'none' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: isRinaSeg ? 0.1 : (i - 1) * 0.07 + 0.15 }}
                      >
                        {labelText}
                      </motion.span>
                    )}

                    {showValue && (
                      <motion.span
                        className="font-display font-black tabular-nums"
                        style={{
                          fontSize: segW < 44 ? 11 : 14,
                          color: '#fff',
                          userSelect: 'none',
                        }}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={isRinaSeg ? { scale: [1, 1.18, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 20,
                          delay: i * 0.06,
                        }}
                      >
                        {answer}
                      </motion.span>
                    )}
                  </motion.div>
                )}

                {/* Empty slot styling */}
                {!visible && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: '#F1F5F9',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Below-tape annotation row */}
        <div style={{ width: TAPE_W, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Phase 'parts': show "1 + k = parts" equation */}
          {isParts && (
            <motion.span
              key="parts-eq"
              className="font-display font-extrabold tabular-nums"
              style={{ fontSize: 15, color: '#475569' }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              1 + {k} = {parts}
            </motion.span>
          )}

          {/* Phase 'result': show ÷ equation with answer highlighted */}
          {isResult && (
            <motion.div
              key="result-eq"
              className="flex items-center gap-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <span className="font-display font-extrabold tabular-nums" style={{ fontSize: 15, color: '#475569' }}>
                {total} ÷ {parts} =
              </span>
              <motion.span
                className="font-display font-black tabular-nums"
                style={{ fontSize: 18, color: GREEN }}
                initial={{ scale: 0.7 }}
                animate={{ scale: [1, 1.18, 1] }}
                transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.15 }}
              >
                {answer}
              </motion.span>
            </motion.div>
          )}

          {/* Phase 'rina' / 'doni': small indicator */}
          {(isRina || isDoni) && (
            <motion.span
              key={`phase-lbl-${phase}`}
              className="font-display font-bold"
              style={{ fontSize: 13, color: isRina ? BLUE : ORANGE }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {isRina
                ? (lang === 'id' ? '1 bagian' : '1 part')
                : (lang === 'id' ? `${k} bagian` : `${k} parts`)}
            </motion.span>
          )}
        </div>

      </div>
    </LogicFrame>
  )
}
