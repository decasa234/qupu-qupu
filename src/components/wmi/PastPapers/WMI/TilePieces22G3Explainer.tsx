import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Tiling3x3 } from './TilePieces22G3Illustration'
import { buildTilePieces22G3Steps, T1, T2, T3, T4, T5, T6 } from './tilePieces22G3Steps'

// WMI-22F3A-Q20 — Tile-pieces 3×3 explainer.
//
// Strategy: checkerboard parity pins the 1×1 to a majority-colour cell
// (corner or centre), then enumerate the centre case (2 ways) and corner
// case (4 ways) to get 2 + 4 = 6.

// ---------------------------------------------------------------------------
// Colour tokens (echo the illustration palette)
// ---------------------------------------------------------------------------

const GREEN = '#10B981'
const BLUE_BORDER = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const BLUE_TEXT = '#1e3a5f'

// ---------------------------------------------------------------------------
// Checkerboard parity diagram — pure SVG, no random
// ---------------------------------------------------------------------------

const CB_CELL = 36
const CB_GAP = 2
const CB_SIZE = 3 * CB_CELL + 2 * CB_GAP

// Majority colour is the top-left cell colour (dark).
const DARK = '#92400e'  // amber-800 — "dark" majority cells
const LIGHT = '#fef3c7' // amber-50  — "light" minority cells

function CheckerBoard() {
  const rects = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const isDark = (r + c) % 2 === 0
      rects.push(
        <rect
          key={`${r}-${c}`}
          x={c * (CB_CELL + CB_GAP)}
          y={r * (CB_CELL + CB_GAP)}
          width={CB_CELL}
          height={CB_CELL}
          rx={4}
          fill={isDark ? DARK : LIGHT}
          stroke="#78350f"
          strokeWidth={1.5}
        />,
      )
    }
  }
  // Mark the 5 dark (majority) cells with a small crown / star dot
  const majorityDots = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if ((r + c) % 2 === 0) {
        majorityDots.push(
          <circle
            key={`dot-${r}-${c}`}
            cx={c * (CB_CELL + CB_GAP) + CB_CELL / 2}
            cy={r * (CB_CELL + CB_GAP) + CB_CELL / 2}
            r={5}
            fill="#fef9c3"
            stroke="#78350f"
            strokeWidth={1.2}
          />,
        )
      }
    }
  }
  // Outer border
  const border = (
    <rect
      x={0}
      y={0}
      width={CB_SIZE}
      height={CB_SIZE}
      fill="none"
      stroke="#78350f"
      strokeWidth={2}
    />
  )
  return (
    <svg
      viewBox={`0 0 ${CB_SIZE} ${CB_SIZE}`}
      width={CB_SIZE}
      height={CB_SIZE}
      aria-hidden="true"
    >
      {rects}
      {majorityDots}
      {border}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// ParityLegend — small legend showing dark = corner+centre
// ---------------------------------------------------------------------------

function ParityLegend({ lang }: { lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
      }}
    >
      <CheckerBoard />
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#92400e',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              background: DARK,
              borderRadius: 3,
              border: '1.5px solid #78350f',
            }}
          />
          {t('5 dark (majority)', '5 gelap (mayoritas)')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              background: LIGHT,
              borderRadius: 3,
              border: '1.5px solid #78350f',
            }}
          />
          {t('4 light', '4 terang')}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TilingGrid — renders up to 2 Tiling3x3 side by side (or 6 in final beat)
// ---------------------------------------------------------------------------

const TILING_CELL = 40   // slightly smaller than the illustration's 44 to fit two side by side
const GRID_PX = TILING_CELL * 3   // = 120

interface TilingRowProps {
  tilings: import('./TilePieces22G3Illustration').TilingDescription[]
  /** Max tilings to show (use 2 for per-beat; 6 for final). */
  max?: number
  label?: string
}

function TilingRow({ tilings, max = 2, label }: TilingRowProps) {
  const visible = tilings.slice(0, max)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {label && (
        <span style={{ fontSize: 11, fontWeight: 800, color: '#374151', letterSpacing: '0.03em' }}>
          {label}
        </span>
      )}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
        }}
      >
        {visible.map((tiling, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: i * 0.08 }}
          >
            <svg
              viewBox={`0 0 ${GRID_PX} ${GRID_PX}`}
              width={GRID_PX}
              height={GRID_PX}
              aria-hidden="true"
              style={{ display: 'block' }}
            >
              <Tiling3x3 tiling={tiling} cellSize={TILING_CELL} x={0} y={0} />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CountBadge — animated running tally
// ---------------------------------------------------------------------------

interface CountBadgeProps {
  count: number
  label: string
}

function CountBadge({ count, label }: CountBadgeProps) {
  return (
    <motion.div
      key={count}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#ede9fe',
        border: '2px solid #7c6fb0',
        borderRadius: 10,
        padding: '4px 14px',
        fontWeight: 800,
        fontSize: 15,
        color: '#4c1d95',
        minWidth: 90,
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', opacity: 0.8 }}>
        {label}
      </span>
      <span>{count}</span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AnswerBadge — final answer badge
// ---------------------------------------------------------------------------

function AnswerBadge({ lang }: { lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 20 }}
      style={{
        background: '#D1FAE5',
        border: `3px solid ${GREEN}`,
        borderRadius: 14,
        padding: '8px 22px',
        fontWeight: 900,
        fontSize: 20,
        color: '#065F46',
        letterSpacing: '0.04em',
        textAlign: 'center',
      }}
    >
      2 + 4 = 6
      <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginTop: 2 }}>
        {t('centre + corner ways', 'cara pusat + pojok')}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// FinalGrid — all 6 tilings in a 3×2 grid layout
// ---------------------------------------------------------------------------

function FinalGrid() {
  const all = [T5, T6, T1, T2, T3, T4]
  const SMALL = 32
  const SZ = SMALL * 3
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto)',
        gap: 8,
        justifyContent: 'center',
      }}
    >
      {all.map((tiling, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22, delay: i * 0.06 }}
        >
          <svg
            viewBox={`0 0 ${SZ} ${SZ}`}
            width={SZ}
            height={SZ}
            aria-hidden="true"
            style={{ display: 'block' }}
          >
            <Tiling3x3
              tiling={tiling}
              cellSize={SMALL}
              x={0}
              y={0}
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function TilePieces22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTilePieces22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Checkerboard parity shows the 1×1 must sit on a corner or centre cell. Enumerating gives 2 centre ways + 4 corner ways = 6 distinct tilings.',
    'Paritas papan catur menunjukkan bahwa kotak 1×1 harus berada di pojok atau pusat. Enumerasi memberi 2 cara pusat + 4 cara pojok = 6 cara berbeda.',
  )

  const countLabel = t('ways so far', 'cara sejauh ini')
  const centreLbl = t('Centre tilings', 'Cara pusat')
  const cornerLbl = t('Corner tilings', 'Cara pojok')

  const showCount = beat.count > 0 && !beat.showAnswer

  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">

        {/* Main content area — switches per beat */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0.5, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          {beat.phase === 'parity' && (
            <ParityLegend lang={lang} />
          )}

          {beat.phase === 'centre-both' && (
            <TilingRow tilings={beat.tilings} max={2} label={centreLbl} />
          )}

          {beat.phase === 'corner-pair1' && (
            <TilingRow tilings={beat.tilings} max={2} label={cornerLbl} />
          )}

          {beat.phase === 'corner-pair2' && (
            <TilingRow tilings={beat.tilings} max={2} label={cornerLbl} />
          )}

          {beat.phase === 'answer' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <FinalGrid />
              <AnswerBadge lang={lang} />
            </div>
          )}
        </motion.div>

        {/* Running count badge */}
        {showCount && (
          <CountBadge count={beat.count} label={countLabel} />
        )}

        {/* Caption box */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}

