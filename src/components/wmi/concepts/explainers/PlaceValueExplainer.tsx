import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildPlaceValueSteps } from './placeValueSteps'
import { useBeatControl } from './useBeatControl'

interface PlaceValueParams {
  n: number
}

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const STEP_MS = 1200

// A digit tile with a small place label underneath ("tens" / "ones").
function Tile({ digit, color, place }: { digit: number; color: string; place: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        layout
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        className="flex h-14 w-14 items-center justify-center rounded-xl border-[3px] bg-white font-display text-3xl font-extrabold"
        style={{ borderColor: color, color }}
      >
        {digit}
      </motion.div>
      <span className="font-display text-[0.6875rem] font-bold text-qupu-muted">{place}</span>
    </div>
  )
}

// A base-ten rod: a stack of ten unit squares worth 10.
function Rod({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24, delay: index * 0.04 }}
      className="flex flex-col items-center gap-1"
    >
      <div className="flex flex-col gap-[0.125rem]">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-2.5 w-2.5 rounded-[0.125rem]" style={{ background: BLUE }} />
        ))}
      </div>
      <span className="font-display text-[0.625rem] font-bold" style={{ color: BLUE }}>
        10
      </span>
    </motion.div>
  )
}

export default function PlaceValueExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as PlaceValueParams
  const story = useMemo(() => buildPlaceValueSteps(p.n, lang), [p.n, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: STEP_MS })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { tens, ones, tensValue, n } = story
  const placeTens = lang === 'id' ? 'puluhan' : 'tens'
  const placeOnes = lang === 'id' ? 'satuan' : 'ones'

  const ariaLabel =
    lang === 'id'
      ? 'Cara berpikir: angka di tempat puluhan bernilai sebanyak itu puluhan.'
      : 'Strategy: a digit in the tens place is worth that many tens.'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[15.625rem] flex-col items-center justify-center gap-4">
        {/* the whole number */}
        {beat.showNumber && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-6xl font-extrabold"
            style={{ color: PURPLE }}
          >
            {n}
          </motion.div>
        )}

        {/* digit tiles with place labels */}
        {beat.showTiles && (
          <div className="flex items-start gap-4">
            <Tile digit={tens} color={BLUE} place={placeTens} />
            <Tile digit={ones} color={ORANGE} place={placeOnes} />
          </div>
        )}

        {/* base-ten rods (tens) next to the ones units */}
        {(beat.showRods || beat.showOnes) && (
          <div className="flex items-end justify-center gap-8">
            {beat.showRods && (
              <div className="flex items-end gap-2">
                {Array.from({ length: beat.rodsRevealed }, (_, r) => (
                  <Rod key={r} index={r} />
                ))}
              </div>
            )}
            {beat.showOnes && (
              <div className="grid grid-cols-3 justify-items-center gap-1">
                {Array.from({ length: ones }, (_, k) => (
                  <motion.span
                    key={k}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30, delay: k * 0.04 }}
                    className="block h-2.5 w-2.5 rounded-[0.125rem]"
                    style={{ background: ORANGE }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* result */}
        {beat.showResult && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-2xl font-extrabold"
            style={{ color: GREEN }}
          >
            = {tensValue}
          </motion.div>
        )}

        {/* caption */}
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
