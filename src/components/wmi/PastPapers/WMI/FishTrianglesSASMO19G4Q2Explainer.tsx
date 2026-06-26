// FishTrianglesSASMO19G4Q2Explainer — SASMO-19-G4-Q2
//
// Beat-by-beat animation teaching how to count all 12 triangles in the fish figure.
//   0. intro      — static figure.
//   1. tail-small — amber: highlight the 4 tail wedge triangles.
//   2. fins-small — green: highlight all 4 fin triangles.
//   3. medium     — sky-blue: highlight the 3 medium (2-wedge) combinations.
//   4. large      — violet: highlight the entire tail triangle.
//   5. result     — show the sum 8 + 3 + 1 = 12, Answer B.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W, SVG_H,
  L, T, R, B,
  DF_L, DF_R, DF_APEX,
  VF_L, VF_R, VF_APEX,
  PF_TIP, PF_TOP, PF_BOT,
  PI_TIP, PI_TOP, PI_BOT,
  TAIL_TOP, TAIL_TIP, TAIL_BOT,
  D1, D2, D3,
} from './FishTrianglesSASMO19G4Q2Illustration'
import { buildFishTrianglesSASMO19G4Q2Steps } from './fishTrianglesSASMO19G4Q2Steps'

// ── highlight colours ──────────────────────────────────────────────────────────
const C_TAIL   = '#FDE68A'  // amber  — individual tail wedges
const C_FINS   = '#BBF7D0'  // green  — fins
const C_MEDIUM = '#BAE6FD'  // sky    — medium combos
const C_LARGE  = '#DDD6FE'  // violet — whole tail
const INK      = '#1E293B'
const FILL     = '#F8FAFC'

// ── tail wedge groups ──────────────────────────────────────────────────────────
// W1..W4 share TAIL_TIP as the right vertex
const W1 = [TAIL_TOP, D1,       TAIL_TIP] as const
const W2 = [D1,       D2,       TAIL_TIP] as const
const W3 = [D2,       D3,       TAIL_TIP] as const
const W4 = [D3,       TAIL_BOT, TAIL_TIP] as const

// Medium triangles (2 consecutive wedges each)
const M1 = [TAIL_TOP, D2,       TAIL_TIP] as const  // W1 + W2
const M2 = [D1,       D3,       TAIL_TIP] as const  // W2 + W3
const M3 = [D2,       TAIL_BOT, TAIL_TIP] as const  // W3 + W4

type Pt = readonly [number, number]

function pts(verts: readonly Pt[]): string {
  return verts.map(([x, y]) => `${x},${y}`).join(' ')
}

interface PolyProps {
  verts: readonly Pt[]
  fill: string
  strokeWidth?: number
  opacity?: number
}

function Poly({ verts, fill, strokeWidth = 2, opacity = 1 }: PolyProps) {
  return (
    <polygon
      points={pts(verts)}
      fill={fill}
      stroke={INK}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      opacity={opacity}
    />
  )
}

export default function FishTrianglesSASMO19G4Q2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(
    () => buildFishTrianglesSASMO19G4Q2Steps(lang),
    [lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })

  const beat  = story.steps[Math.min(index, story.finalIndex)]
  const phase = beat?.phase ?? 'intro'

  const isTailSmall = phase === 'tail-small'
  const isFinsSmall = phase === 'fins-small'
  const isMedium    = phase === 'medium'
  const isLarge     = phase === 'large'
  const isResult    = phase === 'result'

  const showTailWedges  = isTailSmall
  const showTailMedium  = isMedium
  const showTailLarge   = isLarge || isResult
  const showFins        = isFinsSmall || isResult

  const headline = lang === 'id' ? beat?.headline_id : beat?.headline_en
  const sub      = lang === 'id' ? beat?.sub_id      : beat?.sub_en

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* ── base body kite ── */}
        <Poly verts={[L, T, R, B]} fill={FILL} />

        {/* ── tail: large highlight (whole tail, behind wedges) ── */}
        {showTailLarge && (
          <Poly verts={[TAIL_TOP, TAIL_TIP, TAIL_BOT]} fill={C_LARGE} strokeWidth={0} />
        )}

        {/* ── tail: medium highlights (3 overlapping 2-wedge groups) ── */}
        {showTailMedium && (
          <>
            <Poly verts={[...M1]} fill={C_MEDIUM} opacity={0.55} strokeWidth={0} />
            <Poly verts={[...M2]} fill={C_MEDIUM} opacity={0.55} strokeWidth={0} />
            <Poly verts={[...M3]} fill={C_MEDIUM} opacity={0.55} strokeWidth={0} />
          </>
        )}

        {/* ── tail: individual wedge highlights ── */}
        {showTailWedges && (
          <>
            <Poly verts={[...W1]} fill={C_TAIL} strokeWidth={0} />
            <Poly verts={[...W2]} fill={C_TAIL} strokeWidth={0} />
            <Poly verts={[...W3]} fill={C_TAIL} strokeWidth={0} />
            <Poly verts={[...W4]} fill={C_TAIL} strokeWidth={0} />
          </>
        )}

        {/* ── fin highlights ── */}
        {showFins && (
          <>
            <Poly verts={[DF_L, DF_APEX, DF_R]} fill={C_FINS} strokeWidth={0} />
            <Poly verts={[VF_L, VF_APEX, VF_R]} fill={C_FINS} strokeWidth={0} />
            <Poly verts={[PF_TIP, PF_TOP, PF_BOT]} fill={C_FINS} strokeWidth={0} />
            <Poly verts={[PI_TIP, PI_TOP, PI_BOT]} fill={C_FINS} strokeWidth={0} />
          </>
        )}

        {/* ── tail outlines (on top of fills) ── */}
        <Poly verts={[TAIL_TOP, TAIL_TIP, TAIL_BOT]} fill="none" />
        <line x1={TAIL_TIP[0]} y1={TAIL_TIP[1]} x2={D1[0]} y2={D1[1]} stroke={INK} strokeWidth="1.5" />
        <line x1={TAIL_TIP[0]} y1={TAIL_TIP[1]} x2={D2[0]} y2={D2[1]} stroke={INK} strokeWidth="1.5" />
        <line x1={TAIL_TIP[0]} y1={TAIL_TIP[1]} x2={D3[0]} y2={D3[1]} stroke={INK} strokeWidth="1.5" />

        {/* ── fin outlines ── */}
        <Poly verts={[DF_L, DF_APEX, DF_R]}       fill="none" />
        <Poly verts={[VF_L, VF_APEX, VF_R]}       fill="none" />
        <Poly verts={[PF_TIP, PF_TOP, PF_BOT]}    fill="none" />
        <Poly verts={[PI_TIP, PI_TOP, PI_BOT]}    fill="none" strokeWidth={1.5} />

        {/* ── wedge index labels (tail-small beat) ── */}
        {isTailSmall && (
          <>
            {/* label each wedge near its centroid */}
            {([
              { verts: W1, label: 'W1' },
              { verts: W2, label: 'W2' },
              { verts: W3, label: 'W3' },
              { verts: W4, label: 'W4' },
            ] as const).map(({ verts, label }) => {
              const cx = Math.round((verts[0][0] + verts[1][0] + verts[2][0]) / 3)
              const cy = Math.round((verts[0][1] + verts[1][1] + verts[2][1]) / 3)
              return (
                <text
                  key={label}
                  x={cx}
                  y={cy + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={INK}
                >
                  {label}
                </text>
              )
            })}
          </>
        )}

        {/* ── result beat: count labels ── */}
        {isResult && (
          <>
            <text x={148} y={92} textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C3AED">
              {lang === 'id' ? 'Total: 12' : 'Total: 12'}
            </text>
          </>
        )}
      </svg>

      {/* ── caption ── */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '8px 12px',
          background: '#F1F5F9',
          borderRadius: '8px',
          marginTop: '8px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
          {headline}
        </div>
        {sub && (
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
            {sub}
          </div>
        )}
      </motion.div>
    </div>
  )
}
