import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildGrowingFigureNthTermSteps,
  layoutPictures,
  pickCellSize,
} from './growingFigureNthTermSteps'
import { useBeatControl } from './useBeatControl'
import { Polyomino } from '../../PastPapers/WMI/primitives/Polyomino'

// The same strip of pictures, in the same place, every single beat. Nothing ever
// moves or resizes — the pictures only change colour, and numbers appear beneath
// them as they are earned: counts first, then the jumps between them, then the
// rule, and only at the very end does the dashed slot stop saying "?".
//
// Geometry belongs to Polyomino and to `layoutPictures`; this file supplies data
// and the beat colours.

const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const PEACH_PALE = '#FFEBDA'
const MUTED = '#9AA2AE'

const GAP = 18
const PAD = 2
const STRIP_WIDTH = 230
const CAPTION = 16
const JUMP_ROW = 16

export default function GrowingFigureNthTermExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildGrowingFigureNthTermSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const { pictures } = story
  const cell = pickCellSize(pictures, STRIP_WIDTH, GAP, PAD)
  const strip = layoutPictures(pictures, cell, GAP, PAD)

  const slotSize = Math.max(30, Math.round(cell * 1.7))
  const slotX = strip.width + GAP * 1.5
  const slotY = strip.height - slotSize
  // A little air on the right so a caption wider than the slot still fits.
  const width = slotX + slotSize + 14
  const top = JUMP_ROW
  const height = top + strip.height + CAPTION

  const slotStyle =
    beat.slotState === 'solved'
      ? { fill: GREEN_SOFT, stroke: GREEN, ink: GREEN_INK }
      : beat.slotState === 'wrong'
        ? { fill: ROSE_SOFT, stroke: ROSE, ink: ROSE }
        : { fill: AMBER_SOFT, stroke: AMBER, ink: AMBER }

  const captionStyle =
    beat.phase === 'trap'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.phase === 'result'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const focus = {
    setup: T('The drawings', 'Gambar yang ada'),
    count: T('Count them', 'Hitung dulu'),
    jump: T('The jumps', 'Lompatannya'),
    rule: T('The rule', 'Aturannya'),
    trap: T('Wrong road', 'Jalan yang salah'),
    result: T('Picture asked for', 'Gambar yang ditanya'),
  }[beat.phase]

  const ariaLabel = T(
    `Strategy: count each drawn picture, look at the jumps between them, read off how picture n is built, check that rule against the drawings, then use it on the picture nobody drew — which gives ${story.answer}.`,
    `Strategi: hitung tiap gambar yang ada, lihat lompatan antar gambar, baca cara gambar ke-n dibangun, cek aturan itu pada gambar yang ada, lalu pakai pada gambar yang tidak digambar — hasilnya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span
            className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide"
            style={{ color: MUTED }}
          >
            {T('Growing pattern', 'Pola bertumbuh')}
          </span>
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{
              background: beat.phase === 'result' ? GREEN_SOFT : AMBER_SOFT,
              borderColor: beat.phase === 'result' ? GREEN : AMBER,
              color: beat.phase === 'result' ? GREEN_INK : '#8A6100',
            }}
          >
            {focus}
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: '17rem' }}>
          {strip.boxes.map((box, i) => (
            <g key={`p${i}`} transform={`translate(${box.x}, ${top + box.y})`}>
              <Polyomino
                cells={pictures[i]}
                cellSize={cell}
                pad={PAD}
                fill={beat.lit[i] ? PEACH : PEACH_PALE}
                stroke={beat.lit[i] ? BLUE : MUTED}
                strokeWidth={1.5}
              />
            </g>
          ))}

          {/* Picture number, then the count once it has been counted. */}
          {strip.boxes.map((box, i) => (
            <text
              key={`c${i}`}
              x={box.x + box.w / 2}
              y={top + strip.height + CAPTION - 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={800}
              fill={beat.counts[i] ? GREEN_INK : MUTED}
            >
              {beat.counts[i] ? `${story.labels[i]}: ${beat.counts[i]}` : story.labels[i]}
            </text>
          ))}

          {/* The jump between two neighbours, above the gap that separates them. */}
          {beat.jumps.map((jump, i) =>
            jump === '' ? null : (
              <text
                key={`j${i}`}
                x={(strip.boxes[i].x + strip.boxes[i].w + strip.boxes[i + 1].x) / 2}
                y={11}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill={AMBER}
              >
                {jump}
              </text>
            ),
          )}

          {/* The picture nobody drew. */}
          <rect
            x={slotX}
            y={top + slotY}
            width={slotSize}
            height={slotSize}
            rx={7}
            fill={slotStyle.fill}
            stroke={slotStyle.stroke}
            strokeWidth={1.8}
            strokeDasharray={beat.slotState === 'asked' ? '5 4' : undefined}
          />
          <text
            x={slotX + slotSize / 2}
            y={top + slotY + slotSize / 2 + 4}
            textAnchor="middle"
            fontSize={beat.slot.length > 3 ? 11 : 13}
            fontWeight={800}
            fill={slotStyle.ink}
          >
            {beat.slot}
          </text>
          <text
            x={slotX + slotSize / 2}
            y={top + strip.height + CAPTION - 4}
            textAnchor="middle"
            fontSize={10}
            fontWeight={800}
            fill={MUTED}
          >
            {story.slotLabel}
          </text>
        </svg>

        {/* The rose chip naming the wrong road, or the answer. */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-2">
          {beat.trapNumber !== null && (
            <span
              className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path
                  d="M3 3 L13 13 M13 3 L3 13"
                  fill="none"
                  stroke={ROSE}
                  strokeWidth={2.6}
                  strokeLinecap="round"
                />
              </svg>
              {beat.trapNumber}
            </span>
          )}
          {beat.reveal !== null && (
            <motion.span
              initial={still ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }}
            >
              {T('Answer', 'Jawaban')} {beat.reveal}
            </motion.span>
          )}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
