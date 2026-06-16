import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FaceShape, SHAPE_CYCLE, MOOD_CYCLE } from './ShapeSeq25G1Illustration'
import { buildShapeSeq25G1Steps } from './shapeSeq25G1Steps'

// Post-answer explainer for WMI-25F1A-Q13 (Grade 1). It teaches the METHOD:
// one tangled row is really two simple cycles laid on top of each other —
// the OUTLINE repeats every 5, the FACE every 3. We walk each cycle on its own
// little track, count to position 15, and let the two answers meet on a sad
// diamond → option A. Reuses FaceShape from the stem so the drawn shapes can
// never drift from the printed question. Deterministic + SSR-safe (an <svg>
// renders on every beat).

const INK = '#1F2937'
const GREEN = '#10B981' // result voice
const BLUE = '#30598A' // qupu-brand-blue — goal / OUTLINE-cycle voice
const ORANGE = '#C56A12' // qupu-brand-orange — FACE-cycle voice

export default function ShapeSeq25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeSeq25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // --- mini-track layout --------------------------------------------------
  const r = 15
  const pitch = 44
  const padX = 16
  const rowH = 52
  const trackW = padX * 2 + SHAPE_CYCLE.length * pitch
  const startX = padX + pitch / 2

  // The two cycle tracks stacked, plus a row that draws the building '?' cell.
  const shapeRowY = 26
  const moodRowY = shapeRowY + rowH
  const answerRowY = moodRowY + rowH + 6
  const svgH = answerRowY + 30

  const shapeActive = beat.phase === 'shape'
  const moodActive = beat.phase === 'mood'

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: deret ini dua pola sekaligus — garis luar berulang tiap 5 (mendarat di belah ketupat) dan wajah berulang tiap 3 (mendarat di cemberut). Jadi "?" = belah ketupat cemberut = pilihan A.`
      : `Explainer: this row is two patterns at once — the outline repeats every 5 (lands on a diamond) and the face repeats every 3 (lands on a frown). So "?" = a frowning diamond = option A.`

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${trackW} ${svgH}`} width={Math.min(360, trackW)}>
          {/* ---- OUTLINE track (period 5) ---- */}
          <text x={startX - pitch / 2} y={shapeRowY - 14} fontSize="10" fontWeight="bold" fill={BLUE}>
            {lang === 'id' ? 'GARIS LUAR — tiap 5' : 'OUTLINE — every 5'}
          </text>
          {SHAPE_CYCLE.map((shp, k) => {
            const lit = shapeActive && beat.shapeLit === k
            const cx = startX + k * pitch
            return (
              <g key={`s-${k}`}>
                {lit && (
                  <motion.circle
                    key={`s-halo-${index}`}
                    cx={cx}
                    cy={shapeRowY}
                    r={r + 8}
                    fill="#E1EFFB"
                    stroke={BLUE}
                    strokeWidth={2.5}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  />
                )}
                <g opacity={shapeActive && !lit ? 0.4 : 1}>
                  <FaceShape shape={shp} mood="smile" cx={cx} cy={shapeRowY} r={r} />
                </g>
              </g>
            )
          })}

          {/* ---- FACE track (period 3) ---- */}
          <text x={startX - pitch / 2} y={moodRowY - 14} fontSize="10" fontWeight="bold" fill={ORANGE}>
            {lang === 'id' ? 'WAJAH — tiap 3' : 'FACE — every 3'}
          </text>
          {MOOD_CYCLE.map((md, k) => {
            const lit = moodActive && beat.moodLit === k
            const cx = startX + k * pitch
            return (
              <g key={`m-${k}`}>
                {lit && (
                  <motion.circle
                    key={`m-halo-${index}`}
                    cx={cx}
                    cy={moodRowY}
                    r={r + 8}
                    fill="#FBE8D3"
                    stroke={ORANGE}
                    strokeWidth={2.5}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  />
                )}
                <g opacity={moodActive && !lit ? 0.4 : 1}>
                  {/* draw the mood on a neutral circle so the face reads clearly */}
                  <FaceShape shape="circle" mood={md} cx={cx} cy={moodRowY} r={r} />
                </g>
              </g>
            )
          })}

          {/* ---- the building '?' cell ---- */}
          <text x={startX - pitch / 2} y={answerRowY - 14} fontSize="10" fontWeight="bold" fill={INK}>
            {lang === 'id' ? `"?" — bangun ke-${story.qPos}` : `"?" — shape #${story.qPos}`}
          </text>
          {beat.shapeAnswer && beat.moodAnswer ? (
            // both halves known → draw the finished sad diamond
            <motion.g
              key={`done-${index}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            >
              {beat.result && (
                <circle cx={startX} cy={answerRowY} r={r + 9} fill="#D1FAE5" stroke={GREEN} strokeWidth={2.5} />
              )}
              <FaceShape shape={beat.shapeAnswer} mood={beat.moodAnswer} cx={startX} cy={answerRowY} r={r} />
            </motion.g>
          ) : beat.shapeAnswer ? (
            // shape known, mood still unknown → diamond with a '?' face slot
            <motion.g
              key={`half-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            >
              <FaceShape shape={beat.shapeAnswer} mood="smile" cx={startX} cy={answerRowY} r={r} strokeWidth={2} />
              <text x={startX + r + 14} y={answerRowY + 5} fontSize="18" fontWeight="bold" fill={ORANGE}>
                {lang === 'id' ? '+ wajah?' : '+ face?'}
              </text>
            </motion.g>
          ) : (
            <text x={startX} y={answerRowY + 7} textAnchor="middle" fontSize="26" fontWeight="bold" fill={INK}>
              ?
            </text>
          )}
        </svg>

        {beat.result && (
          <motion.div
            key="answer-A"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="font-display text-3xl font-black"
            style={{ color: GREEN }}
          >
            A
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'mood'
                ? { background: '#FBE8D3', borderColor: ORANGE, color: ORANGE }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
