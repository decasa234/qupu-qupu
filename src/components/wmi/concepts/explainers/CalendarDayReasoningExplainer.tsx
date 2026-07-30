import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCalendarDaySteps } from './calendarDaySteps'
import { useBeatControl } from './useBeatControl'

// M5 `calendar-day-reasoning`. The whole lesson is that day names sit on a loop
// of 7, so the figure is the week laid out as a row of seven chips with a wrap
// arrow running from the last chip back to the first. A marker hops chip to
// chip; when a hop steps off the end it slides the whole way back to Sunday and
// the wrap arrow lights up — the wrap is watched, not asserted. A full lap of 7
// is walked first so "back where you started" is something the child sees,
// which is what earns the shortcut: only `delta mod 7` can move the marker.

const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const ORANGE = '#F0853A'
const CREAM = '#FFF4E8'
const ORANGE_INK = '#8a4b1d'
const GREEN = '#58A700'
const GREEN_INK = '#3A6B00'
const GREEN_BG = '#EDF7E0'
const YELLOW = '#E0A000'
const YELLOW_BG = '#FFF6DC'
const ROSE = '#D9534F'
const ROSE_BG = '#FDECEC'
const MUTED = '#9aa3b2'
const MUTED_LINE = '#E3E7ED'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const WHITE = '#FFFFFF'

const FONT = 'Fredoka, sans-serif'

// --- board geometry (one SVG so the layout is exact at any width) -----------
const VB_W = 320
const VB_H = 180
const CHIP_W = 38
const CHIP_H = 40
const CHIP_GAP = 3
const CHIP_Y = 46
const ROW_LEFT = (VB_W - (7 * CHIP_W + 6 * CHIP_GAP)) / 2
const chipX = (i: number) => ROW_LEFT + i * (CHIP_W + CHIP_GAP)
const chipCx = (i: number) => chipX(i) + CHIP_W / 2
const MARKER_CY = 26
const BADGE_CY = 100
const FIRST_CX = chipCx(0)
const LAST_CX = chipCx(6)

// wrap arrow: drops out from under Saturday, runs left, and points back up into Sunday
const WRAP_PATH = `M ${LAST_CX} 116 C ${LAST_CX} 134 ${LAST_CX} 140 ${LAST_CX - 14} 140 L ${FIRST_CX + 14} 140 C ${FIRST_CX} 140 ${FIRST_CX} 134 ${FIRST_CX} 126`
const WRAP_HEAD = `${FIRST_CX},112 ${FIRST_CX - 6},124 ${FIRST_CX + 6},124`

type ChipState = 'answer' | 'start' | 'current' | 'visited' | 'idle'

const CHIP_SKIN: Record<ChipState, { bg: string; border: string; ink: string; width: number }> = {
  answer: { bg: GREEN_BG, border: GREEN, ink: GREEN_INK, width: 3 },
  start: { bg: BLUE_BG, border: BLUE, ink: BLUE, width: 2.5 },
  current: { bg: CREAM, border: ORANGE, ink: ORANGE_INK, width: 3 },
  visited: { bg: CREAM, border: PEACH, ink: ORANGE_INK, width: 2 },
  idle: { bg: SHELL, border: MUTED_LINE, ink: MUTED, width: 2 },
}

export default function CalendarDayReasoningExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildCalendarDaySteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const reduce = !!useReducedMotion()

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const chipState = (i: number): ChipState => {
    if (beat.result && i === beat.answerIndex) return 'answer'
    if (i === story.startIndex) return 'start'
    if (i === beat.markerIndex) return 'current'
    if (beat.badges[i] !== null) return 'visited'
    return 'idle'
  }

  const markerColor = beat.result ? GREEN : ORANGE
  const wrapLit = beat.wraps
  const wrapColor = wrapLit ? ORANGE : MUTED_LINE
  const spring = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 210, damping: 22 }

  // Landing pill sized off the text (no measuring available inside an SVG).
  const landingW = Math.min(300, Math.max(140, story.landingText.length * 7.6 + 26))

  const isTrap = beat.phase === 'trap'
  const captionSkin = beat.result
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : isTrap
      ? { background: ROSE_BG, borderColor: ROSE, color: ROSE }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: the 7 day names repeat, so ${story.delta} days is ${story.weeks} full weeks back onto ${story.startName} plus ${story.remainder} more hops. Answer: ${story.answerName}.`,
    `Strategi: 7 nama hari berulang, jadi ${story.delta} hari itu ${story.weeks} minggu penuh kembali ke ${story.startName} lalu maju ${story.remainder} hari lagi. Jawaban: ${story.answerName}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-stretch justify-start gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" role="presentation" style={{ display: 'block' }}>
          {/* the week, laid out as a loop that has been cut open */}
          {story.shortNames.map((name, i) => {
            const skin = CHIP_SKIN[chipState(i)]
            const focused = i === beat.markerIndex
            return (
              <motion.g
                key={name}
                initial={false}
                animate={reduce ? { scale: 1 } : { scale: focused ? 1.08 : 1 }}
                transition={spring}
              >
                <motion.rect
                  x={chipX(i)}
                  y={CHIP_Y}
                  width={CHIP_W}
                  height={CHIP_H}
                  rx={11}
                  initial={false}
                  animate={{ fill: skin.bg, stroke: skin.border, strokeWidth: skin.width }}
                  transition={reduce ? { duration: 0 } : { duration: 0.25 }}
                />
                <motion.text
                  x={chipCx(i)}
                  y={CHIP_Y + CHIP_H / 2 + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={800}
                  fontFamily={FONT}
                  initial={false}
                  animate={{ fill: skin.ink }}
                  transition={reduce ? { duration: 0 } : { duration: 0.25 }}
                >
                  {name}
                </motion.text>
              </motion.g>
            )
          })}

          {/* hop numbers written under every chip the walk has touched */}
          {beat.badges.map((badge, i) => {
            if (badge === null) return null
            // A badge landing back on the start chip is the lap closing.
            const home = i === story.startIndex
            return (
              <motion.g
                key={`b${i}-${badge}`}
                initial={reduce ? false : { scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 22, delay: badge * 0.06 }}
              >
                <circle cx={chipCx(i)} cy={BADGE_CY} r={9} fill={home ? GREEN : ORANGE} />
                <text
                  x={chipCx(i)}
                  y={BADGE_CY + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fontFamily={FONT}
                  fill={WHITE}
                >
                  {badge}
                </text>
              </motion.g>
            )
          })}

          {/* the wrap: off the end of Saturday and straight back onto Sunday */}
          <motion.g
            initial={false}
            animate={reduce ? { opacity: 1 } : { opacity: wrapLit ? [0.55, 1, 0.55] : 1 }}
            transition={reduce ? { duration: 0 } : { duration: 1.4, repeat: wrapLit ? Infinity : 0, ease: 'easeInOut' }}
          >
            <path
              d={WRAP_PATH}
              fill="none"
              stroke={wrapColor}
              strokeWidth={wrapLit ? 3.5 : 2}
              strokeLinecap="round"
              strokeDasharray={wrapLit ? undefined : '5 4'}
            />
            <polygon points={WRAP_HEAD} fill={wrapColor} />
            <rect x={VB_W / 2 - 36} y={132} width={72} height={16} rx={7} fill={SHELL} />
            <text
              x={VB_W / 2}
              y={143.5}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fontFamily={FONT}
              fill={wrapLit ? ORANGE : MUTED}
            >
              {T('starts over', 'berulang')}
            </text>
          </motion.g>

          {/* the marker, riding above the row */}
          <motion.g
            initial={false}
            animate={{ x: chipCx(beat.markerIndex) }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 150, damping: 18 }}
          >
            <polygon points={`-6,${MARKER_CY + 9} 6,${MARKER_CY + 9} 0,${MARKER_CY + 18}`} fill={markerColor} />
            <motion.circle
              cx={0}
              cy={MARKER_CY}
              r={11}
              initial={false}
              animate={{ fill: markerColor }}
              transition={reduce ? { duration: 0 } : { duration: 0.25 }}
              stroke={WHITE}
              strokeWidth={2}
            />
            {beat.hopsDone > 0 ? (
              <text
                x={0}
                y={MARKER_CY + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight={800}
                fontFamily={FONT}
                fill={WHITE}
              >
                {`+${beat.hopsDone}`}
              </text>
            ) : (
              <circle cx={0} cy={MARKER_CY} r={4} fill={WHITE} />
            )}
          </motion.g>

          {/* bottom strip: full weeks, then the division, then the landing */}
          {beat.bottom === 'weeks' && (
            <g>
              {Array.from({ length: story.weeks }, (_, k) => {
                const total = story.weeks * 26 - 4
                const startX = (VB_W - (total + 44)) / 2
                return (
                  <motion.g
                    key={`w${k}`}
                    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 22, delay: k * 0.09 }}
                  >
                    <rect x={startX + k * 26} y={156} width={22} height={20} rx={7} fill={YELLOW_BG} stroke={YELLOW} strokeWidth={2} />
                    <text
                      x={startX + k * 26 + 11}
                      y={170.5}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={800}
                      fontFamily={FONT}
                      fill={YELLOW}
                    >
                      7
                    </text>
                  </motion.g>
                )
              })}
              <text
                x={(VB_W - (story.weeks * 26 - 4 + 44)) / 2 + (story.weeks * 26 - 4) + 8}
                y={170.5}
                fontSize={13}
                fontWeight={800}
                fontFamily={FONT}
                fill={BLUE}
              >
                {`= ${story.weeks * 7}`}
              </text>
            </g>
          )}

          {beat.bottom === 'division' && (
            <motion.text
              key="division"
              x={VB_W / 2}
              y={170}
              textAnchor="middle"
              fontSize={14}
              fontWeight={800}
              fontFamily={FONT}
              fill={BLUE}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.3 }}
            >
              {story.divisionText}
            </motion.text>
          )}

          {beat.bottom === 'landing' && (
            <motion.g
              key="landing"
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 22 }}
            >
              <rect
                x={(VB_W - landingW) / 2}
                y={154}
                width={landingW}
                height={24}
                rx={9}
                fill={GREEN_BG}
                stroke={GREEN}
                strokeWidth={2.5}
              />
              <text
                x={VB_W / 2}
                y={170.5}
                textAnchor="middle"
                fontSize={14}
                fontWeight={800}
                fontFamily={FONT}
                fill={GREEN_INK}
              >
                {story.landingText}
              </text>
            </motion.g>
          )}
        </svg>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionSkin}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
