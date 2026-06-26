// OSN-16-SD-PROV-Q6 — animated explainer
// Highlights each shape in turn, showing perimeter count, landing on shape 1.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildFourShapesOSN16PQ6Steps } from './fourShapesOSN16PQ6Steps'

const CELL = 20

// ── Path data (same as Illustration) ────────────────────────────────────────
const PATH_1 =
  'M 20,120 L 40,120 L 40,100 L 60,100 L 60,120 ' +
  'L 80,120 L 80,100 L 100,100 L 100,80 L 80,80 ' +
  'L 80,40 L 100,40 L 100,20 L 80,20 L 80,0 ' +
  'L 60,0 L 60,20 L 40,20 L 40,0 L 20,0 ' +
  'L 20,20 L 0,20 L 0,40 L 20,40 L 20,80 ' +
  'L 0,80 L 0,100 L 20,100 Z'

const PATH_2 =
  'M 0,120 L 100,120 L 100,80 L 80,80 L 80,40 ' +
  'L 100,40 L 100,0 L 0,0 L 0,40 L 20,40 ' +
  'L 20,80 L 0,80 Z'

const PATH_3 =
  'M 0,120 L 100,120 L 100,40 L 60,40 L 60,0 ' +
  'L 40,0 L 40,40 L 0,40 Z'

const PATH_4 = 'M 0,0 L 100,0 L 100,120 L 0,120 Z'

const W = CELL * 5
const H = CELL * 6
const GAP = 24
const LABEL_H = 28
const PAD = 16
const COL2 = PAD + W + GAP
const ROW2 = PAD + H + LABEL_H + GAP
const VW = PAD + W + GAP + W + PAD
const VH = PAD + H + LABEL_H + GAP + H + LABEL_H + PAD

// Config per shape number
const SHAPES: Array<{
  id: 1 | 2 | 3 | 4
  path: string
  fillBase: string
  fillActive: string
  stroke: string
  tx: number
  ty: number
}> = [
  { id: 1, path: PATH_1, fillBase: '#EFF6FF', fillActive: '#BFDBFE', stroke: '#1D4ED8', tx: PAD,  ty: PAD  },
  { id: 2, path: PATH_2, fillBase: '#F0FDF4', fillActive: '#BBF7D0', stroke: '#15803D', tx: COL2, ty: PAD  },
  { id: 3, path: PATH_3, fillBase: '#FEFCE8', fillActive: '#FDE047', stroke: '#A16207', tx: PAD,  ty: ROW2 },
  { id: 4, path: PATH_4, fillBase: '#FAF5FF', fillActive: '#E9D5FF', stroke: '#7E22CE', tx: COL2, ty: ROW2 },
]

export default function FourShapesOSN16PQ6Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const steps = useMemo(() => buildFourShapesOSN16PQ6Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  const GREEN     = '#059669'
  const GREEN_BG  = '#D1FAE5'
  const GREEN_INK = '#065F46'
  const BLUE      = '#2563EB'
  const BLUE_BG   = '#DBEAFE'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: keempat bangun dalam kotak 6×5. Bangun 1 punya lekukan paling banyak sehingga kelilingnya paling panjang (30 satuan).'
      : 'Explainer: all four shapes in a 6×5 box. Shape 1 has the most notches so the longest perimeter (30 units).'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* SVG panel */}
        <motion.div
          key={beat.focus ?? 'all'}
          initial={{ opacity: 0.75, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          className="w-full"
        >
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', maxWidth: VW, display: 'block', margin: '0 auto' }}
          >
            {SHAPES.map(({ id, path, fillBase, fillActive, stroke, tx, ty }) => {
              const active = beat.focus === null || beat.focus === id
              const winner = beat.result && id === 1
              return (
                <g key={id} transform={`translate(${tx},${ty})`} opacity={active ? 1 : 0.25}>
                  {/* faint grid */}
                  {Array.from({ length: 6 }, (_, r) =>
                    Array.from({ length: 5 }, (_, c) => (
                      <rect
                        key={`${r}-${c}`}
                        x={c * CELL}
                        y={r * CELL}
                        width={CELL}
                        height={CELL}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="0.5"
                      />
                    ))
                  )}
                  <path
                    d={path}
                    fill={active ? fillActive : fillBase}
                    stroke={stroke}
                    strokeWidth={active ? 3 : 1.5}
                    strokeLinejoin="round"
                  />
                  {/* Perimeter label on focused shape */}
                  {beat.focus === id && beat.perimLabel && (
                    <text
                      x={W / 2}
                      y={H / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill={winner ? GREEN_INK : stroke}
                      fontFamily="sans-serif"
                    >
                      {beat.perimLabel}
                    </text>
                  )}
                  {/* Shape number */}
                  <text
                    x={W / 2}
                    y={H + 20}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill={stroke}
                    fontFamily="sans-serif"
                    opacity={active ? 1 : 0.4}
                  >
                    {id}
                  </text>
                </g>
              )
            })}
          </svg>
        </motion.div>

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          className="w-full min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        >
          {beat.caption}
        </motion.div>

        {/* Answer chip */}
        {beat.result && (
          <motion.div
            key="chip"
            className="rounded-xl px-5 py-2 font-display text-base font-extrabold text-white"
            style={{ background: GREEN }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            {lang === 'id' ? 'Jawaban: 1' : 'Answer: 1'}
          </motion.div>
        )}
      </div>
    </div>
  )
}
