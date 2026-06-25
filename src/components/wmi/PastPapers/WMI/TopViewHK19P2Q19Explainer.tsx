// Post-answer explainer for HKIMO-19-P2H-Q19.
// "At least how many squares can be seen if viewing the figure below from the top?" — answer: 4.
//
// Animation strategy:
//   intro    — all cubes dimmed; explain that stacked cubes share one top-view cell
//   project  — topmost cube of each column turns gold; non-top cubes stay dim
//   count    — same highlighting + 2D top-view grid (cells A–D) fades in
//   answer   — all cubes green + grid turns green + count "4" pops

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { HK19P2Q19_CUBES } from './TopViewHK19P2Q19Illustration'
import { buildTopViewHK19P2Q19Steps } from './topViewHK19P2Q19Steps'
import type { TopViewPhase } from './topViewHK19P2Q19Steps'

const GREEN = '#10B981'
const DIM = '#C8D8E8'

// Topmost cube key for each column (x,y,z) — these are visible from above
const TOP_CUBE_KEYS = new Set(['0,1,0', '1,1,1', '1,0,0', '2,0,1'])

function buildColoredCubes(phase: TopViewPhase): IsoCube[] {
  switch (phase) {
    case 'intro':
      return HK19P2Q19_CUBES.map((c) => ({ ...c, color: DIM }))
    case 'project':
    case 'count':
      return HK19P2Q19_CUBES.map((c) => ({
        ...c,
        color: TOP_CUBE_KEYS.has(`${c.x},${c.y},${c.z}`)
          ? ISO_GOLD_PALETTE.top
          : DIM,
      }))
    case 'answer':
      return HK19P2Q19_CUBES.map((c) => ({ ...c, color: GREEN }))
    default:
      return HK19P2Q19_CUBES
  }
}

// ---------------------------------------------------------------------------
// 2-D top-view grid (3 cols × 2 rows covering the 4 occupied cells)
// ---------------------------------------------------------------------------

// Occupied cells [col, row] and their labels A–D
const OCCUPIED: [number, number, string][] = [
  [0, 1, 'A'], // (x=0, y=1)
  [1, 1, 'B'], // (x=1, y=1)
  [1, 0, 'C'], // (x=1, y=0)
  [2, 0, 'D'], // (x=2, y=0)
]

function TopViewGrid({ green }: { green: boolean }) {
  const cs = 28
  const cols = 3
  const rows = 2
  const w = cols * cs
  const h = rows * cs

  return (
    <svg
      width={w + 4}
      height={h + 4}
      viewBox={`-2 -2 ${w + 4} ${h + 4}`}
      aria-hidden="true"
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const entry = OCCUPIED.find(([oc, or]) => oc === c && or === r)
          const filled = entry != null
          return (
            <g key={`${c},${r}`}>
              <rect
                x={c * cs}
                y={(rows - 1 - r) * cs}
                width={cs}
                height={cs}
                fill={filled ? (green ? '#D1FAE5' : '#FEF3C7') : '#F3F4F6'}
                stroke="#6B7280"
                strokeWidth={1}
                rx={2}
              />
              {filled && (
                <text
                  x={c * cs + cs / 2}
                  y={(rows - 1 - r) * cs + cs / 2 + 5}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill={green ? '#065F46' : '#92400E'}
                >
                  {entry[2]}
                </text>
              )}
            </g>
          )
        }),
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------

export default function TopViewHK19P2Q19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTopViewHK19P2Q19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildColoredCubes(beat.phase)
  const showGrid = beat.phase === 'count' || beat.phase === 'answer'
  const isAnswer = beat.phase === 'answer'

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan tampak atas: 4 kolom berbeda → 4 persegi terlihat dari atas.'
      : 'Top-view explainer: 4 distinct columns → 4 squares visible from the top.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Isometric cube figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={26}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* 2-D top-view grid */}
        {showGrid && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="font-display text-xs font-bold text-gray-500">
              {lang === 'id' ? 'Tampak Atas' : 'Top View'}
            </span>
            <TopViewGrid green={isAnswer} />
          </motion.div>
        )}

        {/* Answer count pop */}
        {isAnswer && (
          <motion.div
            key="answer-4"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            4
          </motion.div>
        )}

        {/* Beat caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
