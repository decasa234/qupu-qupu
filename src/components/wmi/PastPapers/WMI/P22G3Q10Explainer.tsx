/**
 * P22G3Q10Explainer — post-answer animation for WMI-22P3A-Q10.
 *
 * Walks the min-corner-sum method beat by beat on the SAME net the static figure
 * draws (via the shared NetGrid primitive): find the three opposite-face pairs,
 * then take the smaller of each pair — landing on 3 + 8 + 3 = 14 (answer B).
 *
 * SSR-safe, deterministic. No Math.random, no Date at module top.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { NetGrid, VIEW_W, VIEW_H, NET_PAD } from './P22G3Q10Illustration'
import { buildP22G3Q10Steps } from './p22G3Q10Steps'

const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const SHELL = '#F2FBF1'
const RING = '#cdeacb'

const DISPLAY_W = Math.min(280, VIEW_W)

export default function P22G3Q10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    `Strategy: opposite faces are 5 and 3, 8 and 9, and the caps 3 and 4. A corner uses one from each pair, so the smallest sum is 3 + 8 + 3 = ${story.answer}, answer B.`,
    `Strategi: sisi berhadapan yaitu 5 dan 3, 8 dan 9, serta tutup 3 dan 4. Satu sudut memakai satu dari tiap pasangan, jadi jumlah terkecil 3 + 8 + 3 = ${story.answer}, jawaban B.`,
  )

  const isResult = beat.result

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: RING }}
      >
        {/* animated net */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width={DISPLAY_W}
            style={{ display: 'block' }}
            aria-hidden="true"
          >
            <g transform={`translate(${NET_PAD}, ${NET_PAD})`}>
              <NetGrid highlight={beat.highlight} dimmed={beat.dimmed} />
            </g>
          </svg>
        </motion.div>

        {/* picked-values strip — fixed height so the layout never jumps */}
        <div className="flex h-9 items-center justify-center gap-2">
          {beat.picked.map((v, i) => (
            <motion.span
              key={`${i}-${v}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className="flex items-center"
            >
              {i > 0 && <span className="mr-2 font-bold" style={{ color: BRAND_BLUE }}>+</span>}
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-extrabold"
                style={{ background: '#fde68a', border: `2px solid ${BRAND_BLUE}`, color: BRAND_BLUE }}
              >
                {v}
              </span>
            </motion.span>
          ))}
          {beat.result && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-1 text-base font-extrabold"
              style={{ color: GREEN_INK }}
            >
              {`= ${story.answer}`}
            </motion.span>
          )}
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
