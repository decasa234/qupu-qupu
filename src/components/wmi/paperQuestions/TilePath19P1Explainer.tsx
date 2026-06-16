import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { TilePathGrid, TP_ROUTE, tileCenter } from './TilePath19P1Illustration'
import { buildTilePath19P1Steps } from './tilePath19P1Steps'

// WMI-19P1A-Q12 — walk the white border from A to B, counting one step per move
// between neighbouring white tiles. The route hugs the border (up the left
// edge, across the top, around the top-right block to B) for 9 steps → answer D.

const BLUE = '#30598A'
const ORANGE = '#F97316'
const GREEN = '#10B981'

export default function TilePath19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTilePath19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Revealed polyline points (centres of the visited tiles).
  const pts = TP_ROUTE.slice(0, beat.revealed).map(([c, r]) => tileCenter(c, r))
  const dPath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')

  // The "walker" sits on the most recently revealed tile.
  const head = pts[pts.length - 1] ?? tileCenter(...TP_ROUTE[0])

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: telusuri ubin putih dari A ke B, hitung tiap langkah — totalnya ${story.answer} langkah, jawaban D.`
      : `Explainer: trace the white tiles from A to B, counting each step — ${story.answer} steps in total, answer D.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <TilePathGrid>
          {/* traced route so far */}
          {pts.length > 1 && (
            <motion.path
              key={`trace-${beat.revealed}`}
              d={dPath}
              fill="none"
              stroke={beat.result ? GREEN : ORANGE}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0.85, opacity: 0.6 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            />
          )}

          {/* the walking marker on the current tile */}
          <motion.circle
            cx={head[0]}
            cy={head[1]}
            r={9}
            fill={beat.result ? GREEN : BLUE}
            stroke="#FFFFFF"
            strokeWidth={2}
            animate={{ cx: head[0], cy: head[1] }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          />
        </TilePathGrid>

        {/* running step counter */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence initial={false}>
            {beat.count > 0 && (
              <motion.span
                key={`count-${beat.count}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: beat.result ? GREEN : BLUE }}
              >
                {beat.count} {lang === 'id' ? 'langkah' : 'steps'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
