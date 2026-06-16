/**
 * P22G3Q9Explainer — post-answer animation for WMI-22P3A-Q9.
 *
 * Drives the SAME four-shape figure the static illustration draws (via the shared
 * Shapes22G3Q9 primitive), ringing one shape per beat while a perimeter ledger
 * fills in: arcs cancel → P = 52, R = 60, S = 64. Longest S, shortest P → the
 * option pairing them correctly is B.
 *
 * SSR-safe, deterministic. No Math.random, no Date at module top.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Shapes22G3Q9, PERIM } from './P22G3Q9Illustration'
import { buildP22G3Q9Steps } from './p22G3Q9Steps'

const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const SHELL = '#F0F7FC'
const RING = '#cfe8f5'

export default function P22G3Q9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Strategy: matched arcs cancel, so compare straight-edge perimeters. P = ${PERIM.P}, R = ${PERIM.R}, S = ${PERIM.S}. Longest is S, shortest is P, so the correct pairing is option B.`,
    `Strategi: busur yang sepadan saling meniadakan, jadi bandingkan keliling garis lurus. P = ${PERIM.P}, R = ${PERIM.R}, S = ${PERIM.S}. Terpanjang S, terpendek P, jadi pasangan yang benar adalah opsi B.`,
  )

  const isResult = beat.result

  // Which ledger rows are revealed by this beat (cumulative).
  const order: Array<'P' | 'R' | 'S'> = ['P', 'R', 'S']
  const revealedThrough = (() => {
    if (beat.phase === 'P') return 1
    if (beat.phase === 'R') return 2
    if (beat.phase === 'S' || beat.phase === 'result') return 3
    return 0
  })()

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: SHELL, borderColor: RING }}
      >
        <Shapes22G3Q9 emphasis={beat.emphasis} />

        {/* perimeter ledger — fixed height so layout never jumps */}
        <div className="flex h-8 items-center justify-center gap-2">
          {order.map((k, i) => {
            const shown = i < revealedThrough
            const isMax = k === 'S'
            const isMin = k === 'P'
            return (
              <motion.span
                key={k}
                initial={false}
                animate={{ opacity: shown ? 1 : 0.25, scale: shown ? 1 : 0.9 }}
                transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                className="flex h-7 items-center rounded-md px-2 text-sm font-extrabold"
                style={{
                  background: isResult && shown && isMax ? '#D1FAE5' : '#ffffff',
                  border: `2px solid ${isResult && shown && isMax ? GREEN : isResult && shown && isMin ? '#f59e0b' : BRAND_BLUE}`,
                  color: isResult && shown && isMax ? GREEN_INK : BRAND_BLUE,
                }}
              >
                {`${k} = ${PERIM[k]}`}
              </motion.span>
            )
          })}
        </div>

        {/* caption */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
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
