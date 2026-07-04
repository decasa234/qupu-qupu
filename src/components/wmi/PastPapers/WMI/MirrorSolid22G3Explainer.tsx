/**
 * MirrorSolid22G3Explainer — WMI-22F3A-Q24
 *
 * Post-answer animation teaching the "count cells, force the shadows, maximise" strategy:
 *   1. Count the 13 unit cells (8 bottom + 4 slab + 1 top) and recall the piece types.
 *   2. Decode mirror shadows — each coloured mirror cell pins the colour of the
 *      piece touching that surface.
 *   3. Place the forced pieces: one black 1×1×3 along the left floor and TWO gray
 *      1×1×2 blocks (one lying in the slab, one standing at the back) = 7 cells.
 *   4. Maximise white by filling every remaining cell with a white 1×1×1.
 *   5. Count → 13 − 7 = 6 white cubes at most.
 *
 * Reuses IsoBlocks + MirrorGrid from MirrorSolid22G3Illustration so the visual
 * reads as the same scene coming alive. Forced pieces are coloured from beat 2
 * onward; the white remainder lights up (soft green tint) on beat 3.
 *
 * SSR-safe — no Math.random, no Date, pure render of props + lang.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  IsoBlocks,
  MirrorGrid,
  UNIT_CUBES,
  SIDE_MIRROR,
  BACK_MIRROR,
  type Cube,
} from './MirrorSolid22G3Illustration'
import { buildMirrorSolid22G3Steps } from './mirrorSolid22G3Steps'

// ---------------------------------------------------------------------------
// Colour tokens (mirror the illustration palette)
// ---------------------------------------------------------------------------

const WHITE_FILL = '#ffffff'
const GRAY_FILL = '#9ca3af'
const BLACK_FILL = '#3a3a3a'
const GREEN = '#10B981'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = GREEN
const GREEN_TEXT = '#065F46'

// ---------------------------------------------------------------------------
// Forced-piece assignments (script-verified against both mirror images)
// ---------------------------------------------------------------------------
// Black 1×1×3: lies along the left edge of the floor — its 3-long face is the
// side mirror's black stripe; its end face is the back mirror's black cell.
const BLACK_PIECE: Cube[] = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: 2, z: 0 },
]

// Gray 1×1×2 #1: lies in the slab's left column — its 2-long face is the side
// mirror's gray stripe; its end face is the back mirror's left gray cell.
const GRAY_PIECE_A: Cube[] = [
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 1, z: 1 },
]

// Gray 1×1×2 #2: stands upright at the back — its 2-tall face is the back
// mirror's vertical gray pair. One gray block can't cover the mirror's gray L,
// so this second gray is forced.
const GRAY_PIECE_B: Cube[] = [
  { x: 1, y: 0, z: 0 },
  { x: 1, y: 0, z: 1 },
]

const WHITE_HINT_FILL = '#ECFDF5' // soft green tint for "counted as white" cells

function isSameCube(a: Cube, b: Cube) {
  return a.x === b.x && a.y === b.y && a.z === b.z
}

function cubeInList(c: Cube, list: Cube[]) {
  return list.some((p) => isSameCube(c, p))
}

/** Return a fill colour for a unit cube depending on the beat's solidFill mode. */
function getCubeFill(c: Cube, solidFill: false | 'forced' | 'full'): string {
  if (!solidFill) return WHITE_FILL
  if (cubeInList(c, BLACK_PIECE)) return BLACK_FILL
  if (cubeInList(c, GRAY_PIECE_A) || cubeInList(c, GRAY_PIECE_B)) return GRAY_FILL
  // 'full' tints the maximised white cubes so the final count reads visually.
  return solidFill === 'full' ? WHITE_HINT_FILL : WHITE_FILL
}

// ---------------------------------------------------------------------------
// Piece-type legend chip
// ---------------------------------------------------------------------------

interface LegendChipProps {
  color: 'white' | 'gray' | 'black'
  label: string
  active: boolean
}

function LegendChip({ color, label, active }: LegendChipProps) {
  const bg = color === 'white' ? '#f3f4f6' : color === 'gray' ? GRAY_FILL : BLACK_FILL
  const text = color === 'black' ? '#ffffff' : '#1f2937'
  const border = active ? '#f59e0b' : '#d1d5db'
  const shadow = active ? '0 0 0 3px rgba(245,158,11,0.4)' : 'none'

  return (
    <motion.div
      animate={{ boxShadow: shadow, borderColor: border, scale: active ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        background: bg,
        color: text,
        border: `2px solid ${border}`,
        borderRadius: 10,
        padding: '4px 12px',
        fontFamily: 'sans-serif',
        fontSize: 13,
        fontWeight: 700,
        display: 'inline-block',
        minWidth: 90,
        textAlign: 'center',
      }}
    >
      {label}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Mirror highlight overlay (amber glow behind the mirror frame)
// ---------------------------------------------------------------------------

// Positions from the MirrorSolid22G3Illustration layout
const BACK_OX = 210
const BACK_OY = 26
const M_CELL = 26
const BACK_PAD = 10
const BACK_MW = 3 * M_CELL + BACK_PAD * 2
const BACK_MH = 3 * M_CELL + BACK_PAD * 2

const SIDE_OX = 40
const SIDE_OY = 150
const SIDE_MW = 3 * M_CELL + BACK_PAD * 2
const SIDE_MH = 3 * M_CELL + BACK_PAD * 2

interface MirrorHighlightProps {
  which: 'side' | 'back' | 'both' | null
}

function MirrorHighlight({ which }: MirrorHighlightProps) {
  if (!which) return null
  const showSide = which === 'side' || which === 'both'
  const showBack = which === 'back' || which === 'both'
  return (
    <>
      {showBack && (
        <motion.rect
          key="back-hl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          x={BACK_OX - 4}
          y={BACK_OY - 4}
          width={BACK_MW + 8}
          height={BACK_MH + 8}
          fill="#f59e0b"
          rx={6}
        />
      )}
      {showSide && (
        <motion.rect
          key="side-hl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.22 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          x={SIDE_OX - 4}
          y={SIDE_OY - 4}
          width={SIDE_MW + 8}
          height={SIDE_MH + 8}
          fill="#f59e0b"
          rx={6}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const VIEW_W = 600
const VIEW_H = 360
const DISPLAY_W = Math.min(560, VIEW_W)

export default function MirrorSolid22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildMirrorSolid22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bangun itu punya 13 sel satuan. Bayangan cermin memaksa satu balok hitam 1×1×3 (3 sel) dan dua balok abu-abu 1×1×2 (4 sel). Sisa selnya bisa diisi kubus putih 1×1×1: 13 − 7 = ${story.answer}. Paling banyak ${story.answer} kubus putih.`
      : `Explainer: the solid has 13 unit cells. The mirror shadows force one black 1×1×3 (3 cells) and two gray 1×1×2 blocks (4 cells). Every remaining cell can be a white 1×1×1 cube: 13 − 7 = ${story.answer}. At most ${story.answer} white cubes.`

  const fillFn = (c: Cube) => getCubeFill(c, beat.solidFill)

  const tWhite = lang === 'id' ? 'Putih 1×1×1' : 'White 1×1×1'
  const tGray = lang === 'id' ? 'Abu 1×1×2' : 'Gray 1×1×2'
  const tBlack = lang === 'id' ? 'Hitam 1×1×3' : 'Black 1×1×3'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Isometric solid + mirrors */}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width={DISPLAY_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* Mirror highlight overlays (rendered beneath grids) */}
          <AnimatePresence>
            <MirrorHighlight which={beat.mirrorHighlight} />
          </AnimatePresence>

          {/* BACK mirror */}
          <MirrorGrid
            grid={BACK_MIRROR}
            ox={BACK_OX}
            oy={BACK_OY}
            label={lang === 'id' ? 'Cermin (belakang)' : 'Back mirror'}
          />

          {/* SIDE (left) mirror */}
          <MirrorGrid
            grid={SIDE_MIRROR}
            ox={SIDE_OX}
            oy={SIDE_OY}
            label={lang === 'id' ? 'Cermin (samping)' : 'Side mirror'}
          />

          {/* Isometric solid — coloured per beat */}
          <IsoBlocks cubes={UNIT_CUBES} fill={fillFn} ox={250} oy={245} />
        </svg>

        {/* Piece-type legend chips */}
        <div className="flex flex-wrap justify-center gap-2">
          <LegendChip
            color="white"
            label={tWhite}
            active={beat.highlightPieces.includes('white')}
          />
          <LegendChip
            color="gray"
            label={tGray}
            active={beat.highlightPieces.includes('gray')}
          />
          <LegendChip
            color="black"
            label={tBlack}
            active={beat.highlightPieces.includes('black')}
          />
        </div>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
                : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
