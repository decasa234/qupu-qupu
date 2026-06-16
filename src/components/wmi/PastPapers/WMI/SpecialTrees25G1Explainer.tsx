import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SpecialTrees25G1 } from './SpecialTrees25G1Illustration'
import { buildSpecialTrees25G1Steps } from './specialTrees25G1Steps'

// Palette echoes the static tree-row illustration (same qupu tokens / glyphs).
const BRAND_BLUE = '#30598A' // qupu-brand-blue — ground line + neutral chrome
const ORANGE = '#f0853a' // qupu-brand-orange — lit / special highlight
const SHELL = '#FFF9F4' // qupu-shell (panel)
const PEACH = '#FFD3B1' // qupu-peach (panel border)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_SOFT = '#E5F0E4'
const ROSE = '#e11d48'
const ROSE_INK = '#9f1239'
const ROSE_SOFT = '#FFF1F2'

// A compact "west-max < HERE < east-min" verdict strip. Shows the three numbers
// the test compares, tinted green (pass) or rose (fail). Dashes stand in at the
// row ends where a side has no neighbour.
function VerdictStrip({
  leftMax,
  here,
  rightMin,
  pass,
  T,
}: {
  leftMax: number | null
  here: number
  rightMin: number | null
  pass: boolean
  T: (en: string, id: string) => string
}) {
  const tint = pass ? GREEN : ROSE
  const ink = pass ? GREEN_INK : ROSE_INK
  const soft = pass ? GREEN_SOFT : ROSE_SOFT
  const lt = leftMax !== null && leftMax < here
  const rt = rightMin !== null && here < rightMin

  const Cell = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col items-center">
      <span className="font-display text-[10px] font-bold" style={{ color: BRAND_BLUE }}>
        {label}
      </span>
      <span className="font-display text-lg font-black tabular-nums" style={{ color: ink }}>
        {value}
      </span>
    </div>
  )

  return (
    <div
      className="flex items-end gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ background: soft, borderColor: tint }}
    >
      <Cell label={T('tallest west', 'tertinggi barat')} value={leftMax === null ? '—' : String(leftMax)} />
      <span className="pb-1 font-display text-base font-black" style={{ color: lt ? GREEN_INK : ink }}>
        {leftMax === null ? '·' : leftMax < here ? '<' : '≥'}
      </span>
      <Cell label={T('this tree', 'pohon ini')} value={String(here)} />
      <span className="pb-1 font-display text-base font-black" style={{ color: rt ? GREEN_INK : ink }}>
        {rightMin === null ? '·' : here < rightMin ? '<' : '≥'}
      </span>
      <Cell label={T('shortest east', 'terpendek timur')} value={rightMin === null ? '—' : String(rightMin)} />
    </div>
  )
}

export default function SpecialTrees25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSpecialTrees25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const here = beat.litTree !== null ? story.ranks[beat.litTree] : null
  const probing = beat.litTree !== null && here !== null

  const ariaLabel = T(
    `Strategy: a tree is special when the tallest tree to its west is shorter than it and the shortest tree to its east is taller. Testing each tree west to east, positions 3, 4 and 7 pass — so there are ${story.answer} special trees.`,
    `Strategi: pohon istimewa jika pohon tertinggi di baratnya lebih pendek darinya dan pohon terpendek di timurnya lebih tinggi. Menguji tiap pohon dari barat ke timur, posisi 3, 4, dan 7 lolos — jadi ada ${story.answer} pohon istimewa.`,
  )

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* special-tree tally — grows as candidates pass the test */}
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-extrabold" style={{ color: BRAND_BLUE }}>
            {T('Special trees:', 'Pohon istimewa:')}
          </span>
          <motion.span
            key={beat.found}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN_INK : ORANGE }}
          >
            {beat.found}
          </motion.span>
        </div>

        {/* the tree row — bind the built primitive, do NOT redraw */}
        <SpecialTrees25G1 litTree={beat.litTree} markSpecial={beat.markSpecial} />

        {/* verdict strip — only while probing a candidate */}
        {probing && here !== null && (
          <VerdictStrip leftMax={beat.leftMax} here={here} rightMin={beat.rightMin} pass={beat.pass} T={T} />
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'probe-fail'
                ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE_INK }
                : beat.phase === 'probe-pass' || beat.phase === 'mark'
                  ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
                  : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
