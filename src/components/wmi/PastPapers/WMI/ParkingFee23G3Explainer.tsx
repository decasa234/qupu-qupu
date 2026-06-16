import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ParkingFee23G3 } from './ParkingFee23G3Illustration'
import {
  buildParkingFeeSteps,
  MATCH_FEE,
  SMALL_FIRST,
  SMALL_LATER,
  BIG_FIRST,
  BIG_LATER,
  type ParkingStep,
} from './parkingFee23G3Steps'

// WMI-23F3A-Q7 — equal parking fees, least combined hours (answer B = 8).
// Build two cost ladders, match the first fee both reach. Small car 5,8,11,14,17
// at hours 1–5; big car 7,12,17 at hours 1–3; the first shared fee is $17 (small
// at 5 h, big at 3 h) so the least total is 5 + 3 = 8. Each beat shows the running
// sums concretely; the figure reveal is driven by passing smallHours / bigHours
// into the ParkingFee23G3 primitive. The winner lands last with hold 0.

const ORANGE = '#f0853a' // fill-qupu-brand-orange — small-car accent
const BRAND_BLUE = '#30598A' // fill-qupu-brand-blue — big-car accent + captions
const SHELL = '#FFF9F4' // fill-qupu-shell — panel
const PEACH = '#FFD3B1' // fill-qupu-peach — borders
const CREAM = '#FFF2DF' // fill-qupu-cream — rung body
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const MUTED = '#9aa3b2'

// One cost rung: "hour → $cost". Lights up green when its cost is the matched fee.
function Rung({
  hour,
  cost,
  accent,
  matched,
}: {
  hour: number
  cost: number
  accent: string
  matched: boolean
}) {
  const ringColor = matched ? GREEN : accent
  const costColor = matched ? GREEN_INK : accent
  return (
    <motion.div
      layout
      initial={{ scale: 0.55, opacity: 0 }}
      animate={{ scale: matched ? 1.08 : 1, opacity: 1 }}
      exit={{ scale: 0.55, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="flex items-center gap-1 rounded-lg border-2 px-2 py-1 font-display text-[13px] font-extrabold tabular-nums"
      style={{
        background: matched ? '#ECFDF5' : CREAM,
        borderColor: ringColor,
        color: costColor,
      }}
    >
      <span style={{ color: MUTED }}>{hour}h</span>
      <span style={{ color: MUTED }}>→</span>
      <span>{`$${cost}`}</span>
    </motion.div>
  )
}

// A labelled ladder column for one car: heading + the rungs revealed so far.
function Ladder({
  title,
  rateLine,
  accent,
  rungs,
  matchFee,
}: {
  title: string
  rateLine: string
  accent: string
  rungs: Array<{ hour: number; cost: number }>
  matchFee: number | null
}) {
  return (
    <div className="flex min-w-[112px] flex-col items-center gap-1">
      <div
        className="rounded-md px-2 py-0.5 font-display text-[12px] font-black text-white"
        style={{ background: accent }}
      >
        {title}
      </div>
      <div className="font-display text-[10px] font-bold" style={{ color: MUTED }}>
        {rateLine}
      </div>
      <div className="flex min-h-[2rem] flex-col items-center gap-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {rungs.map((r) => (
            <Rung
              key={r.hour}
              hour={r.hour}
              cost={r.cost}
              accent={accent}
              matched={matchFee != null && r.cost === matchFee}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function ParkingFee23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildParkingFeeSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat: ParkingStep = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = T(
    `Explainer: build each car's fee ladder — small car 5, 8, 11, 14, 17 and big car 7, 12, 17. The first fee both reach is $${story.matchFee}: small at ${story.smallMatchH} hours, big at ${story.bigMatchK} hours, so the least total hours is ${story.smallMatchH} + ${story.bigMatchK} = ${story.answerHours} (choice ${story.answerLabel}).`,
    `Penjelasan: susun tangga tarif tiap mobil — mobil kecil 5, 8, 11, 14, 17 dan mobil besar 7, 12, 17. Tarif pertama yang sama-sama dicapai adalah $${story.matchFee}: kecil ${story.smallMatchH} jam, besar ${story.bigMatchK} jam, jadi total jam paling sedikit ${story.smallMatchH} + ${story.bigMatchK} = ${story.answerHours} (pilihan ${story.answerLabel}).`,
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[320px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the scene, mirroring the static figure: two cars + their cost meters */}
        <ParkingFee23G3
          smallHours={beat.smallHours}
          bigHours={beat.bigHours}
          showTotals={beat.showTotals}
        />

        {/* the two fee ladders, built rung by rung */}
        <div className="flex items-start justify-center gap-5">
          <Ladder
            title={T('Small car', 'Mobil kecil')}
            rateLine={`$${SMALL_FIRST} +$${SMALL_LATER}/h`}
            accent={ORANGE}
            rungs={beat.small}
            matchFee={beat.highlightFee}
          />
          <Ladder
            title={T('Big car', 'Mobil besar')}
            rateLine={`$${BIG_FIRST} +$${BIG_LATER}/h`}
            accent={BRAND_BLUE}
            rungs={beat.big}
            matchFee={beat.highlightFee}
          />
        </div>

        {/* running match readout — appears once the shared fee is found */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          {beat.highlightFee != null ? (
            <motion.div
              key={beat.result ? 'total' : 'match'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1 font-display text-xl font-black tabular-nums"
            >
              {beat.result ? (
                <>
                  <span style={{ color: ORANGE }}>{story.smallMatchH}</span>
                  <span style={{ color: MUTED }}>+</span>
                  <span style={{ color: BRAND_BLUE }}>{story.bigMatchK}</span>
                  <span style={{ color: MUTED }}>=</span>
                  <span style={{ color: GREEN_INK }}>{story.answerHours} h</span>
                </>
              ) : (
                <>
                  <span style={{ color: ORANGE }}>{story.smallMatchH}h</span>
                  <span style={{ color: MUTED }}>&amp;</span>
                  <span style={{ color: BRAND_BLUE }}>{story.bigMatchK}h</span>
                  <span style={{ color: MUTED }}>→</span>
                  <span style={{ color: GREEN_INK }}>{`$${MATCH_FEE}`}</span>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-sm font-extrabold"
              style={{ color: BRAND_BLUE }}
            >
              {T('Find the first fee in both ladders', 'Cari tarif pertama yang ada di dua tangga')}
            </motion.div>
          )}
        </div>

        {/* caption box */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
