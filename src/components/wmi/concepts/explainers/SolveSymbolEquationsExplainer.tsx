import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildSymbolEquationSteps,
  type SymbolEqBeat,
  type SymbolEqStoryboard,
} from './symbolEquationsSteps'
import { SYMBOL_INK, SymbolGlyphBox } from '../solve-symbol-equations'
import { useBeatControl } from './useBeatControl'

// L9 `solve-symbol-equations` — the two equations from the question card, alive.
//
// The palette and the star / circle drawings are IMPORTED from the static
// illustration (src/components/wmi/concepts/solve-symbol-equations/index.tsx)
// rather than copied, so a shape keeps its exact identity from the question into
// the explanation and can never drift when the figure is redrawn.
//
// The lesson is the CARRY-ACROSS: once the first equation pins one star, that
// number physically travels down into the second equation and takes the star's
// place. That single move is what a child has to see.

// ── explainer-only inks (the question figure never lights a row up) ───────
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const MUTED = '#8B94A3'

const GLYPH = 34
/** Column widths, so a swapped star and a `+` never make the row jump. */
const SHAPE_CELL = 36
const OP_CELL = 20
const NUM_CELL = 30
const CHIP_H = 24

const FONT = 'font-display font-black tabular-nums'

/** One `+` / `=` / number in an equation row. */
function Sym({ text, size = 26, color }: { text: string; size?: number; color?: string }) {
  return (
    <span
      className={FONT}
      style={{ fontSize: size, color: color ?? SYMBOL_INK.ink, lineHeight: 1 }}
    >
      {text}
    </span>
  )
}

/** The value pill a star wears once the first equation has been shared out. */
function ValueChip({
  value,
  tone,
  layoutId,
  still,
}: {
  value: number
  tone: 'blue' | 'green'
  layoutId?: string
  still: boolean
}) {
  const green = tone === 'green'
  return (
    <motion.span
      layoutId={still ? undefined : layoutId}
      initial={still ? false : { scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={still ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 26 }}
      className={`inline-flex items-center justify-center rounded-full border-2 px-2 ${FONT}`}
      style={{
        minWidth: 32,
        height: CHIP_H,
        fontSize: 16,
        background: green ? GREEN_SOFT : '#FFFFFF',
        borderColor: green ? GREEN : SYMBOL_INK.ink,
        color: green ? GREEN_INK : SYMBOL_INK.ink,
      }}
    >
      {value}
    </motion.span>
  )
}

/** One column of an equation row: the token, with a reserved slot underneath. */
function Cell({ token, below, w }: { token: ReactNode; below?: ReactNode; w: number }) {
  return (
    <div className="flex flex-col items-center" style={{ minWidth: w }}>
      <div className="flex h-[2.375rem] items-center justify-center">{token}</div>
      <div className="mt-1 flex h-[1.375rem] items-center justify-center">{below}</div>
    </div>
  )
}

/** A row of the board: an index badge, then the equation's cells. */
function EqRow({
  index,
  lit,
  children,
}: {
  index: number
  lit: boolean
  children: ReactNode
}) {
  return (
    <motion.div
      animate={{ scale: lit ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="flex w-full items-start justify-center gap-2 rounded-xl border-2 px-2 py-1.5"
      style={{
        background: lit ? BLUE_SOFT : 'transparent',
        borderColor: lit ? SYMBOL_INK.ink : 'transparent',
      }}
    >
      <span
        className={`mt-1.5 inline-flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-full ${FONT}`}
        style={{ background: lit ? SYMBOL_INK.ink : MUTED, color: SYMBOL_INK.cream, fontSize: 12 }}
      >
        {index}
      </span>
      <div className="flex flex-wrap items-start justify-center gap-x-1 gap-y-1">{children}</div>
    </motion.div>
  )
}

export default function SolveSymbolEquationsExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story: SymbolEqStoryboard = useMemo(
    () => buildSymbolEquationSteps(params, lang),
    [params, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((b) => b.hold) })
  const beat: SymbolEqBeat = story.steps[index] ?? story.steps[story.finalIndex]
  const still = !!reduce

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const { s, c, n, total1, total2 } = story
  const showStarValues = beat.eq1 !== 'idle'

  // Equation 1 — n stars, each wearing its share of the total once split.
  const eq1: ReactNode[] = []
  for (let i = 0; i < n; i++) {
    if (i > 0)
      eq1.push(<Cell key={`p${i}`} w={OP_CELL} token={<Sym text="+" color={SYMBOL_INK.operator} />} />)
    eq1.push(
      <Cell
        key={`s${i}`}
        w={SHAPE_CELL}
        token={<SymbolGlyphBox kind="star" size={GLYPH} />}
        below={
          showStarValues ? (
            // The carrier is the FIRST star's chip: it is the one that travels
            // into equation 2 on the swap beat, so it keeps a shared layoutId.
            <ValueChip
              value={s}
              tone="blue"
              still={still}
              layoutId={i === 0 && !beat.swapped ? 'se-carry' : undefined}
            />
          ) : null
        }
      />,
    )
  }
  eq1.push(<Cell key="eq" w={OP_CELL} token={<Sym text="=" color={SYMBOL_INK.operator} />} />)
  eq1.push(<Cell key="t1" w={NUM_CELL} token={<Sym text={String(total1)} />} />)

  // Equation 2 — the star slot becomes the carried number on the swap beat.
  // Empty leading cells keep the two "=" stacked exactly as the question figure
  // draws them, so the second equation reads as the same system, indented.
  const eq2: ReactNode[] = []
  for (let i = 0; i < 2 * n - 4; i++) {
    eq2.push(<Cell key={`pad${i}`} w={i % 2 === 0 ? SHAPE_CELL : OP_CELL} token={null} />)
  }
  eq2.push(
    <Cell
      key="star2"
      w={SHAPE_CELL}
      token={
        beat.swapped ? (
          <ValueChip value={s} tone="blue" still={still} layoutId="se-carry" />
        ) : (
          <SymbolGlyphBox kind="star" size={GLYPH} />
        )
      }
    />,
    <Cell key="p2" w={OP_CELL} token={<Sym text="+" color={SYMBOL_INK.operator} />} />,
    <Cell
      key="circle"
      w={SHAPE_CELL}
      token={<SymbolGlyphBox kind="circle" size={GLYPH} />}
      below={beat.result ? <ValueChip value={c} tone="green" still={still} /> : null}
    />,
    <Cell key="eq2" w={OP_CELL} token={<Sym text="=" color={SYMBOL_INK.operator} />} />,
    <Cell key="t2" w={NUM_CELL} token={<Sym text={String(total2)} />} />,
  )

  const captionStyle = beat.result
    ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
    : { background: BLUE_SOFT, borderColor: SYMBOL_INK.ink, color: SYMBOL_INK.ink }

  // Strategy only — the beats carry the numbers, so the label never states what
  // a circle is worth.
  const ariaLabel = T(
    'Strategy: the first equation holds only stars, so its total shares out evenly and pins what one star is worth. Carry that number into the second equation in place of the star; whatever is left over belongs to the circle.',
    'Strategi: persamaan pertama isinya bintang saja, jadi totalnya bisa dibagi rata untuk mengunci nilai satu bintang. Bawa angka itu ke persamaan kedua menggantikan bintang; sisanya adalah nilai lingkaran.',
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2 rounded-2xl border-2 px-2 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the fact earned so far: one star = s */}
        <div className="flex min-h-[1.75rem] w-full items-center justify-center gap-1.5">
          {beat.fact ? (
            <motion.span
              initial={still ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={still ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 26 }}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 bg-white px-2.5 py-[0.125rem] ${FONT}`}
              style={{ borderColor: SYMBOL_INK.ink, color: SYMBOL_INK.ink, fontSize: 13 }}
            >
              <SymbolGlyphBox kind="star" size={17} />
              {`= ${s}`}
            </motion.span>
          ) : (
            <span className="font-display text-xs font-extrabold" style={{ color: MUTED }}>
              {T('One shape, one value', 'Satu bentuk, satu nilai')}
            </span>
          )}
        </div>

        <EqRow index={1} lit={beat.focus === 1}>
          {eq1}
        </EqRow>

        {/* the split: what the first equation's total was cut into */}
        <div className="flex min-h-[1.5rem] items-center justify-center">
          {beat.eq1 === 'share' && (
            <motion.span
              initial={still ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-full border-2 bg-white px-2.5 py-[0.125rem] ${FONT}`}
              style={{ borderColor: SYMBOL_INK.ink, color: SYMBOL_INK.ink, fontSize: 14 }}
            >
              {`${total1} ÷ ${n} = ${s}`}
            </motion.span>
          )}
        </div>

        <EqRow index={2} lit={beat.focus === 2}>
          {eq2}
        </EqRow>

        {/* the leftover: posed, then done */}
        <div className="flex min-h-[2rem] items-center justify-center">
          {beat.subtract && (
            <motion.span
              key={beat.subtract}
              initial={still ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className={`rounded-xl border-2 px-3 py-1 ${FONT}`}
              style={
                beat.subtract === 'done'
                  ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK, fontSize: 20 }
                  : { background: '#FFFFFF', borderColor: SYMBOL_INK.ink, color: SYMBOL_INK.ink, fontSize: 20 }
              }
            >
              {beat.subtract === 'done'
                ? `${total2} − ${s} = ${c}`
                : `${total2} − ${s} = ?`}
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
