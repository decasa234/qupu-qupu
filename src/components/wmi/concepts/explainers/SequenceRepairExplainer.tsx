import { useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildSequenceRepairSteps,
  type SeqChip,
  type SeqLink,
  type SequenceRepairParams,
} from './sequenceRepairSteps'
import { useBeatControl } from './useBeatControl'

// House palette (qupu tokens).
const BRAND_BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const ROSE = '#D9534F'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const MUTED = '#9AA3B2'

const GREEN_INK = '#3C7000'
const ORANGE_INK = '#B4551A'
const ROSE_INK = '#A33633'

interface Skin {
  bg: string
  border: string
  ink: string
  dashed: boolean
}

// A chip's dress: tone decides the mood, family decides the outline colour of an
// otherwise-resting chip (that is how the two interleaved runs stay legible).
function chipSkin(chip: SeqChip): Skin {
  const dashed = chip.kind !== 'number'
  switch (chip.tone) {
    case 'focus':
      if (chip.family === 1) return { bg: '#FFF0E2', border: ORANGE, ink: ORANGE_INK, dashed }
      return { bg: '#E1EFFB', border: BRAND_BLUE, ink: BRAND_BLUE, dashed }
    case 'good':
      return { bg: '#EEF7E2', border: GREEN, ink: GREEN_INK, dashed }
    case 'bad':
      return { bg: '#FDECEC', border: ROSE, ink: ROSE_INK, dashed }
    case 'gone':
      return { bg: '#F1F1F0', border: '#D6D3CE', ink: '#A8A29E', dashed }
    case 'reveal':
      return { bg: '#FFE9D6', border: ORANGE, ink: ORANGE_INK, dashed: false }
    default:
      if (chip.family === 1) return { bg: '#FFFFFF', border: ORANGE, ink: ORANGE_INK, dashed }
      if (chip.family === 0) return { bg: '#FFFFFF', border: BRAND_BLUE, ink: BRAND_BLUE, dashed }
      if (dashed) return { bg: SHELL, border: '#C9BFB3', ink: MUTED, dashed: true }
      return { bg: '#FFFFFF', border: '#C9D6E4', ink: BRAND_BLUE, dashed: false }
  }
}

function linkColor(link: SeqLink): string {
  if (link.tone === 'good') return GREEN
  if (link.tone === 'bad') return ROSE
  if (link.tone === 'focus') return BRAND_BLUE
  return '#B9C2CE'
}

const CHIP_ROW: Record<SeqChip['row'], number> = { top: 2, mid: 3, bottom: 4 }
const LINK_ROW: Record<SeqLink['row'], number> = { above: 1, below: 5 }

export default function SequenceRepairExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as SequenceRepairParams
  const story = useMemo(() => buildSequenceRepairSteps(p, lang), [p, lang])
  const reduce = useReducedMotion()
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.beats.map((b) => b.hold),
  })
  const beat = story.beats[index] ?? story.beats[story.finalIndex]

  const columns = Math.max(1, beat.chips.length)
  const spring = reduce
    ? { duration: 0 }
    : ({ type: 'spring', stiffness: 380, damping: 28 } as const)
  const fade = reduce ? { duration: 0 } : { duration: 0.25 }

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel =
    story.defect === 'interior-blank'
      ? T(
          `Strategy: read the jumping rule off the intact part, then apply it to the empty box. The missing number is ${story.answer}.`,
          `Strategi: baca aturan lompatan dari bagian yang utuh, lalu pakai pada kotak kosong. Bilangan yang hilang ${story.answer}.`,
        )
      : story.defect === 'intruder'
        ? T(
            `Strategy: read the jumping rule, then walk the sequence until a number breaks it. The number to remove is ${story.answer}.`,
            `Strategi: baca aturan lompatan, lalu telusuri barisan sampai ada bilangan yang melanggar. Bilangan yang dibuang ${story.answer}.`,
          )
        : T(
            `Strategy: read the step from both ends, count the jumps across the dots, then drop the one that is already shown. ${story.answer} numbers are hidden.`,
            `Strategi: baca lompatan dari kedua ujung, hitung lompatan melewati titik-titik, lalu kurangi yang sudah terlihat. Ada ${story.answer} bilangan tersembunyi.`,
          )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[15rem] flex-col items-center justify-center gap-4 rounded-2xl border-2 px-3 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <div
          className="grid w-full items-center justify-items-center"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            columnGap: '0.25rem',
          }}
        >
          {/* Keeps the two interleaved bands apart even before a chip is kicked
              out of the line, so the rows never jump when one is. */}
          {story.layout === 'zigzag' && (
            <div style={{ gridRow: 3, gridColumn: '1 / -1', height: '2.75rem' }} />
          )}

          <AnimatePresence initial={false}>
            {beat.links.map((link) => {
              const color = linkColor(link)
              const above = link.row === 'above'
              return (
                <motion.div
                  key={`${link.id}-${link.tone}`}
                  initial={{ opacity: 0, y: above ? 4 : -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                  className={`relative flex h-6 w-full justify-center ${above ? 'items-start' : 'items-end'}`}
                  style={{
                    gridColumn: `${link.from + 1} / span ${Math.max(1, link.to - link.from + 1)}`,
                    gridRow: LINK_ROW[link.row],
                  }}
                >
                  <div
                    className={
                      above
                        ? 'absolute inset-x-[18%] rounded-t-md border-2 border-b-0'
                        : 'absolute inset-x-[18%] rounded-b-md border-2 border-t-0'
                    }
                    style={{
                      borderColor: color,
                      top: above ? '0.5rem' : 0,
                      bottom: above ? 0 : '0.5rem',
                    }}
                  />
                  <span
                    className="relative whitespace-nowrap rounded-full border-2 px-1 font-display text-[0.5625rem] font-extrabold leading-[1.25]"
                    style={{ background: '#FFFFFF', borderColor: color, color }}
                  >
                    {link.label}
                  </span>
                </motion.div>
              )
            })}

            {beat.chips.map((chip, i) => {
              const skin = chipSkin(chip)
              return (
                <motion.div
                  key={chip.id}
                  layout={!reduce}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{
                    opacity: chip.tone === 'gone' ? 0.55 : 1,
                    scale: chip.tone === 'reveal' ? 1.08 : chip.tone === 'focus' ? 1.04 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={spring}
                  className="my-1 flex h-9 w-full items-center justify-center rounded-lg px-0.5 font-display text-[0.8125rem] font-extrabold tabular-nums"
                  style={{
                    gridColumn: i + 1,
                    gridRow: CHIP_ROW[chip.row],
                    background: skin.bg,
                    color: skin.ink,
                    border: `2px ${skin.dashed ? 'dashed' : 'solid'} ${skin.border}`,
                    textDecoration: chip.tone === 'gone' ? 'line-through' : undefined,
                  }}
                >
                  {chip.label}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#EEF7E2', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
