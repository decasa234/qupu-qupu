import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MouseMaze9 } from './MouseMaze9Illustration'
import { buildMouseMaze9Steps } from './mouseMaze9Steps'

const ORANGE = '#F59E0B' // qupu brand orange — route / active accent
const BLUE = '#30598A'   // qupu brand blue — intro accent
const GREEN = '#10B981'  // result / success accent
const RED = '#EF4444'    // closed-gate accent

export default function MouseMaze9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(
    () => buildMouseMaze9Steps(props.correctAnswer, lang),
    [props.correctAnswer, lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Derive caption accent from the current phase
  const accent = beat.result
    ? GREEN
    : beat.phase === 'intro'
      ? BLUE
      : beat.phase === 'close-both' || beat.phase === 'close-gate4-only'
        ? RED
        : ORANGE

  const ariaLabel = t(
    `Explainer: to block every route from mouse to cheese, close gates 4 and 5. Gate 4 blocks the bottom path; Gate 5 blocks the right-side path. Together they form the only minimum cut. Answer E.`,
    `Penjelasan: untuk memblokir semua jalur dari tikus ke keju, tutup Gerbang 4 dan 5. Gerbang 4 memblokir jalur bawah; Gerbang 5 memblokir jalur sisi kanan. Bersama-sama mereka membentuk minimum cut satu-satunya. Jawaban E.`,
  )

  // Gate status chips for the 5 gates
  const gateChips = [1, 2, 3, 4, 5].map((g) => {
    const isClosed = beat.closedGates.includes(g)
    return { g, isClosed }
  })

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Maze — shows closed gates and lit route */}
        <MouseMaze9
          closedGates={beat.closedGates}
          litPath={beat.litPath ?? null}
        />

        {/* Gate status chips */}
        <div className="flex w-full items-stretch justify-center gap-1.5">
          {gateChips.map(({ g, isClosed }) => (
            <GateChip key={g} gateNum={g} closed={isClosed} active={beat.closedGates.includes(g)} />
          ))}
        </div>

        {/* Phase label */}
        {beat.phase !== 'intro' && (
          <motion.div
            key={`phase-${index}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 480, damping: 22 }}
            className="font-display text-lg font-black tabular-nums"
            style={{ color: accent }}
          >
            {beat.result
              ? t('Gates 4 + 5 → blocked!', 'Gerbang 4 + 5 → terblokir!')
              : beat.phase === 'close-both'
                ? t('Both gates closed', 'Kedua gerbang ditutup')
                : beat.phase === 'close-gate4-only'
                  ? t('Gate 4 closed, but…', 'Gerbang 4 ditutup, tapi…')
                  : beat.phase === 'path-via-gate5'
                    ? t('Route via Gate 5', 'Jalur lewat Gerbang 5')
                    : t('Route via Gate 4', 'Jalur lewat Gerbang 4')}
          </motion.div>
        )}

        {/* Caption box */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'close-both'
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : beat.phase === 'close-gate4-only'
                  ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                  : beat.phase === 'intro'
                    ? { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
                    : { background: '#FFF1E6', borderColor: ORANGE, color: '#9a4a12' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

function GateChip({
  gateNum,
  closed,
  active,
}: {
  gateNum: number
  closed: boolean
  active: boolean
}) {
  const ringColor = closed ? '#EF4444' : '#9CA3AF'
  const bg = closed ? '#FEE2E2' : '#F9FAFB'

  return (
    <motion.div
      animate={{ scale: active ? 1.08 : 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 px-1 py-1.5"
      style={{ borderColor: ringColor, background: bg }}
    >
      <span
        className="font-display text-base font-black tabular-nums"
        style={{ color: ringColor }}
      >
        {gateNum}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: ringColor }}>
        {closed ? '✕' : '○'}
      </span>
    </motion.div>
  )
}
