import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import {
  buildConsecutiveSumSteps,
  type ConsecutiveSumBeat,
  type ConsecutiveSumParams,
  type ConsecutiveSumStoryboard,
} from './consecutiveSumSteps'

// House palette — literal hex so the animation reads the same everywhere.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const GREEN_INK = '#3C7000'
const CREAM = '#FAF6EF'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const INK_MUTED = '#8A93A3'
const FONT = 'Fredoka, sans-serif'

// Board geometry. One row of `n` boxes, pairing arcs above it, the "+1" ladder
// below it, and an equation strip at the foot.
const VW = 360
const VH = 210
const BOX_W = 42
const BOX_H = 44
const GAP = 14
const ROW_Y = 104

// Everything on the board is mounted on every beat and animated by opacity /
// colour only. That keeps the markup deterministic (server render === the
// current beat) and lets `initial={false}` skip entry animations entirely.
const ease = (reduce: boolean) =>
  reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 260, damping: 26 }
const fade = (reduce: boolean) => (reduce ? { duration: 0 } : { duration: 0.32 })

function Board({
  story,
  beat,
  lang,
  reduce,
}: {
  story: ConsecutiveSumStoryboard
  beat: ConsecutiveSumBeat
  lang: 'en' | 'id'
  reduce: boolean
}) {
  const { n, run, sum, pairCount, centerIndexes } = story
  const rowW = n * BOX_W + (n - 1) * GAP
  const x0 = (VW - rowW) / 2
  const cx = (i: number) => x0 + i * (BOX_W + GAP) + BOX_W / 2
  const revealed = new Set(beat.revealed)

  const totalText = lang === 'id' ? `Jumlah ${sum}` : `Total ${sum}`
  const totalW = totalText.length * 8 + 26

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      className="block"
      role="presentation"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x={0} y={0} width={VW} height={VH} fill={SHELL} rx={16} />

      {/* the one number we are given */}
      <g>
        <rect x={(VW - totalW) / 2} y={6} width={totalW} height={24} rx={12} fill={BLUE} />
        <text
          x={VW / 2}
          y={23}
          textAnchor="middle"
          fontSize={13.5}
          fontWeight={800}
          fontFamily={FONT}
          fill={CREAM}
        >
          {totalText}
        </text>
      </g>

      {/* pairing arcs: outermost pair first, nested inward */}
      {Array.from({ length: pairCount }, (_, k) => {
        const pair = k + 1
        const left = cx(k)
        const right = cx(n - 1 - k)
        const depth = 15 + (pairCount - pair) * 22
        const mid = (left + right) / 2
        const shown = beat.pairsShown >= pair
        const active = beat.activePair !== null && beat.activePair <= pair && shown
        const color = active ? ORANGE : BLUE
        const chip = beat.arcLabel !== null ? String(beat.arcLabel) : '='
        const chipW = beat.arcLabel !== null ? chip.length * 8 + 14 : 20
        return (
          <motion.g
            key={`arc-${pair}`}
            initial={false}
            animate={{ opacity: shown ? 1 : 0 }}
            transition={fade(reduce)}
          >
            <path
              d={`M ${left} ${ROW_Y - 3} Q ${mid} ${ROW_Y - 3 - depth * 2} ${right} ${ROW_Y - 3}`}
              fill="none"
              stroke={color}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <rect
              x={mid - chipW / 2}
              y={ROW_Y - 3 - depth - 9}
              width={chipW}
              height={18}
              rx={9}
              fill={SHELL}
              stroke={color}
              strokeWidth={2}
            />
            <text
              x={mid}
              y={ROW_Y - 3 - depth + 5}
              textAnchor="middle"
              fontSize={12}
              fontWeight={800}
              fontFamily={FONT}
              fill={color}
            >
              {chip}
            </text>
          </motion.g>
        )
      })}

      {/* the +1 / −1 badges that show why stepping inward keeps a pair's sum */}
      {pairCount >= 2 && (
        <motion.g
          initial={false}
          animate={{ opacity: beat.showCancel ? 1 : 0 }}
          transition={fade(reduce)}
        >
          <text
            x={cx(1)}
            y={ROW_Y - 12}
            textAnchor="middle"
            fontSize={13}
            fontWeight={800}
            fontFamily={FONT}
            fill={ORANGE}
          >
            +1
          </text>
          <text
            x={cx(n - 2)}
            y={ROW_Y - 12}
            textAnchor="middle"
            fontSize={13}
            fontWeight={800}
            fontFamily={FONT}
            fill={ORANGE}
          >
            −1
          </text>
        </motion.g>
      )}

      {/* the run itself: one box per number, filled in only once deduced */}
      {run.map((value, i) => {
        const isAnswer = beat.answerIndex === i
        const isCenter = beat.centerLit && centerIndexes.includes(i)
        const stroke = isAnswer ? GREEN : isCenter ? ORANGE : PEACH
        const fill = isAnswer ? '#F0F9E3' : isCenter ? '#FFF1E2' : CREAM
        const ink = isAnswer ? GREEN_INK : BLUE
        const bx = cx(i) - BOX_W / 2
        return (
          <motion.g
            key={`box-${i}`}
            initial={false}
            animate={{ opacity: 1 }}
            transition={ease(reduce)}
          >
            <motion.rect
              x={bx}
              y={ROW_Y}
              width={BOX_W}
              height={BOX_H}
              rx={11}
              initial={false}
              animate={{ fill, stroke, strokeWidth: isAnswer || isCenter ? 3.2 : 2.4 }}
              transition={fade(reduce)}
            />
            <motion.text
              x={cx(i)}
              y={ROW_Y + 30}
              textAnchor="middle"
              fontSize={18}
              fontWeight={700}
              fontFamily={FONT}
              fill={INK_MUTED}
              initial={false}
              animate={{ opacity: revealed.has(i) ? 0 : 0.75 }}
              transition={fade(reduce)}
            >
              ?
            </motion.text>
            <motion.text
              x={cx(i)}
              y={ROW_Y + 30}
              textAnchor="middle"
              fontSize={19}
              fontWeight={800}
              fontFamily={FONT}
              initial={false}
              animate={{ opacity: revealed.has(i) ? 1 : 0, fill: ink }}
              transition={fade(reduce)}
            >
              {value}
            </motion.text>
            {/* option letter, pinned to the box the question was asking for */}
            {beat.answerLabel && (
              <motion.g
                initial={false}
                animate={{ opacity: isAnswer ? 1 : 0 }}
                transition={fade(reduce)}
              >
                <circle cx={bx + 3} cy={ROW_Y + 3} r={10} fill={GREEN} />
                <text
                  x={bx + 3}
                  y={ROW_Y + 7.5}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={800}
                  fontFamily={FONT}
                  fill="#FFFFFF"
                >
                  {beat.answerLabel}
                </text>
              </motion.g>
            )}
          </motion.g>
        )
      })}

      {/* the ladder: each hop to the right adds 1 */}
      <motion.g
        initial={false}
        animate={{ opacity: beat.showSteps ? 1 : 0 }}
        transition={fade(reduce)}
      >
        {Array.from({ length: Math.max(0, n - 1) }, (_, i) => {
          const mid = (cx(i) + cx(i + 1)) / 2
          return (
            <g key={`step-${i}`}>
              <path
                d={`M ${cx(i)} 152 Q ${mid} 180 ${cx(i + 1)} 152`}
                fill="none"
                stroke={ORANGE}
                strokeWidth={1.8}
                strokeLinecap="round"
                opacity={0.65}
              />
              <rect x={mid - 12} y={157} width={24} height={17} rx={8} fill={SHELL} stroke={ORANGE} strokeWidth={1.8} />
              <text
                x={mid}
                y={170.5}
                textAnchor="middle"
                fontSize={11}
                fontWeight={800}
                fontFamily={FONT}
                fill={ORANGE}
              >
                +1
              </text>
            </g>
          )
        })}
      </motion.g>

      {/* the arithmetic being claimed right now */}
      <motion.g
        initial={false}
        animate={{ opacity: beat.equation ? 1 : 0 }}
        transition={fade(reduce)}
      >
        <rect
          x={(VW - Math.max(120, (beat.equation?.length ?? 0) * 7.6 + 24)) / 2}
          y={186}
          width={Math.max(120, (beat.equation?.length ?? 0) * 7.6 + 24)}
          height={20}
          rx={10}
          fill="#E9F0F8"
        />
        <text
          x={VW / 2}
          y={200.5}
          textAnchor="middle"
          fontSize={13}
          fontWeight={800}
          fontFamily={FONT}
          fill={beat.result ? GREEN_INK : BLUE}
        >
          {beat.equation ?? ''}
        </text>
      </motion.g>
    </svg>
  )
}

export default function ConsecutiveIntegerSumExplainer(props: ExplainerProps) {
  const { params, correctAnswer, lang = 'en' } = props
  const reduce = !!useReducedMotion()
  const p = params as ConsecutiveSumParams
  const story = useMemo(
    () => buildConsecutiveSumSteps(p, lang, correctAnswer),
    [p, lang, correctAnswer],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const askedEn = story.ask === 'smallest' ? 'smallest' : 'largest'
  const askedId = story.ask === 'smallest' ? 'terkecil' : 'terbesar'
  const ariaLabel = T(
    `Strategy: ${story.n} consecutive numbers balance around their middle, so ${story.sum} splits into equal pairs. The ${askedEn} number is ${story.answer}.`,
    `Strategi: ${story.n} bilangan berurutan setimbang di tengahnya, jadi ${story.sum} terbagi menjadi pasangan-pasangan yang sama. Bilangan ${askedId} adalah ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <Board story={story} beat={beat} lang={lang} reduce={reduce} />

        <div
          className="min-h-[2.75rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#F0F9E3', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E9F0F8', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
