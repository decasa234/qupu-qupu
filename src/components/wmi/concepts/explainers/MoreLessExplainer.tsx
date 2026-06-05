import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildMoreLessSteps } from './moreLessSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const MUTED = '#9aa3b2'

const PAD = 30
const W = 340

export default function MoreLessExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { x: number; k: number; dir: 'more' | 'less' }
  const story = useMemo(
    () => buildMoreLessSteps(p.x, p.k, p.dir, lang),
    [p.x, p.k, p.dir, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { x, k, dir, answer, lo, hi } = story
  const phase = beat.phase

  // Map a number-line value to SVG x-pixel
  const px = (v: number) => PAD + ((v - lo) / (hi - lo)) * W

  const showHop = phase === 'hop' || phase === 'land' || phase === 'result'
  const showAnswer = phase === 'land' || phase === 'result'

  // Arc path from px(x) to px(answer), bulging upward
  const x1 = px(x)
  const x2 = px(answer)
  const midX = (x1 + x2) / 2
  const arcHeight = 32
  const arcPath = `M ${x1} 70 Q ${midX} ${70 - arcHeight} ${x2} 70`

  const ariaLabel =
    lang === 'id'
      ? `Garis bilangan: mulai dari ${x}, lompat ${dir === 'more' ? 'maju' : 'mundur'} ${k}, mendarat di ${answer}.`
      : `Number line: start at ${x}, hop ${dir === 'more' ? 'forward' : 'back'} ${k}, land on ${answer}.`

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4">
        {/* Number line SVG */}
        <svg viewBox="0 0 400 120" width="100%" style={{ maxWidth: 440, overflow: 'visible' }}>
          {/* Axis line */}
          <line
            x1={PAD}
            y1={70}
            x2={PAD + W}
            y2={70}
            stroke={MUTED}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* lo end tick */}
          <line x1={PAD} y1={62} x2={PAD} y2={78} stroke={MUTED} strokeWidth={1.5} />
          <text x={PAD} y={93} textAnchor="middle" fontSize={11} fill={MUTED}>
            {lo}
          </text>

          {/* hi end tick */}
          <line x1={PAD + W} y1={62} x2={PAD + W} y2={78} stroke={MUTED} strokeWidth={1.5} />
          <text x={PAD + W} y={93} textAnchor="middle" fontSize={11} fill={MUTED}>
            {hi}
          </text>

          {/* x tick + label (always visible) */}
          {x !== lo && x !== hi && (
            <>
              <line x1={px(x)} y1={63} x2={px(x)} y2={77} stroke={BLUE} strokeWidth={2} />
              <text x={px(x)} y={93} textAnchor="middle" fontSize={13} fontWeight="bold" fill={BLUE}>
                {x}
              </text>
            </>
          )}

          {/* answer tick + label (only distinct from x) */}
          {answer !== x && answer !== lo && answer !== hi && (
            <>
              <line
                x1={px(answer)}
                y1={63}
                x2={px(answer)}
                y2={77}
                stroke={showAnswer ? GREEN : MUTED}
                strokeWidth={2}
              />
              {showAnswer && (
                <text
                  x={px(answer)}
                  y={93}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight="bold"
                  fill={GREEN}
                >
                  {answer}
                </text>
              )}
            </>
          )}

          {/* Curved hop arrow */}
          {showHop && (
            <>
              <motion.path
                key="arc"
                d={arcPath}
                fill="none"
                stroke={ORANGE}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
              {/* Arrowhead at the end of arc */}
              <motion.polygon
                key="arrowhead"
                points={`${x2},70 ${x2 + (dir === 'more' ? -7 : 7)},63 ${x2 + (dir === 'more' ? -7 : 7)},77`}
                fill={ORANGE}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              />
              {/* Arc label: +k or −k */}
              <motion.text
                key="arc-label"
                x={midX}
                y={70 - arcHeight - 6}
                textAnchor="middle"
                fontSize={13}
                fontWeight="bold"
                fill={ORANGE}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {dir === 'more' ? '+' : '−'}{k}
              </motion.text>
            </>
          )}

          {/* Blue dot at x (start) */}
          <motion.circle
            key="dot-x"
            cx={px(x)}
            cy={70}
            r={7}
            fill={BLUE}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />

          {/* x label on the dot */}
          {x === lo || x === hi ? (
            <text x={px(x)} y={93} textAnchor="middle" fontSize={13} fontWeight="bold" fill={BLUE}>
              {x}
            </text>
          ) : null}

          {/* Green dot at answer */}
          {showAnswer && (
            <motion.circle
              key="dot-answer"
              cx={px(answer)}
              cy={70}
              r={7}
              fill={GREEN}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
          )}

          {/* answer label when answer === lo or hi edge */}
          {showAnswer && (answer === lo || answer === hi) && (
            <text x={px(answer)} y={93} textAnchor="middle" fontSize={13} fontWeight="bold" fill={GREEN}>
              {answer}
            </text>
          )}

          {/* PURPLE label x inside the blue dot */}
          <text
            x={px(x)}
            y={74}
            textAnchor="middle"
            fontSize={9}
            fontWeight="bold"
            fill="white"
            style={{ pointerEvents: 'none' }}
          >
            {x}
          </text>

          {/* Label answer inside green dot */}
          {showAnswer && (
            <text
              x={px(answer)}
              y={74}
              textAnchor="middle"
              fontSize={9}
              fontWeight="bold"
              fill="white"
              style={{ pointerEvents: 'none' }}
            >
              {answer}
            </text>
          )}
        </svg>

        {/* Caption box */}
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
