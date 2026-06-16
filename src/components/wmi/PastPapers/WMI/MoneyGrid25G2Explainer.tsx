import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MONEY_GRID25, ROW_SUMS25, COL_SUMS25, SHADED25 } from './MoneyGrid25G2Illustration'
import { buildMoneyGridStory, type ShadeKey } from './moneyGrid25Steps'

// Post-answer explainer for WMI-25F2A-Q24 (HARD): a 4×4 money grid whose four
// shaded squares A,B,C,D are the hidden answer. We mirror the static figure
// (same geometry, peach coins, pink shaded cells) and bring it alive — first
// solving the rows from their totals, then revealing A→B→C→D one beat at a time
// (each read off its row + column total), then summing to 70.
//
// All values come from the shared MONEY_GRID25 / ROW_SUMS25 / COL_SUMS25 /
// SHADED25 exports; nothing about the answer is hardcoded in this file.

const INK = '#1F2937'
const PINK = '#F6C6C6' // fill-qupu-* echo for the shaded squares
const PINK_INK = '#B23B3B' // shaded value text
const PEACH = '#FDE3C8' // fill-qupu-peach echo
const ORANGE = '#F2994A' // stroke-qupu-brand-orange echo
const GREEN = '#10B981'
const GREEN_GLOW = '#34D399'

// ---- geometry (mirrors MoneyGrid25Figure) ----
const CELL = 52
const X0 = 14
const Y0 = 14
const COIN_GAP = 20
const COIN_R = 22
const GRID_W = 4 * CELL
const GRID_H = 4 * CELL
const VB_W = X0 + GRID_W + COIN_GAP + 2 * COIN_R + 14
const VB_H = Y0 + GRID_H + COIN_GAP + 2 * COIN_R + 14

function Coin({ cx, cy, amount, glow }: { cx: number; cy: number; amount: number; glow: boolean }) {
  return (
    <g>
      {glow && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={COIN_R + 4}
          fill="none"
          stroke={ORANGE}
          strokeWidth={3}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity }}
        />
      )}
      <circle cx={cx} cy={cy} r={COIN_R} fill={PEACH} stroke={ORANGE} strokeWidth={2} />
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={900}
        fill={INK}
        className="font-display"
      >
        {amount}
      </text>
    </g>
  )
}

// Which shaded keys are revealed at a given revealCount, in A,B,C,D order.
const ORDER: ShadeKey[] = ['A', 'B', 'C', 'D']

export default function MoneyGrid25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildMoneyGridStory(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Keys revealed so far + the cell currently in focus.
  const revealedKeys = new Set(ORDER.slice(0, beat.revealCount))
  const focus = beat.focus
  const focusCell = focus ? story.shaded.find((s) => s.key === focus) ?? null : null

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={t(
        `Strategy: solve each row from its total, place the $50 bills to match the columns, then read the four shaded squares — A is $${SHADED25.A}, B is $${SHADED25.B}, C is $${SHADED25.C}, D is $${SHADED25.D} — and add them to get ${story.total}.`,
        `Strategi: selesaikan tiap baris dari totalnya, tempatkan uang $50 agar cocok dengan kolom, lalu baca empat kotak berarsir — A = $${SHADED25.A}, B = $${SHADED25.B}, C = $${SHADED25.C}, D = $${SHADED25.D} — dan jumlahkan menjadi ${story.total}.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* top-right "$" marker */}
          <text
            x={X0 + GRID_W + COIN_GAP + COIN_R}
            y={Y0 - 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={900}
            fill={INK}
            className="font-display"
          >
            $
          </text>

          {MONEY_GRID25.map((row, r) =>
            row.map((cell, c) => {
              const x = X0 + c * CELL
              const y = Y0 + r * CELL
              const shaded = cell.label != null
              const isFocusCell = focusCell != null && focusCell.row === r && focusCell.col === c
              const revealed = shaded && revealedKeys.has(cell.label as ShadeKey)
              const showValue = !shaded || revealed
              // Dim cells that are not on the focused cell's row/column so the
              // active deduction stands out.
              const onFocusLine =
                focusCell == null || focusCell.row === r || focusCell.col === c
              const dim = focusCell != null && !onFocusLine
              return (
                <g key={`${r}-${c}`} opacity={dim ? 0.32 : 1}>
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    fill={shaded ? PINK : 'white'}
                    stroke={INK}
                    strokeWidth={1.8}
                  />
                  {isFocusCell && (
                    <motion.rect
                      x={x + 1.5}
                      y={y + 1.5}
                      width={CELL - 3}
                      height={CELL - 3}
                      fill="none"
                      stroke={ORANGE}
                      strokeWidth={3}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                    />
                  )}
                  {showValue && (
                    <motion.text
                      key={`${r}-${c}-${revealed ? 'on' : 'off'}`}
                      x={x + CELL / 2}
                      y={y + CELL / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={16}
                      fontWeight={800}
                      fill={shaded ? PINK_INK : INK}
                      className="font-display"
                      initial={shaded ? { opacity: 0, scale: 0.4 } : false}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                    >
                      {cell.value}
                    </motion.text>
                  )}
                  {shaded && (
                    <text
                      x={x + CELL - 8}
                      y={y + CELL - 9}
                      textAnchor="end"
                      dominantBaseline="central"
                      fontSize={13}
                      fontStyle="italic"
                      fontWeight={700}
                      fill={INK}
                    >
                      {cell.label}
                    </text>
                  )}
                </g>
              )
            }),
          )}

          {/* row-sum coins on the right — glow the focused cell's row */}
          {ROW_SUMS25.map((s, r) => (
            <Coin
              key={`row-${r}`}
              cx={X0 + GRID_W + COIN_GAP + COIN_R}
              cy={Y0 + r * CELL + CELL / 2}
              amount={s}
              glow={focusCell != null && focusCell.row === r}
            />
          ))}

          {/* bottom-left "$" marker */}
          <text
            x={X0 - 4}
            y={Y0 + GRID_H + COIN_GAP + COIN_R + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={900}
            fill={INK}
            className="font-display"
          >
            $
          </text>

          {/* column-sum coins below — glow the focused cell's column */}
          {COL_SUMS25.map((s, c) => (
            <Coin
              key={`col-${c}`}
              cx={X0 + c * CELL + CELL / 2}
              cy={Y0 + GRID_H + COIN_GAP + COIN_R}
              amount={s}
              glow={focusCell != null && focusCell.col === c}
            />
          ))}
        </svg>

        {/* running A+B+C+D tally chips */}
        <div className="flex items-center gap-1.5">
          {story.shaded.map((s) => {
            const shown = revealedKeys.has(s.key)
            return (
              <div
                key={s.key}
                className="flex h-8 w-12 items-center justify-center rounded-lg border-2 font-display text-xs font-extrabold"
                style={
                  shown
                    ? { background: PINK, borderColor: PINK_INK, color: PINK_INK }
                    : { background: '#FBEAEA', borderColor: '#E7BDBD', color: '#C99A9A' }
                }
              >
                {s.key}={shown ? `$${s.value}` : '?'}
              </div>
            )
          })}
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.result && (
            <motion.span
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16 }}
              style={{ display: 'inline-block', color: GREEN_GLOW, marginRight: 6 }}
            >
              ✓
            </motion.span>
          )}
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
