import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildViewsOfSolidSteps } from './viewsOfSolidSteps'
import { useBeatControl } from './useBeatControl'
import {
  CHOICE_LABELS,
  CUBE_DIM,
  CUBE_LIT,
  FlatFigure,
  PlanFigure,
  SolidFigure,
  VIEW_FILL,
  describeSolidId,
  type FlatRing,
} from '../views-of-solid'

// The pile stays put for the whole animation — cubes only change colour — so the
// child can see that flattening does not move anything, it merely hides what
// stands behind something else. The flat picture below it fills in one column
// (or one row) at a time, and the four choices are struck out one at a time by a
// square that is pointed at, never by assertion.

const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const HAIR = '#E6D8C9'
const MUTED = '#9AA2AE'
const PAPER = '#FFFFFF'
const UNDECIDED = '#F4EDE5'

export default function ViewsOfSolidExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildViewsOfSolidSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const lit = useMemo(() => new Set(beat.lit), [beat.lit])
  const shown = useMemo(() => new Set(beat.shown), [beat.shown])
  const crossed = useMemo(() => new Set(beat.crossed), [beat.crossed])

  const captionStyle = beat.reveal
    ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
    : beat.phase === 'eliminate'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `A pile of unit cubes, stack heights front row first: ${describeSolidId(story.solid)}. The pile is flattened one direction at a time to build its flat view.`,
    `Tumpukan kubus satuan, tinggi tumpukan baris depan dulu: ${describeSolidId(story.solid)}. Tumpukan itu dipipihkan satu arah demi satu arah untuk membentuk gambar datarnya.`,
  )

  const colorOf = (v: { x: number; y: number; z: number }): string | undefined => {
    const key = `${v.x},${v.y},${v.z}`
    if (lit.has(key)) return CUBE_LIT
    if (beat.focus) return CUBE_DIM
    return undefined
  }

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {story.ask === 'count-blocks' ? (
          <div className="flex w-full flex-col items-center gap-1">
            <span className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide" style={{ color: MUTED }}>
              {T('Top view', 'Tampak atas')}
            </span>
            <PlanFigure
              solid={story.solid}
              fillOf={(r) =>
                beat.planRow !== null && story.solid.depth - 1 - r === beat.planRow ? VIEW_FILL : PAPER
              }
            />
          </div>
        ) : (
          <>
            <div className="flex w-full items-center justify-between gap-2">
              <span className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide" style={{ color: MUTED }}>
                {T('The pile', 'Tumpukannya')}
              </span>
              <span
                className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
                style={{ background: BLUE_SOFT, borderColor: BLUE, color: BLUE }}
              >
                {story.ask === 'cubes-per-layer'
                  ? T(`layer ${story.layer}`, `tingkat ke-${story.layer}`)
                  : T(`from the ${story.view === 'side' ? 'right side' : story.view}`,
                      `dari ${story.view === 'side' ? 'samping kanan' : story.view === 'front' ? 'depan' : 'atas'}`)}
              </span>
            </div>
            <SolidFigure solid={story.solid} size={22} colorOf={colorOf} />
          </>
        )}

        {/* The flat picture being built, one column (or row) at a time. */}
        {story.ask === 'which-view' && (
          <div className="flex w-full flex-col items-center gap-1">
            <span className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide" style={{ color: MUTED }}>
              {T('Flattened so far', 'Yang sudah dipipihkan')}
            </span>
            <FlatFigure
              flat={story.truth}
              view={story.view}
              cellSize={20}
              fillOf={(r, c) => {
                const i = r * story.truth.cols + c
                if (!shown.has(i)) return UNDECIDED
                return story.truth.cells[i] ? VIEW_FILL : PAPER
              }}
            />
          </div>
        )}

        {/* The four choices, struck out one at a time. */}
        {story.ask === 'which-view' && story.options.length > 0 && beat.phase !== 'setup' && beat.phase !== 'read' && (
          <div className="flex w-full flex-wrap items-end justify-center gap-3">
            {story.options.map((flat, i) => {
              const isCrossed = crossed.has(i)
              const isAnswer = beat.phase === 'result' && CHOICE_LABELS[i] === story.answerLabel
              const ringOf = (r: number, c: number): FlatRing =>
                beat.option === i && beat.mismatch === r * flat.cols + c ? 'red' : 'none'
              return (
                <div
                  key={CHOICE_LABELS[i]}
                  className="flex flex-col items-center gap-1 rounded-lg border-2 px-1.5 pb-1 pt-0.5"
                  style={{
                    borderColor: isAnswer ? GREEN : isCrossed ? ROSE : HAIR,
                    background: isAnswer ? GREEN_SOFT : isCrossed ? ROSE_SOFT : PAPER,
                    opacity: isCrossed && !isAnswer ? 0.5 : 1,
                  }}
                >
                  <span
                    className="font-display text-[0.6875rem] font-extrabold"
                    style={{ color: isAnswer ? GREEN_INK : isCrossed ? ROSE : BLUE }}
                  >
                    {CHOICE_LABELS[i]}
                  </span>
                  <FlatFigure flat={flat} view={story.view} cellSize={15} ringOf={ringOf} />
                </div>
              )
            })}
          </div>
        )}

        <div className="flex min-h-[1.75rem] w-full items-center justify-center">
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
