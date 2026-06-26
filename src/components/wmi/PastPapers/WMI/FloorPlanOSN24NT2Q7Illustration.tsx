// FloorPlanOSN24NT2Q7Illustration.tsx
// OSN 2024 SD Nasional Teori2 — Q7 (seed Q7)
// "Gambar di bawah merupakan denah rumah dalam satuan meter."
//
// Named export `FloorPlanBase` renders all rooms as a <g> (no outer <svg>),
// so the explainer can wrap it with its own viewBox + overlays.
// Default export wraps `FloorPlanBase` in a standalone <svg> with legend.
//
// Pure SVG, SSR-safe, no hooks, no random, no Date.

// ── Scale + offsets ─────────────────────────────────────────────────────────
/** Pixels per metre */
export const S = 44
/** Left offset (room for left-edge dimension labels) */
export const OX = 68
/** Top offset */
export const OY = 28

// ── Floor-plan geometry (metres) ────────────────────────────────────────────
export const M = {
  Y_MID:    2.94,  // top-section / mid-section boundary
  Y_BOT:    5.91,  // mid-section / bottom-section boundary
  Y_DB:     6.89,  // bottom of Dapur/Teras strip (5.91 + 0.98)
  Y_TOTAL:  9.92,

  KT1_R:   3.01,
  AJ_R:    4.62,   // Area Jemur right / Ruang Utama right / KT3 left
  KM1_R:   5.97,
  KM2_R:   7.37,   // KT3 right / Taman-right left
  DAPUR_R: 2.01,
  TERAS_R: 4.66,   // 2.01 + 2.65
  TAMAN_R: 4.01,

  TOP_W:   9.89,
  BOT_W:   6.98,
  KM_H:    1.50,   // K. Mandi height from top wall
}

export const rightXm = (y: number) =>
  M.TOP_W - ((M.TOP_W - M.BOT_W) / M.Y_TOTAL) * y

export const pxX = (xm: number) => OX + xm * S
export const pxY = (ym: number) => OY + ym * S

// ── Pre-computed pixel positions ─────────────────────────────────────────────
export const PX = {
  L:      pxX(0),
  KT1R:   pxX(M.KT1_R),
  AJR:    pxX(M.AJ_R),
  KM1R:   pxX(M.KM1_R),
  KM2R:   pxX(M.KM2_R),
  DR:     pxX(M.DAPUR_R),
  TR:     pxX(M.TERAS_R),
  TamanR: pxX(M.TAMAN_R),
  BotR:   pxX(M.BOT_W),
  RY0:    pxX(rightXm(0)),
  RY_MID: pxX(rightXm(M.Y_MID)),
  RY_BOT: pxX(rightXm(M.Y_BOT)),
  RY_DB:  pxX(rightXm(M.Y_DB)),
  RY_TOT: pxX(M.BOT_W),
}

export const PY = {
  T:      pxY(0),
  KMB:    pxY(M.KM_H),
  MID:    pxY(M.Y_MID),
  BOT:    pxY(M.Y_BOT),
  DB:     pxY(M.Y_DB),
  TOTAL:  pxY(M.Y_TOTAL),
}

export const SVG_W = OX + M.TOP_W * S + 80   // ~590
export const SVG_H = OY + M.Y_TOTAL * S + 22 // ~487

// ── Colour palette ─────────────────────────────────────────────────────────
export const C = {
  KARPET_A: '#FDE68A',
  KARPET_B: '#BFDBFE',
  RUMPUT:   '#BBF7D0',
  NEUTRAL:  '#F3F4F6',
  CORRIDOR: '#E5E7EB',
  WALL:     '#374151',
  LABEL:    '#111827',
  DIM:      '#6B7280',
}

const SW = 1.5

// ── Sub-component: text helpers ───────────────────────────────────────────────
function RL({ x, y, t, sub, sm }: {
  x: number; y: number; t: string; sub?: string; sm?: boolean
}) {
  return (
    <text
      x={x} y={sub ? y - 5 : y}
      textAnchor="middle" dominantBaseline="middle"
      fontSize={sm ? 7 : 8.5} fontWeight="600" fill={C.LABEL}
    >
      {t}
      {sub && <tspan x={x} dy="11" fontWeight="400" fontSize={7}>{sub}</tspan>}
    </text>
  )
}

function DL({ x, y, t }: { x: number; y: number; t: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
      fontSize={7} fill={C.DIM}>{t}</text>
  )
}

// ── Named export: FloorPlanBase ───────────────────────────────────────────────
// Renders all rooms, walls, labels, and dimension ticks as a <g>.
// Wrap in <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`}> for standalone use.
export function FloorPlanBase() {
  const { PX: px, PY: py } = { PX, PY }
  const p = px, q = py

  return (
    <g>
      {/* outer lot boundary */}
      <polygon
        points={`${p.L},${q.T} ${p.RY0},${q.T} ${p.RY_TOT},${q.TOTAL} ${p.L},${q.TOTAL}`}
        fill="white" stroke={C.WALL} strokeWidth={2}
      />

      {/* ── TOP SECTION ─────────────────────────────── */}
      {/* KT1 */}
      <rect x={p.L} y={q.T} width={p.KT1R-p.L} height={q.MID-q.T}
        fill={C.KARPET_B} stroke={C.WALL} strokeWidth={SW} />
      {/* Area Jemur */}
      <rect x={p.KT1R} y={q.T} width={p.AJR-p.KT1R} height={q.MID-q.T}
        fill={C.RUMPUT} stroke={C.WALL} strokeWidth={SW} />
      {/* Corridor above K. Mandi */}
      <rect x={p.AJR} y={q.T} width={p.KM2R-p.AJR} height={q.KMB-q.T}
        fill={C.CORRIDOR} stroke={C.WALL} strokeWidth={SW} />
      {/* K. Mandi 1 */}
      <rect x={p.AJR} y={q.KMB} width={p.KM1R-p.AJR} height={q.MID-q.KMB}
        fill={C.NEUTRAL} stroke={C.WALL} strokeWidth={SW} />
      {/* K. Mandi 2 */}
      <rect x={p.KM1R} y={q.KMB} width={p.KM2R-p.KM1R} height={q.MID-q.KMB}
        fill={C.NEUTRAL} stroke={C.WALL} strokeWidth={SW} />
      {/* KT2 (trapezoid) */}
      <polygon
        points={`${p.KM2R},${q.T} ${p.RY0},${q.T} ${p.RY_MID},${q.MID} ${p.KM2R},${q.MID}`}
        fill={C.KARPET_B} stroke={C.WALL} strokeWidth={SW} />

      {/* ── MIDDLE SECTION ──────────────────────────── */}
      {/* Ruang Utama */}
      <rect x={p.L} y={q.MID} width={p.AJR-p.L} height={q.BOT-q.MID}
        fill={C.KARPET_A} stroke={C.WALL} strokeWidth={SW} />
      {/* KT3 */}
      <rect x={p.AJR} y={q.MID} width={p.KM2R-p.AJR} height={q.BOT-q.MID}
        fill={C.KARPET_B} stroke={C.WALL} strokeWidth={SW} />
      {/* Taman right (trapezoid) */}
      <polygon
        points={`${p.KM2R},${q.MID} ${p.RY_MID},${q.MID} ${p.RY_BOT},${q.BOT} ${p.KM2R},${q.BOT}`}
        fill={C.RUMPUT} stroke={C.WALL} strokeWidth={SW} />

      {/* ── BOTTOM SECTION ──────────────────────────── */}
      {/* Dapur */}
      <rect x={p.L} y={q.BOT} width={p.DR-p.L} height={q.DB-q.BOT}
        fill={C.NEUTRAL} stroke={C.WALL} strokeWidth={SW} />
      {/* Teras */}
      <rect x={p.DR} y={q.BOT} width={p.TR-p.DR} height={q.DB-q.BOT}
        fill={C.NEUTRAL} stroke={C.WALL} strokeWidth={SW} />
      {/* right strip of sub-strip */}
      <polygon
        points={`${p.TR},${q.BOT} ${p.RY_BOT},${q.BOT} ${p.RY_DB},${q.DB} ${p.TR},${q.DB}`}
        fill={C.NEUTRAL} stroke={C.WALL} strokeWidth={SW} />
      {/* Taman bottom-left */}
      <rect x={p.L} y={q.DB} width={p.TamanR-p.L} height={q.TOTAL-q.DB}
        fill={C.RUMPUT} stroke={C.WALL} strokeWidth={SW} />
      {/* Carport (trapezoid) */}
      <polygon
        points={`${p.TamanR},${q.DB} ${p.RY_DB},${q.DB} ${p.RY_TOT},${q.TOTAL} ${p.TamanR},${q.TOTAL}`}
        fill={C.NEUTRAL} stroke={C.WALL} strokeWidth={SW} />

      {/* ── Room labels ─────────────────────────────── */}
      <RL x={(p.L+p.KT1R)/2}   y={(q.T+q.MID)/2}   t="Kamar Tidur" />
      <RL x={(p.KT1R+p.AJR)/2} y={(q.T+q.MID)/2}   t="Area Jemur" />
      <RL x={(p.AJR+p.KM2R)/2} y={(q.T+q.KMB)/2}   t="(koridor)" sm />
      <RL x={(p.AJR+p.KM1R)/2} y={(q.KMB+q.MID)/2} t="K. Mandi" sm />
      <RL x={(p.KM1R+p.KM2R)/2} y={(q.KMB+q.MID)/2} t="K. Mandi" sm />
      <RL
        x={(p.KM2R+p.RY0+p.KM2R+p.RY_MID)/4}
        y={(q.T+q.MID)/2}
        t="Kamar Tidur" />
      <RL x={(p.L+p.AJR)/2}    y={(q.MID+q.BOT)/2} t="Ruang Utama" />
      <RL x={(p.AJR+p.KM2R)/2} y={(q.MID+q.BOT)/2} t="Kamar Tidur" />
      <RL
        x={(p.KM2R+p.RY_MID+p.KM2R+p.RY_BOT)/4}
        y={(q.MID+q.BOT)/2}
        t="Taman" />
      <RL x={(p.L+p.DR)/2}  y={(q.BOT+q.DB)/2} t="Dapur" sub="2,01 m" sm />
      <RL x={(p.DR+p.TR)/2} y={(q.BOT+q.DB)/2} t="Teras" sub="2,65 m" sm />
      <RL x={(p.L+p.TamanR)/2} y={(q.DB+q.TOTAL)/2} t="Taman" />
      <RL
        x={(p.TamanR+p.RY_DB+p.TamanR+p.RY_TOT)/4}
        y={(q.DB+q.TOTAL)/2}
        t="Carport" />

      {/* ── Top edge dimension ticks ─────────────────── */}
      {([
        [p.L, p.KT1R, '3,01'],
        [p.KT1R, p.AJR, '1,61'],
        [p.AJR, p.KM1R, '1,35'],
        [p.KM1R, p.KM2R, '1,40'],
        [p.KM2R, p.RY0, '2,52'],
      ] as [number, number, string][]).map(([xa, xb, lbl], i) => {
        const cx = (xa+xb)/2; const dy = q.T - 10
        return (
          <g key={i}>
            <line x1={xa} y1={dy} x2={xb} y2={dy} stroke={C.DIM} strokeWidth={0.8}/>
            <line x1={xa} y1={dy-4} x2={xa} y2={dy+4} stroke={C.DIM} strokeWidth={0.8}/>
            <line x1={xb} y1={dy-4} x2={xb} y2={dy+4} stroke={C.DIM} strokeWidth={0.8}/>
            <DL x={cx} y={dy-7} t={lbl} />
          </g>
        )
      })}

      {/* ── Left edge dimension ticks ─────────────────── */}
      {([
        [q.T, q.MID, '2,94'],
        [q.MID, q.BOT, '2,97'],
        [q.BOT, q.DB, '0,98'],
        [q.DB, q.TOTAL, '4,01'],
      ] as [number, number, string][]).map(([ya, yb, lbl], i) => {
        const cy = (ya+yb)/2; const dx = p.L - 10
        return (
          <g key={i}>
            <line x1={dx} y1={ya} x2={dx} y2={yb} stroke={C.DIM} strokeWidth={0.8}/>
            <line x1={dx-4} y1={ya} x2={dx+4} y2={ya} stroke={C.DIM} strokeWidth={0.8}/>
            <line x1={dx-4} y1={yb} x2={dx+4} y2={yb} stroke={C.DIM} strokeWidth={0.8}/>
            <DL x={dx-16} y={cy} t={lbl} />
          </g>
        )
      })}

      {/* ── Bottom edge ticks ─────────────────────────── */}
      {([
        [p.L, p.TamanR, '4,01'],
        [p.TamanR, p.RY_TOT, '2,97'],
      ] as [number, number, string][]).map(([xa, xb, lbl], i) => {
        const cx = (xa+xb)/2; const dy = q.TOTAL + 10
        return (
          <g key={i}>
            <line x1={xa} y1={dy} x2={xb} y2={dy} stroke={C.DIM} strokeWidth={0.8}/>
            <line x1={xa} y1={dy-4} x2={xa} y2={dy+4} stroke={C.DIM} strokeWidth={0.8}/>
            <line x1={xb} y1={dy-4} x2={xb} y2={dy+4} stroke={C.DIM} strokeWidth={0.8}/>
            <DL x={cx} y={dy+7} t={lbl} />
          </g>
        )
      })}

      {/* misc inner dimension labels */}
      <DL x={p.AJR-18} y={(q.KMB+q.MID)/2} t="1,50 m" />
      <DL x={(p.DR+p.TR)/2} y={q.BOT+(q.DB-q.BOT)*0.75} t="1,01 m" />
      <DL x={p.RY_MID+20} y={(q.MID+q.BOT)/2} t="1,72 m" />

      {/* North arrow */}
      <g transform={`translate(${p.L-36},${q.T+22})`}>
        <circle r={12} fill="white" stroke={C.WALL} strokeWidth={1}/>
        <polygon points="0,-9 3,1 0,-2 -3,1" fill={C.WALL}/>
        <text x={0} y={-11} textAnchor="middle" fontSize={7} fontWeight="700" fill={C.WALL}>N</text>
      </g>
    </g>
  )
}

// ── Default export: full standalone illustration with legend ──────────────────
export default function FloorPlanOSN24NT2Q7Illustration() {
  const legendItems = [
    { fill: C.KARPET_A, label: 'Karpet A — Rp250.000/m²' },
    { fill: C.KARPET_B, label: 'Karpet B — Rp150.000/m²' },
    { fill: C.RUMPUT,   label: 'Rumput sintetis — Rp95.000/m²' },
    { fill: C.NEUTRAL,  label: 'Tidak dilapisi' },
  ]
  const lx = PX.RY_TOT + 10
  const ly = PY.MID

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      height="100%"
      aria-label="Denah rumah — OSN 2024 SD Nasional Teori2 soal 7"
    >
      <FloorPlanBase />

      {/* Legend */}
      {legendItems.map((item, i) => (
        <g key={i} transform={`translate(${lx},${ly + i * 14})`}>
          <rect x={0} y={-6} width={10} height={10}
            fill={item.fill} stroke={C.WALL} strokeWidth={0.8}/>
          <text x={14} y={1} fontSize={7} fill={C.LABEL}>{item.label}</text>
        </g>
      ))}
    </svg>
  )
}
