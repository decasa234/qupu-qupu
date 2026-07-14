import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildDrtSteps } from './drtSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

function Box({
  children,
  color = BLUE,
  highlight = false,
  layoutId,
}: {
  children: ReactNode
  color?: string
  highlight?: boolean
  layoutId?: string
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex h-12 min-w-[3rem] items-center justify-center rounded-xl border-[3px] bg-white px-2 font-display text-2xl font-extrabold"
      style={{ borderColor: highlight ? ORANGE : color, color: highlight ? ORANGE : PURPLE }}
    >
      {children}
    </motion.div>
  )
}

function Op({ children }: { children: ReactNode }) {
  return (
    <span className="font-display text-2xl font-extrabold" style={{ color: MUTED }}>
      {children}
    </span>
  )
}

function FormulaLabel({ text, color }: { text: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border-2 px-4 py-1 font-display text-base font-extrabold"
      style={{ borderColor: color, color, background: `${color}14` }}
    >
      {text}
    </motion.div>
  )
}

export default function DistanceRateTimeExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { mode: 'distance' | 'time'; rate: number; t: number }
  const story = useMemo(
    () => buildDrtSteps(p.mode, p.rate, p.t, lang),
    [p.mode, p.rate, p.t, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const phase = beat.phase
  const { rate, t, distance } = story

  const showFormula = phase === 'formula' || phase === 'compute' || phase === 'result'
  const showCompute = phase === 'compute' || phase === 'result'
  const isResult = phase === 'result'

  const formulaText =
    p.mode === 'distance'
      ? lang === 'id'
        ? 'Jarak = kecepatan × waktu'
        : 'Distance = speed × time'
      : lang === 'id'
        ? 'Waktu = jarak ÷ kecepatan'
        : 'Time = distance ÷ speed'

  const ariaLabel =
    lang === 'id'
      ? p.mode === 'distance'
        ? `Jarak = kecepatan × waktu. ${rate} km/jam selama ${t} jam, jarak ${distance} km.`
        : `Waktu = jarak ÷ kecepatan. ${distance} km dibagi ${rate} km/jam, waktu ${t} jam.`
      : p.mode === 'distance'
        ? `Distance = speed × time. ${rate} km/h for ${t} hours equals ${distance} km.`
        : `Time = distance ÷ speed. ${distance} km divided by ${rate} km/h equals ${t} hours.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-4">
        {/* Formula label — appears from 'formula' onward */}
        {showFormula && <FormulaLabel text={formulaText} color={BLUE} />}

        {/* Computation chips — appears from 'compute' onward */}
        {showCompute && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {p.mode === 'distance' ? (
              <>
                <Box color={BLUE} layoutId="rate">
                  {rate}
                </Box>
                <Op>×</Op>
                <Box color={ORANGE} layoutId="t">
                  {t}
                </Box>
                <Op>=</Op>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  className="font-display text-3xl font-extrabold"
                  style={{ color: isResult ? GREEN : PURPLE }}
                >
                  {distance}
                </motion.div>
              </>
            ) : (
              <>
                <Box color={BLUE} layoutId="distance">
                  {distance}
                </Box>
                <Op>÷</Op>
                <Box color={ORANGE} layoutId="rate">
                  {rate}
                </Box>
                <Op>=</Op>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  className="font-display text-3xl font-extrabold"
                  style={{ color: isResult ? GREEN : PURPLE }}
                >
                  {t}
                </motion.div>
              </>
            )}
          </div>
        )}

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
