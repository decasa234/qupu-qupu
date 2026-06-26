// SASMO-19-G3-Q16 — post-answer animation.
// Reuses sub-components + layout constants from the illustration so the
// animated overlays sit precisely on the static scene.
//
// Beats:
//   0. intro        — full house, ask to count
//   1. main-house   — amber overlay on main body → +1
//   2. attic        — overlay attic window → +1 = 2
//   3. left-win     — overlay left 2×2 window → +9 = 11
//   4. right-win    — overlay right 2×2 window → +9 = 20
//   5. door-area    — overlay door + side panels → +3 = 23
//   6. garage-body  — overlay garage body → +1 = 24
//   7. garage-win   — overlay garage window → +6 = 30
//   8. result       — all overlays green, show total

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W, SVG_H,
  G, GROOF, GW, GW_D1, GW_D2,
  H, HROOF, AW,
  LW, LW_DIV_X, LW_DIV_Y,
  RW, RW_DIV_X, RW_DIV_Y,
  DR, LP, RP,
  C,
  Window2x2,
  GarageWindow3,
} from './HouseRectsSASMO19G3Q16Illustration'
import { buildHouseRectsSteps } from './houseRectsSASMO19G3Q16Steps'

// ── Colour tokens for overlays ────────────────────────────────────────────────
const AMBER_OV = 'rgba(251,191,36,0.40)'
const GREEN_OV = 'rgba(16,185,129,0.40)'
const GREEN = '#10B981'
const AMBER = '#F59E0B'
const INK = '#1F2937'
const FADE = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
const TR = { duration: 0.35 }

// ── Default export ────────────────────────────────────────────────────────────

export default function HouseRectsSASMO19G3Q16Explainer({
  lang = 'en',
  step = 0,
  playing = false,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const steps = useMemo(() => buildHouseRectsSteps(lang as 'en' | 'id'), [lang])
  const finalIndex = steps.length - 1
  const holds = useMemo(() => steps.map((s) => s.hold), [steps])
  const beatIndex = useBeatControl(finalIndex, {
    step, playing, onStepCount, onStepChange, onPlayEnd, holds,
  })
  const beat = steps[Math.min(beatIndex, finalIndex)]

  const ov = beat.result ? GREEN_OV : AMBER_OV
  const badgeColor = beat.result ? GREEN : AMBER
  const badgeText = beat.result ? 'white' : INK

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(320, SVG_W)}
        style={{ display: 'block' }}
      >
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* ── Static house (same as illustration) ── */}

        {/* Garage */}
        <rect x={G.x} y={G.y} width={G.w} height={G.h} fill={C.GARAGE_FILL} stroke={C.STROKE} strokeWidth={2} />
        <polygon
          points={`${G.x},${G.y} ${GROOF.px},${GROOF.py} ${G.x + G.w},${G.y}`}
          fill={C.ROOF_FILL} stroke={C.ROOF_STROKE} strokeWidth={2}
        />
        <GarageWindow3 x={GW.x} y={GW.y} w={GW.w} h={GW.h} d1={GW_D1} d2={GW_D2} />

        {/* Main house */}
        <rect x={H.x} y={H.y} width={H.w} height={H.h} fill={C.WALL} stroke={C.STROKE} strokeWidth={2} />
        <polygon
          points={`${H.x},${H.y} ${HROOF.px},${HROOF.py} ${H.x + H.w},${H.y}`}
          fill={C.ROOF_FILL} stroke={C.ROOF_STROKE} strokeWidth={2}
        />
        <rect x={AW.x} y={AW.y} width={AW.w} height={AW.h} fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5} />
        <Window2x2 x={LW.x} y={LW.y} w={LW.w} h={LW.h} divX={LW_DIV_X} divY={LW_DIV_Y} />
        <Window2x2 x={RW.x} y={RW.y} w={RW.w} h={RW.h} divX={RW_DIV_X} divY={RW_DIV_Y} />
        <rect x={DR.x} y={DR.y} width={DR.w} height={DR.h} fill={C.DOOR} stroke={C.DOOR_STROKE} strokeWidth={1.5} />
        <rect x={LP.x} y={LP.y} width={LP.w} height={LP.h} fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5} />
        <rect x={RP.x} y={RP.y} width={RP.w} height={RP.h} fill={C.WIN} stroke={C.WIN_STROKE} strokeWidth={1.5} />

        {/* ── Animated highlight overlays ── */}
        <AnimatePresence>
          {beat.highlightMain && (
            <motion.rect
              key="hl-main"
              x={H.x} y={H.y} width={H.w} height={H.h}
              fill={ov} strokeWidth={0}
              {...FADE} transition={TR}
            />
          )}
          {beat.highlightAttic && (
            <motion.rect
              key="hl-attic"
              x={AW.x} y={AW.y} width={AW.w} height={AW.h}
              fill={ov} strokeWidth={0}
              {...FADE} transition={TR}
            />
          )}
          {beat.highlightLeftWin && (
            <motion.rect
              key="hl-lw"
              x={LW.x} y={LW.y} width={LW.w} height={LW.h}
              fill={ov} strokeWidth={0}
              {...FADE} transition={TR}
            />
          )}
          {beat.highlightRightWin && (
            <motion.rect
              key="hl-rw"
              x={RW.x} y={RW.y} width={RW.w} height={RW.h}
              fill={ov} strokeWidth={0}
              {...FADE} transition={TR}
            />
          )}
          {beat.highlightDoor && (
            <motion.g key="hl-door-area" {...FADE} transition={TR}>
              <rect x={DR.x} y={DR.y} width={DR.w} height={DR.h} fill={ov} strokeWidth={0} />
              <rect x={LP.x} y={LP.y} width={LP.w} height={LP.h} fill={ov} strokeWidth={0} />
              <rect x={RP.x} y={RP.y} width={RP.w} height={RP.h} fill={ov} strokeWidth={0} />
            </motion.g>
          )}
          {beat.highlightGarageBody && (
            <motion.rect
              key="hl-garage"
              x={G.x} y={G.y} width={G.w} height={G.h}
              fill={ov} strokeWidth={0}
              {...FADE} transition={TR}
            />
          )}
          {beat.highlightGarageWin && (
            <motion.rect
              key="hl-gw"
              x={GW.x} y={GW.y} width={GW.w} height={GW.h}
              fill={ov} strokeWidth={0}
              {...FADE} transition={TR}
            />
          )}
        </AnimatePresence>

        {/* Running total badge (top-right) */}
        {beat.runningTotal > 0 && (
          <g>
            <rect
              x={SVG_W - 52} y={4} width={48} height={26} rx={6}
              fill={badgeColor}
            />
            <text
              x={SVG_W - 28} y={17}
              textAnchor="middle" dominantBaseline="central"
              fontSize={13} fontWeight={700}
              fill={badgeText}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {beat.runningTotal}
            </text>
          </g>
        )}
      </svg>

      {/* Equation + caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.phase}
          className="text-center space-y-1 px-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
        >
          {beat.equation !== '' && (
            <p className="text-sm font-mono font-bold text-amber-700">{beat.equation}</p>
          )}
          <p className={`text-sm font-medium ${beat.result ? 'text-emerald-600' : 'text-slate-700'}`}>
            {beat.caption}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
