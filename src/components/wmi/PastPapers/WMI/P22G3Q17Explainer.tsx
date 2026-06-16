/**
 * P22G3Q17Explainer — post-answer animation for WMI-22P3A-Q17.
 *
 * Drives the SAME isometric cube primitive the static figure uses (IsoCubes):
 * count the L-solid layer by layer, apply the table to every layer, rebuild the
 * solid, and conclude the matching picture is option D.
 *
 * SSR-safe, deterministic. No Math.random, no Date at module top.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { IsoCubes, VIEW_W, VIEW_H } from './P22G3Q17Illustration'
import { buildP22G3Q17Steps } from './p22G3Q17Steps'

const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const SHELL = '#FCF2F7'
const RING = '#f0c9dd'

// Isometric layer-ring helpers must match P22G3Q17Illustration's basis.
const UZ = 38
const OX = 40
const OY = 170

export default function P22G3Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G3Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    'Strategy: count the L-solid one layer at a time, apply the table to every layer (add and remove cubes), then rebuild. The picture matching the rebuilt solid is option D.',
    'Strategi: hitung bangun L lapis demi lapis, terapkan tabel ke setiap lapisan (tambah dan buang kubus), lalu susun ulang. Gambar yang cocok adalah opsi D.',
  )

  const isResult = beat.result

  // Highlight band for the emphasised layer (a faint horizontal slab marker).
  const layerBand =
    beat.emphasisLayer != null ? (
      <motion.rect
        key={`band-${beat.emphasisLayer}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        x={6}
        y={OY - beat.emphasisLayer * UZ - UZ - 6}
        width={VIEW_W - 12}
        height={UZ + 12}
        rx={8}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={2.5}
        strokeDasharray="6 4"
      />
    ) : null

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: SHELL, borderColor: RING }}
      >
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width="100%"
            style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
            aria-hidden="true"
          >
            {layerBand}
            <IsoCubes cells={beat.cells} ox={OX} oy={OY} />
          </svg>
        </motion.div>

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
