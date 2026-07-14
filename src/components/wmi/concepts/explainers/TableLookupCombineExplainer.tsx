import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import { buildTableLookupSteps } from './tableLookupSteps'

interface Params {
  apples: number
  oranges: number
  mode: 'sum' | 'diff'
}

const APPLE_EMOJI = '🍎'
const ORANGE_EMOJI = '🍊'
const BLUE = '#30598A'
const ORANGE_COLOR = '#F97316'
const GREEN = '#10B981'

interface TableRowProps {
  emoji: string
  label: string
  value: number
  highlighted: boolean
  popped: boolean
  color: string
}

function TableRow({ emoji, label, value, highlighted, popped, color }: TableRowProps) {
  const rowBg = highlighted ? '#E1EFFB' : 'transparent'
  const rowBorder = highlighted ? BLUE : 'transparent'
  const valueBg = popped ? (highlighted ? BLUE : color) : '#f1f5f9'
  const valueColor = popped ? '#ffffff' : '#64748b'
  const valueScale = popped ? 1.15 : 1

  return (
    <div
      className="grid items-center gap-0 rounded-lg transition-colors duration-300"
      style={{
        gridTemplateColumns: '2fr 1fr',
        background: rowBg,
        border: `2px solid ${rowBorder}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {/* Category cell */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-xl leading-none" aria-hidden="true">{emoji}</span>
        <span className="font-display text-sm font-bold" style={{ color: highlighted ? BLUE : '#475569' }}>
          {label}
        </span>
      </div>
      {/* Value cell */}
      <div className="flex items-center justify-center border-l py-2" style={{ borderColor: highlighted ? '#9ab8d6' : '#e2e8f0' }}>
        <motion.div
          animate={{ scale: valueScale, backgroundColor: valueBg }}
          transition={{ type: 'spring', stiffness: 340, damping: 22 }}
          className="grid h-9 w-12 place-items-center rounded-lg font-display text-lg font-black"
          style={{ color: valueColor }}
        >
          {value}
        </motion.div>
      </div>
    </div>
  )
}

export default function TableLookupCombineExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = (params ?? {}) as Params

  const story = useMemo(
    () => buildTableLookupSteps(p.apples, p.oranges, p.mode, lang),
    [p.apples, p.oranges, p.mode, lang],
  )

  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Table lookup: apples=${story.apples}, oranges=${story.oranges}. ${story.mode === 'sum' ? 'Add' : 'Subtract'} them to get ${story.answer}.`,
    `Baca tabel: apel=${story.apples}, jeruk=${story.oranges}. ${story.mode === 'sum' ? 'Jumlahkan' : 'Kurangkan'} untuk mendapatkan ${story.answer}.`,
  )

  const appleLabel = T('Apples', 'Apel')
  const orangeLabel = T('Oranges', 'Jeruk')
  const headerCategory = T('Fruit', 'Buah')
  const headerCount = T('Count', 'Jumlah')
  const operator = story.mode === 'sum' ? '+' : '−'

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Data table */}
        <div
          className="w-full overflow-hidden rounded-xl border-2"
          style={{ borderColor: BLUE }}
        >
          {/* Table header */}
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: '2fr 1fr',
              background: BLUE,
            }}
          >
            <div className="px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-white opacity-90">
              {headerCategory}
            </div>
            <div
              className="border-l py-1.5 text-center font-display text-xs font-extrabold uppercase tracking-wider text-white opacity-90"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              {headerCount}
            </div>
          </div>

          {/* Apples row */}
          <div className="border-b" style={{ borderColor: '#d1dce8' }}>
            <TableRow
              emoji={APPLE_EMOJI}
              label={appleLabel}
              value={story.apples}
              highlighted={beat.highlightRow === 0}
              popped={beat.popApples}
              color={ORANGE_COLOR}
            />
          </div>

          {/* Oranges row */}
          <TableRow
            emoji={ORANGE_EMOJI}
            label={orangeLabel}
            value={story.oranges}
            highlighted={beat.highlightRow === 1}
            popped={beat.popOranges}
            color={ORANGE_COLOR}
          />
        </div>

        {/* Equation area */}
        <div className="flex min-h-[3.5rem] w-full items-center justify-center">
          <motion.div
            animate={{ opacity: beat.showEquation ? 1 : 0, y: beat.showEquation ? 0 : 8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            {/* A */}
            <div
              className="grid h-12 w-14 place-items-center rounded-xl border-2 font-display text-2xl font-black"
              style={{ borderColor: BLUE, background: '#E1EFFB', color: BLUE }}
            >
              {story.apples}
            </div>

            {/* Operator */}
            <span className="font-display text-2xl font-black" style={{ color: '#475569' }}>
              {operator}
            </span>

            {/* B */}
            <div
              className="grid h-12 w-14 place-items-center rounded-xl border-2 font-display text-2xl font-black"
              style={{ borderColor: ORANGE_COLOR, background: '#FFF4E8', color: '#9a3412' }}
            >
              {story.oranges}
            </div>

            {/* Equals */}
            <span className="font-display text-2xl font-black" style={{ color: '#475569' }}>=</span>

            {/* Answer */}
            <motion.div
              animate={
                beat.showAnswer
                  ? { scale: 1, backgroundColor: '#D1FAE5', borderColor: GREEN }
                  : { scale: 0.85, backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }
              }
              transition={{ type: 'spring', stiffness: 340, damping: 22 }}
              className="grid h-12 w-14 place-items-center rounded-xl border-2 font-display text-2xl font-black"
              style={{ color: beat.showAnswer ? '#065F46' : '#94a3b8' }}
            >
              {beat.showAnswer ? story.answer : '?'}
            </motion.div>
          </motion.div>
        </div>

        {/* Caption strip */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
