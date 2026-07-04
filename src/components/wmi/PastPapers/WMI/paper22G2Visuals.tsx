import type { WmiChoice } from '../../../../types/wmi'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={aria}
    >
      {children}
    </div>
  )
}

// ── Q1 · Shark (eat any fish numbered below 374) ───────────────────────────
// Recovered from 2022-final-g2-a-q1.jpg: shark = 374; eight fish numbered
// 514, 400, 321, 286, 803, 395, 357, 441. Below 374 → 321, 286, 357 (three) → B.
export const SHARK_THRESHOLD = 374
export const SHARK_FISH = [
  { value: 514, x: 80, y: 84, tone: 'blue', faceLeft: false },
  { value: 400, x: 250, y: 56, tone: 'blue', faceLeft: true },
  { value: 321, x: 152, y: 196, tone: 'red', faceLeft: false },
  { value: 286, x: 300, y: 250, tone: 'red', faceLeft: true },
  { value: 803, x: 528, y: 250, tone: 'red', faceLeft: true },
  { value: 395, x: 96, y: 322, tone: 'blue', faceLeft: false },
  { value: 357, x: 372, y: 332, tone: 'blue', faceLeft: false },
  { value: 441, x: 548, y: 338, tone: 'red', faceLeft: true },
] as const

function Fish({
  x, y, value, tone, faceLeft = false, mark,
}: {
  x: number; y: number; value: number; tone: 'blue' | 'red'; faceLeft?: boolean; mark?: 'ok' | 'no'
}) {
  const fill = tone === 'blue' ? '#7DBBD6' : '#E78A9B'
  const dark = tone === 'blue' ? '#3F8FB5' : '#C75C72'
  const s = faceLeft ? -1 : 1
  const tailX = x - s * 34
  const eyeX = x + s * 18
  return (
    <g>
      <path d={`M ${tailX} ${y} l ${-s * 24} ${-15} l 0 30 Z`} fill={fill} stroke={dark} strokeWidth={2} strokeLinejoin="round" />
      <ellipse cx={x} cy={y} rx={34} ry={21} fill={fill} stroke={dark} strokeWidth={2} />
      <path d={`M ${x - 4} ${y - 20} q ${s * 8} -12 ${s * 18} -3 Z`} fill={dark} opacity={0.8} />
      <circle cx={eyeX} cy={y - 5} r={4.5} fill="#fff" stroke={dark} strokeWidth={1} />
      <circle cx={eyeX} cy={y - 5} r={2} fill="#1f2937" />
      <text x={x - s * 5} y={y} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill="#1f2937">{value}</text>
      {mark && (
        <>
          <circle cx={x} cy={y} r={30} fill="none" stroke={mark === 'ok' ? '#10B981' : '#EF4444'} strokeWidth={3.5} />
          <text x={x + 28} y={y - 24} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={mark === 'ok' ? '#10B981' : '#EF4444'}>
            {mark === 'ok' ? '✓' : '✗'}
          </text>
        </>
      )}
    </g>
  )
}

function SharkBody() {
  return (
    <g>
      <path d="M 470 120 l 16 -36 l 16 40 Z" fill="#8693A0" stroke="#6B7681" strokeWidth={2} strokeLinejoin="round" />
      <path d="M 548 152 l 42 -30 l -12 30 l 12 30 Z" fill="#9AA6AF" stroke="#6B7681" strokeWidth={2} strokeLinejoin="round" />
      <path d="M 548 152 C 548 100 472 92 432 124 C 408 142 392 152 362 160 C 392 176 414 190 446 192 C 506 195 548 182 548 152 Z" fill="#9AA6AF" stroke="#6B7681" strokeWidth={2} strokeLinejoin="round" />
      <path d="M 362 160 L 408 150 L 404 172 Z" fill="#54606B" />
      <path d="M 372 158 l 6 8 l 6 -6 l 5 7 l 6 -5" fill="none" stroke="#fff" strokeWidth={2} />
      <circle cx={432} cy={138} r={6} fill="#1f2937" />
      <text x={478} y={158} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={900} fill="#1f2937">{SHARK_THRESHOLD}</text>
    </g>
  )
}

/** Shark board. `marks[i]` tags fish i with ✓ (eaten) or ✗ once examined. */
export function SharkBoard({ marks = [] }: { marks?: Array<'ok' | 'no' | undefined> }) {
  return (
    <svg viewBox="0 0 620 380" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 560 }} aria-hidden="true">
      <SharkBody />
      {SHARK_FISH.map((f, i) => (
        <Fish key={f.value} x={f.x} y={f.y} value={f.value} tone={f.tone} faceLeft={f.faceLeft} mark={marks[i]} />
      ))}
    </svg>
  )
}

export function Shark22G2Illustration() {
  return (
    <Frame aria={`A shark numbered ${SHARK_THRESHOLD} among eight fish numbered 514, 400, 321, 286, 803, 395, 357 and 441.`}>
      <SharkBoard />
    </Frame>
  )
}

// ── Q3 · Paper stack (which number is 3rd sheet from the bottom?) ───────────
// Recovered from 2022-final-g2-a-q3.jpg: seven overlapping sheets 1–7.
// Scan overlaps: 2 covers 3/7/1, 3 covers 4 and 1, 7 covers 5/6/1/4, 1 covers 6,
// and 6 covers 5. Bottom → top: 4, 5, 6, 1, 3, 7, 2; the third from the bottom
// is sheet 6 → answer D.
type StackSheet = { cx: number; cy: number; w: number; h: number; rot: number; label: string; lx: number; ly: number }
export const STACK_SHEETS: Record<number, StackSheet> = {
  4: { cx: 76, cy: 98, w: 104, h: 122, rot: -8, label: '4', lx: -32, ly: -40 },
  3: { cx: 142, cy: 252, w: 124, h: 122, rot: 0, label: '3', lx: -46, ly: 46 },
  6: { cx: 288, cy: 152, w: 70, h: 86, rot: -12, label: '6', lx: 14, ly: 4 },
  1: { cx: 292, cy: 230, w: 80, h: 114, rot: 16, label: '1', lx: 18, ly: -10 },
  7: { cx: 238, cy: 128, w: 96, h: 98, rot: 12, label: '7', lx: -2, ly: -24 },
  5: { cx: 216, cy: 72, w: 120, h: 112, rot: 28, label: '5', lx: 10, ly: -22 },
  2: { cx: 152, cy: 164, w: 120, h: 120, rot: 42, label: '2', lx: -2, ly: -30 },
}
export const STACK_ORDER = [4, 5, 6, 1, 3, 7, 2] // bottom → top

function StackSheetShape({ id }: { id: number }) {
  const s = STACK_SHEETS[id]
  return (
    <g transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}>
      <rect x={s.cx - s.w / 2} y={s.cy - s.h / 2} width={s.w} height={s.h} fill="#FCF6D8" stroke="#5B4A3A" strokeWidth={2} />
      <text x={s.cx + s.lx} y={s.cy + s.ly} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill="#5B4A3A">{s.label}</text>
    </g>
  )
}

/** Stack board. `fromBottom` badges the lowest N sheets with their rank; `focusId` rings one. */
export function PaperStackBoard({ fromBottom = 0, focusId }: { fromBottom?: number; focusId?: number }) {
  return (
    <svg viewBox="0 0 360 360" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 340 }} aria-hidden="true">
      {STACK_ORDER.map((id) => <StackSheetShape key={id} id={id} />)}
      {STACK_ORDER.slice(0, fromBottom).map((id, rank) => {
        const s = STACK_SHEETS[id]
        const lit = focusId === id
        return (
          <g key={`b${id}`}>
            <circle cx={s.cx} cy={s.cy} r={26} fill="none" stroke={lit ? '#10B981' : '#2563EB'} strokeWidth={lit ? 4 : 2.5} opacity={lit ? 1 : 0.55} />
            <g transform="translate(0 0)">
              <circle cx={s.cx + 24} cy={s.cy - 24} r={12} fill={lit ? '#10B981' : '#2563EB'} />
              <text x={s.cx + 24} y={s.cy - 24} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#fff">{rank + 1}</text>
            </g>
          </g>
        )
      })}
    </svg>
  )
}

export function PaperStack22G2Illustration() {
  return (
    <Frame aria="Seven overlapping sheets of paper numbered 1 to 7, viewed from the top.">
      <PaperStackBoard />
    </Frame>
  )
}

// ── Q5 · Six balls (equal black & white, more large than small) ────────────
// Recovered from 2022-final-g2-q5-[a-d].jpg. Only B has 3 white + 3 black AND
// 4 large > 2 small → answer B.
export type Q5Ball = { s: 'L' | 'S'; c: 'W' | 'B' }
export const Q5_BALLS: Record<string, Q5Ball[]> = {
  A: [{ s: 'L', c: 'W' }, { s: 'L', c: 'W' }, { s: 'L', c: 'B' }, { s: 'S', c: 'W' }, { s: 'S', c: 'B' }, { s: 'S', c: 'B' }],
  B: [{ s: 'L', c: 'W' }, { s: 'L', c: 'W' }, { s: 'L', c: 'B' }, { s: 'L', c: 'W' }, { s: 'S', c: 'B' }, { s: 'S', c: 'B' }],
  C: [{ s: 'L', c: 'W' }, { s: 'L', c: 'B' }, { s: 'S', c: 'W' }, { s: 'S', c: 'B' }, { s: 'S', c: 'W' }, { s: 'S', c: 'B' }],
  D: [{ s: 'L', c: 'B' }, { s: 'L', c: 'B' }, { s: 'L', c: 'W' }, { s: 'L', c: 'W' }, { s: 'S', c: 'W' }, { s: 'S', c: 'W' }],
}

function Ball({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: 'W' | 'B' }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color === 'W' ? '#FFFFFF' : '#4B4B4B'} stroke="#3a3a3a" strokeWidth={1.5} />
      <ellipse cx={cx - r * 0.3} cy={cy + r * 0.34} rx={r * 0.42} ry={r * 0.26} fill="#fff" opacity={color === 'W' ? 0.85 : 0.28} />
    </g>
  )
}

/** A row of six balls (used by the choice renderer and the explainer). */
export function BallRow({ balls }: { balls: Q5Ball[] }) {
  const slot = 54
  return (
    <svg viewBox={`0 0 ${balls.length * slot} 60`} width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: balls.length * slot }} aria-hidden="true">
      {balls.map((b, i) => <Ball key={i} cx={i * slot + slot / 2} cy={32} r={b.s === 'L' ? 21 : 14} color={b.c} />)}
    </svg>
  )
}

export function Balls22G2Illustration() {
  return (
    <Frame aria="Each ball is white or black and large or small. Kiki needs equal black and white, and more large balls than small balls.">
      <svg viewBox="0 0 460 96" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 460 }} aria-hidden="true">
        <Ball cx={56} cy={48} r={22} color="W" />
        <text x={56} y={86} textAnchor="middle" fontSize={13} fontWeight={700} fill="#374151">large white</text>
        <Ball cx={168} cy={48} r={22} color="B" />
        <text x={168} y={86} textAnchor="middle" fontSize={13} fontWeight={700} fill="#374151">large black</text>
        <Ball cx={280} cy={52} r={14} color="W" />
        <text x={280} y={86} textAnchor="middle" fontSize={13} fontWeight={700} fill="#374151">small white</text>
        <Ball cx={392} cy={52} r={14} color="B" />
        <text x={392} y={86} textAnchor="middle" fontSize={13} fontWeight={700} fill="#374151">small black</text>
      </svg>
    </Frame>
  )
}

// ── Q8 · Thick orange line (longest total length) ──────────────────────────
// Grid cells are 3 cm wide × 2 cm tall, so each horizontal edge = 3 cm and each
// vertical edge = 2 cm. Edges traced pixel-by-pixel from 2022-final-g2-q8-[a-d].jpg.
// Measuring h×3 + v×2: A 36, B 34, C 37, D 36 — C is the longest even though D
// shows the most horizontal pieces (the trap) → answer C.
// edges: H = [rowLine(0..3), colCell(0..2)]; V = [colLine(0..3), rowCell(0..2)]
type LineOpt = { H: Array<[number, number]>; V: Array<[number, number]> }
export const LINE_OPTS: Record<string, LineOpt> = {
  // A — two S/5 shapes side by side (8 H + 6 V = 36 cm)
  A: { H: [[0, 0], [1, 0], [1, 2], [2, 0], [2, 2], [3, 0], [3, 1], [3, 2]], V: [[0, 0], [0, 2], [1, 1], [2, 1], [3, 0], [3, 2]] },
  // B — two open hooks (8 H + 5 V = 34 cm)
  B: { H: [[0, 0], [0, 1], [1, 0], [1, 2], [2, 0], [2, 2], [3, 0], [3, 1]], V: [[0, 0], [0, 2], [2, 0], [2, 2], [3, 1]] },
  // C — two top squares + bottom U (7 H + 8 V = 37 cm, the longest)
  C: { H: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 1], [3, 0], [3, 2]], V: [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2], [3, 1], [3, 2]] },
  // D — long stacked bars (most horizontals, looks longest: the trap; 10 H + 3 V = 36 cm)
  D: { H: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2]], V: [[0, 0], [0, 2], [2, 1]] },
}
export const lineLength = (o: LineOpt) => o.H.length * 3 + o.V.length * 2
const LG_X = 14
const LG_Y = 12
const LG_W = 56 // 3 cm
const LG_H = 40 // 2 cm

/** A 3×3 grid of 3×2 cm cells with an option's thick orange edges. */
export function LineGrid({ option }: { option: string }) {
  const o = LINE_OPTS[option] ?? LINE_OPTS.A
  const gx = (c: number) => LG_X + c * LG_W
  const gy = (r: number) => LG_Y + r * LG_H
  return (
    <svg viewBox="0 0 196 144" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 196 }} aria-hidden="true">
      {[0, 1, 2, 3].map((r) => <line key={`h${r}`} x1={gx(0)} y1={gy(r)} x2={gx(3)} y2={gy(r)} stroke="#B7B3D6" strokeWidth={1.5} />)}
      {[0, 1, 2, 3].map((c) => <line key={`v${c}`} x1={gx(c)} y1={gy(0)} x2={gx(c)} y2={gy(3)} stroke="#B7B3D6" strokeWidth={1.5} />)}
      <g stroke="#EE8A22" strokeWidth={9} strokeLinecap="round">
        {o.H.map(([r, c], i) => <line key={`oh${i}`} x1={gx(c)} y1={gy(r)} x2={gx(c + 1)} y2={gy(r)} />)}
        {o.V.map(([c, r], i) => <line key={`ov${i}`} x1={gx(c)} y1={gy(r)} x2={gx(c)} y2={gy(r + 1)} />)}
      </g>
    </svg>
  )
}

export function ThickLines22G2Illustration() {
  return (
    <Frame aria="Each small rectangle in the grids is 3 cm wide and 2 cm tall. Compare the four orange paths by total length.">
      <svg viewBox="0 0 240 120" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 240 }} aria-hidden="true">
        <rect x={60} y={30} width={120} height={60} fill="#FFF7ED" stroke="#EE8A22" strokeWidth={3} />
        <text x={120} y={20} textAnchor="middle" fontSize={15} fontWeight={800} fill="#9A3412">3 cm</text>
        <text x={120} y={108} textAnchor="middle" fontSize={13} fontWeight={600} fill="#6B7280">each cell: 3 cm × 2 cm</text>
        <text x={196} y={64} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill="#9A3412">2 cm</text>
      </svg>
    </Frame>
  )
}

// ── Q10 · Children order ───────────────────────────────────────────────────
// Recovered from 2022-final-g2-a-q10.jpg: four children, left→right heights
// tallest, shortest, then two middling. Dan is tallest (starred). Ann>Ken>Pan,
// and the 4th child is taller than the 3rd → Dan, Pan, Ken, Ann (answer C).
type KidSpec = { h: number; shirt: string; hair: string; kind: 'boy' | 'pig' | 'bob'; star?: boolean }
export const Q10_KIDS: KidSpec[] = [
  { h: 196, shirt: '#5BA8D4', hair: '#6B4A2B', kind: 'boy', star: true },
  { h: 118, shirt: '#E0556B', hair: '#1f2937', kind: 'pig' },
  { h: 150, shirt: '#5BA8D4', hair: '#1f2937', kind: 'boy' },
  { h: 170, shirt: '#E8943B', hair: '#1f2937', kind: 'bob' },
]

function Kid({ cx, baseY, spec, name, ring }: { cx: number; baseY: number; spec: KidSpec; name?: string; ring?: boolean }) {
  const { h, shirt, hair, kind, star } = spec
  const headR = 18
  const headCy = baseY - h + headR
  const bodyTop = headCy + headR + 1
  const bodyH = h - 64
  const legsTop = bodyTop + bodyH
  return (
    <g>
      {star && <text x={cx - 34} y={headCy - 16} fontSize={22} fill="#E23B3B">★</text>}
      {kind === 'bob' && <ellipse cx={cx} cy={headCy + 2} rx={headR + 6} ry={headR + 8} fill={hair} />}
      <circle cx={cx} cy={headCy} r={headR} fill="#FCD9B6" stroke="#E0A878" strokeWidth={1.5} />
      {kind === 'boy' && <path d={`M ${cx - headR} ${headCy - 3} A ${headR} ${headR} 0 0 1 ${cx + headR} ${headCy - 3} L ${cx + headR} ${headCy - 9} A ${headR} ${headR} 0 0 0 ${cx - headR} ${headCy - 9} Z`} fill={hair} />}
      {kind === 'pig' && <><circle cx={cx - headR - 2} cy={headCy} r={8} fill={hair} /><circle cx={cx + headR + 2} cy={headCy} r={8} fill={hair} /><path d={`M ${cx - headR} ${headCy - 4} A ${headR} ${headR} 0 0 1 ${cx + headR} ${headCy - 4} L ${cx + headR} ${headCy - 10} A ${headR} ${headR} 0 0 0 ${cx - headR} ${headCy - 10} Z`} fill={hair} /></>}
      {kind === 'bob' && <path d={`M ${cx - headR - 3} ${headCy - 6} A ${headR + 3} ${headR + 3} 0 0 1 ${cx + headR + 3} ${headCy - 6} L ${cx + headR + 3} ${headCy - 12} A ${headR} ${headR} 0 0 0 ${cx - headR - 3} ${headCy - 12} Z`} fill={hair} />}
      <rect x={cx - 19} y={bodyTop} width={38} height={bodyH} rx={13} fill={shirt} stroke="#0003" strokeWidth={1} />
      <rect x={cx - 13} y={legsTop} width={10} height={28} rx={4} fill="#3A4A5A" />
      <rect x={cx + 3} y={legsTop} width={10} height={28} rx={4} fill="#3A4A5A" />
      {ring && <rect x={cx - 30} y={headCy - headR - 8} width={60} height={h + 16} rx={10} fill="none" stroke="#10B981" strokeWidth={3} />}
      {name && (
        <g>
          <rect x={cx - 26} y={baseY + 8} width={52} height={22} rx={6} fill="#E1EFFB" stroke="#30598A" strokeWidth={1.5} />
          <text x={cx} y={baseY + 19} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={800} fill="#30598A">{name}</text>
        </g>
      )}
    </g>
  )
}

/** Four children; `names[i]` tags a position, `ring` highlights one. */
export function KidsBoard({ names = [], ring = -1 }: { names?: Array<string | undefined>; ring?: number }) {
  const xs = [80, 200, 320, 440]
  const baseY = 244
  return (
    <svg viewBox="0 0 520 290" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 520 }} aria-hidden="true">
      <line x1={20} y1={baseY} x2={500} y2={baseY} stroke="#C9B79B" strokeWidth={4} />
      {Q10_KIDS.map((spec, i) => <Kid key={i} cx={xs[i]} baseY={baseY} spec={spec} name={names[i]} ring={ring === i} />)}
    </svg>
  )
}

export function ChildrenOrder22G2Illustration() {
  return (
    <Frame aria="Four children stand left to right: a tall starred boy, a short girl, a medium boy, and a taller girl.">
      <KidsBoard />
    </Frame>
  )
}

// ── Q11 · Archery targets ──────────────────────────────────────────────────
// Recovered from 2022-final-g2-q11-*.jpg (arrow tips located ring-by-ring on the
// scans). Rings 10/6/4; a black arrow scores 3× its ring.
// Alex 10+10+6+4+4+4 = 38 · Bob 10+6+6+6+4 = 32 · Celine 30(black-10)+10+4 = 44 ·
// Dan 18(black-6)+6+6+4 = 34. Highest = Celine, lowest = Bob → answer D.
type Arrow = { ring: 4 | 6 | 10; a: number; black?: boolean }
export type TargetSpec = { name: string; total: number; arrows: Arrow[] }
export const Q11_TARGETS: TargetSpec[] = [
  { name: 'Alex', total: 38, arrows: [{ ring: 10, a: -168 }, { ring: 10, a: -62 }, { ring: 4, a: -25 }, { ring: 6, a: 23 }, { ring: 4, a: 172 }, { ring: 4, a: 137 }] },
  { name: 'Bob', total: 32, arrows: [{ ring: 10, a: -39 }, { ring: 6, a: -27 }, { ring: 4, a: -5 }, { ring: 6, a: 172 }, { ring: 6, a: 140 }] },
  { name: 'Celine', total: 44, arrows: [{ ring: 4, a: -124 }, { ring: 10, a: -47, black: true }, { ring: 10, a: 77 }] },
  { name: 'Dan', total: 34, arrows: [{ ring: 6, a: -175, black: true }, { ring: 6, a: -80 }, { ring: 4, a: 139 }, { ring: 6, a: 83 }] },
]

function TargetArrow({ cx, cy, arrow }: { cx: number; cy: number; arrow: Arrow }) {
  const tipR = arrow.ring === 10 ? 8 : arrow.ring === 6 ? 30 : 50
  const outR = 78
  const rad = (arrow.a * Math.PI) / 180
  const ux = Math.cos(rad)
  const uy = Math.sin(rad)
  const tx = cx + tipR * ux
  const ty = cy + tipR * uy
  const ox = cx + outR * ux
  const oy = cy + outR * uy
  const col = arrow.black ? '#1f2937' : '#fbfbfb'
  const edge = '#3a3a3a'
  // fletching: two short ticks near the outer end
  const px = -uy
  const py = ux
  return (
    <g>
      <line x1={tx} y1={ty} x2={ox} y2={oy} stroke={col} strokeWidth={4.5} strokeLinecap="round" />
      <line x1={tx} y1={ty} x2={ox} y2={oy} stroke={edge} strokeWidth={6} strokeLinecap="round" opacity={0.25} />
      <line x1={tx} y1={ty} x2={ox} y2={oy} stroke={col} strokeWidth={3.5} strokeLinecap="round" />
      <polygon points={`${tx},${ty} ${tx - 7 * ux - 4 * px},${ty - 7 * uy - 4 * py} ${tx - 7 * ux + 4 * px},${ty - 7 * uy + 4 * py}`} fill={arrow.black ? '#1f2937' : '#555'} />
      <line x1={ox - 8 * ux} y1={oy - 8 * uy} x2={ox - 8 * ux + 7 * px} y2={oy - 8 * uy + 7 * py} stroke={edge} strokeWidth={2.5} />
      <line x1={ox - 8 * ux} y1={oy - 8 * uy} x2={ox - 8 * ux - 7 * px} y2={oy - 8 * uy - 7 * py} stroke={edge} strokeWidth={2.5} />
    </g>
  )
}

function Target({ cx, cy, spec, total }: { cx: number; cy: number; spec: TargetSpec; total?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={62} fill="#FBEBA6" stroke="#5a4a2a" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={42} fill="#FFFFFF" stroke="#5a4a2a" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={22} fill="#F2A7AE" stroke="#5a4a2a" strokeWidth={2} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill="#5a3a3a">10</text>
      <text x={cx + 28} y={cy + 30} textAnchor="middle" fontSize={14} fontWeight={800} fill="#5a3a3a">6</text>
      <text x={cx + 46} y={cy + 46} textAnchor="middle" fontSize={14} fontWeight={800} fill="#5a3a3a">4</text>
      {spec.arrows.map((ar, i) => <TargetArrow key={i} cx={cx} cy={cy} arrow={ar} />)}
      <text x={cx} y={cy + 84} textAnchor="middle" fontSize={16} fontWeight={800} fill="#1f2937">{spec.name}</text>
      {total != null && (
        <g>
          <rect x={cx - 30} y={cy + 92} width={60} height={24} rx={6} fill="#E1EFFB" stroke="#30598A" strokeWidth={1.5} />
          <text x={cx} y={cy + 104} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#30598A">{total}</text>
        </g>
      )}
    </g>
  )
}

/** Four targets in a row; `totals[name]` reveals a player's score. */
export function TargetsBoard({ totals = {} }: { totals?: Record<string, number> }) {
  const cx0 = 95
  const cy = 88
  const gap = 188
  return (
    <svg viewBox="0 0 760 230" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 760 }} aria-hidden="true">
      {Q11_TARGETS.map((spec, i) => <Target key={spec.name} cx={cx0 + i * gap} cy={cy} spec={spec} total={totals[spec.name]} />)}
    </svg>
  )
}

export function Targets22G2Illustration() {
  return (
    <Frame aria="Four archery targets for Alex, Bob, Celine and Dan with arrows in the 10, 6 and 4 rings; some arrows are black.">
      <TargetsBoard />
    </Frame>
  )
}

// ── Q12 · Egg path (running sums +1, +2, +3, … along a snake) ───────────────
// Recovered from 2022-final-g2-a-q12.jpg: 3×4 egg grid, snake path
// 1,2,(4),7 → 11 → 16,(22),29,37 → (46),(56),(?). Adds +1…+11, so ? = 67 → C.
const EGG_OX = 22
const EGG_OY = 18
const EGG_CW = 116
const EGG_CH = 120
const eggCx = (c: number) => EGG_OX + c * EGG_CW + EGG_CW / 2
const eggCy = (r: number) => EGG_OY + r * EGG_CH + EGG_CH / 2

type EggNode = { r: number; c: number; v: number; add?: number; given?: boolean; answer?: boolean }
export const EGG_PATH: EggNode[] = [
  { r: 0, c: 0, v: 1, given: true },
  { r: 0, c: 1, v: 2, add: 1, given: true },
  { r: 0, c: 2, v: 4, add: 2 },
  { r: 0, c: 3, v: 7, add: 3, given: true },
  { r: 1, c: 3, v: 11, add: 4, given: true },
  { r: 2, c: 3, v: 16, add: 5, given: true },
  { r: 2, c: 2, v: 22, add: 6 },
  { r: 2, c: 1, v: 29, add: 7, given: true },
  { r: 2, c: 0, v: 37, add: 8, given: true },
  { r: 1, c: 0, v: 46, add: 9 },
  { r: 1, c: 1, v: 56, add: 10 },
  { r: 1, c: 2, v: 67, add: 11, answer: true },
]

function EggConnectors() {
  return (
    <g stroke="#F39A2B" strokeWidth={15} strokeLinecap="round">
      {EGG_PATH.slice(1).map((n, i) => {
        const p = EGG_PATH[i]
        return <line key={i} x1={eggCx(p.c)} y1={eggCy(p.r)} x2={eggCx(n.c)} y2={eggCy(n.r)} />
      })}
    </g>
  )
}

/** Egg grid. `revealed` is a set of path indices whose blank value is shown; `active` rings one egg. */
export function EggGrid({ revealed, active = -1 }: { revealed?: Set<number>; active?: number }) {
  return (
    <svg viewBox="0 0 510 396" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 500 }} aria-hidden="true">
      {/* grid cells */}
      {Array.from({ length: 3 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <rect key={`g${r}${c}`} x={EGG_OX + c * EGG_CW} y={EGG_OY + r * EGG_CH} width={EGG_CW} height={EGG_CH} fill="#fff" stroke="#9CA3AF" strokeWidth={1.5} />
        )),
      )}
      <EggConnectors />
      {/* arrow into the ? egg (from its left neighbour) */}
      <path d={`M ${eggCx(2) - 30} ${eggCy(1)} l -16 -11 l 0 22 Z`} fill="#F39A2B" transform={`translate(0 0)`} />
      {EGG_PATH.map((n, i) => {
        const show = n.given || revealed?.has(i)
        const isActive = active === i
        const cx = eggCx(n.c)
        const cy = eggCy(n.r)
        const label = show ? String(n.v) : n.answer ? '?' : ''
        const color = n.answer && show ? '#047857' : '#1f2937'
        return (
          <g key={`e${i}`}>
            <ellipse cx={cx} cy={cy} rx={46} ry={54} fill="#FFFDF5" stroke={isActive ? '#10B981' : '#6B7280'} strokeWidth={isActive ? 4 : 2} />
            <ellipse cx={cx - 14} cy={cy - 20} rx={12} ry={18} fill="#fff" opacity={0.7} />
            {label && <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill={color}>{label}</text>}
            {isActive && n.add != null && (
              <g>
                <rect x={cx - 26} y={cy + 40} width={52} height={24} rx={6} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={1.5} />
                <text x={cx} y={cy + 52} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill="#92400E">{`+${n.add}`}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function EggPath22G2Illustration() {
  return (
    <Frame aria="A 3 by 4 grid of eggs joined by an orange path. Some eggs show 1, 2, 7, 11, 16, 29, 37 and others are blank, ending at a question mark.">
      <EggGrid />
    </Frame>
  )
}

export function Cups22G2Illustration() {
  return (
    <Frame aria="Four mugs total thirty-six, two cups multiply to forty-nine, and one mug plus one cup is asked.">
      <svg viewBox="0 0 520 210" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 560 }} aria-hidden="true">
        <text x={260} y={54} textAnchor="middle" fontSize={34} fontWeight={800} fill="#312E81" className="font-display">
          4 × mug = 36
        </text>
        <text x={260} y={112} textAnchor="middle" fontSize={34} fontWeight={800} fill="#BE185D" className="font-display">
          cup × cup = 49
        </text>
        <rect x={116} y={142} width={288} height={52} rx={12} fill="#ECFDF5" stroke="#10B981" strokeWidth={3} />
        <text x={260} y={169} textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={900} fill="#065F46" className="font-display">
          mug + cup = ?
        </text>
      </svg>
    </Frame>
  )
}

// ── Q16 · Flowchart (A=65, B=80; output A+B if >150 else B−A) ───────────────
// Recovered from 2022-final-g2-a-q16.jpg. A+B = 145, not > 150 → FALSE branch
// C = B − A = 80 − 65 = 15.
function FlowEdge({ d, lit }: { d: string; lit?: boolean }) {
  return <path d={d} fill="none" stroke={lit ? '#10B981' : '#374151'} strokeWidth={lit ? 4 : 2.5} markerEnd={lit ? 'url(#flowArrowLit)' : 'url(#flowArrow)'} />
}

/** Flowchart board. `stage`: 0 input · 1 test · 2 false-branch · 3 compute · 4 output. */
export function FlowchartBoard({ stage = -1 }: { stage?: number }) {
  const lit = (s: number) => stage === s
  const box = (on: boolean) => ({ fill: on ? '#EEF2FF' : '#D6D4EE', stroke: on ? '#10B981' : '#8B89C0', strokeWidth: on ? 4 : 2 })
  return (
    <svg viewBox="0 0 900 340" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 760 }} aria-hidden="true">
      <defs>
        <marker id="flowArrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#374151" /></marker>
        <marker id="flowArrowLit" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#10B981" /></marker>
      </defs>
      {/* edges */}
      <FlowEdge d="M 128 170 L 168 170" />
      <FlowEdge d="M 292 170 L 318 170" />
      <FlowEdge d="M 412 118 L 412 64 L 556 64" lit={lit(1) || lit(0)} />
      <FlowEdge d="M 412 222 L 412 276 L 556 276" lit={lit(2) || lit(3)} />
      <FlowEdge d="M 700 64 L 760 64 L 760 138" lit={false} />
      <FlowEdge d="M 700 276 L 760 276 L 760 204" lit={lit(3) || lit(4)} />
      <FlowEdge d="M 818 170 L 856 170" lit={lit(4)} />
      <text x={388} y={48} textAnchor="end" fontSize={17} fontWeight={700} fill="#6B7280">TRUE</text>
      <text x={388} y={296} textAnchor="end" fontSize={17} fontWeight={700} fill={lit(2) ? '#047857' : '#6B7280'}>FALSE</text>
      {/* start */}
      <ellipse cx={70} cy={170} rx={56} ry={32} fill="#A7D44C" stroke="#6B8E23" strokeWidth={2} />
      <text x={70} y={170} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill="#33471a">Start</text>
      {/* input */}
      <rect x={172} y={130} width={120} height={80} rx={4} {...box(lit(0))} />
      <text x={232} y={150} textAnchor="middle" fontSize={15} fontWeight={700} fill="#312E81">Input A,B</text>
      <text x={232} y={172} textAnchor="middle" fontSize={15} fontWeight={800} fill="#312E81">A = 65</text>
      <text x={232} y={192} textAnchor="middle" fontSize={15} fontWeight={800} fill="#312E81">B = 80</text>
      {/* decision */}
      <polygon points="370,115 462,170 370,225 278,170" fill={lit(1) ? '#EEF2FF' : '#D6D4EE'} stroke={lit(1) ? '#10B981' : '#8B89C0'} strokeWidth={lit(1) ? 4 : 2} />
      <text x={370} y={164} textAnchor="middle" fontSize={15} fontWeight={800} fill="#312E81">A+B {'>'} 150</text>
      <text x={370} y={186} textAnchor="middle" fontSize={14} fontWeight={800} fill={lit(1) ? '#B91C1C' : 'transparent'}>145 ✗</text>
      {/* true box */}
      <rect x={556} y={40} width={144} height={48} rx={4} {...box(false)} />
      <text x={628} y={64} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill="#312E81">C = A + B</text>
      {/* false box */}
      <rect x={556} y={252} width={144} height={48} rx={4} {...box(lit(3))} />
      <text x={628} y={276} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} fill="#312E81">C = B − A</text>
      {/* output */}
      <ellipse cx={760} cy={170} rx={58} ry={36} fill={lit(4) ? '#D1FAE5' : '#88CFEF'} stroke={lit(4) ? '#10B981' : '#2B7FA8'} strokeWidth={lit(4) ? 4 : 2} />
      <text x={760} y={170} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill="#0c4a6e">{stage >= 4 ? 'C = 15' : 'Output C'}</text>
      {/* stop */}
      <ellipse cx={858} cy={170} rx={40} ry={30} fill="#EFA8A8" stroke="#B45454" strokeWidth={2} />
      <text x={858} y={170} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill="#7f1d1d">Stop</text>
    </svg>
  )
}

export function Flowchart22G2Illustration() {
  return (
    <Frame aria="A flowchart: input A = 65 and B = 80; if A + B > 150 output A + B, otherwise output B − A.">
      <FlowchartBoard />
    </Frame>
  )
}

// ── Q17 · Balances ─────────────────────────────────────────────────────────
// Recovered from 2022-final-g2-a-q17.jpg: A = B+C+D, C = B+D, A = 3D.
// Substituting: A = B+(B+D)+D = 2B+2D = 3D ⇒ D = 2B, so 2 B balls = 1 D.
const BALL_COLOR: Record<string, string> = { A: '#E0556B', B: '#5BA8D4', C: '#9CCC65', D: '#F2B84B' }

function ScaleBall({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={13} fill={BALL_COLOR[label]} stroke="#0004" strokeWidth={1.5} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#fff">{label}</text>
    </g>
  )
}

function pan(cx: number, panY: number, items: string[]) {
  const start = cx - (items.length - 1) * 14
  return (
    <g>
      <path d={`M ${cx - 28} ${panY} Q ${cx} ${panY + 16} ${cx + 28} ${panY}`} fill="none" stroke="#7a6a4a" strokeWidth={3} />
      {items.map((it, i) => <ScaleBall key={i} cx={start + i * 28} cy={panY - 12} label={it} />)}
    </g>
  )
}

/** One level balance: `left` items balance `right` items. */
export function Scale({ cx, left, right }: { cx: number; left: string[]; right: string[] }) {
  const beamY = 40
  const lX = cx - 52
  const rX = cx + 52
  const panY = 86
  return (
    <g>
      <line x1={lX} y1={beamY} x2={rX} y2={beamY} stroke="#5a4a2a" strokeWidth={4} strokeLinecap="round" />
      <line x1={cx} y1={beamY} x2={cx} y2={132} stroke="#8a7a5a" strokeWidth={4} />
      <polygon points={`${cx - 16},150 ${cx + 16},150 ${cx},132`} fill="#8a7a5a" />
      <line x1={cx - 22} y1={150} x2={cx + 22} y2={150} stroke="#5a4a2a" strokeWidth={3} />
      <line x1={lX} y1={beamY} x2={lX} y2={panY - 12} stroke="#7a6a4a" strokeWidth={1.5} />
      <line x1={rX} y1={beamY} x2={rX} y2={panY - 12} stroke="#7a6a4a" strokeWidth={1.5} />
      {pan(lX, panY, left)}
      {pan(rX, panY, right)}
    </g>
  )
}

export function BalanceBoard() {
  return (
    <svg viewBox="0 0 560 180" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 560 }} aria-hidden="true">
      <Scale cx={94} left={['A']} right={['B', 'C', 'D']} />
      <Scale cx={280} left={['C']} right={['B', 'D']} />
      <Scale cx={466} left={['A']} right={['D', 'D', 'D']} />
    </svg>
  )
}

export function Balance22G2Illustration() {
  return (
    <Frame aria="Three level balances: A balances B, C and D; C balances B and D; A balances three D balls.">
      <BalanceBoard />
    </Frame>
  )
}

// ── Q18 · Seat grid ────────────────────────────────────────────────────────
// Recovered from 2022-final-g2 Paper B Q3 grid (E=(5,4) confirms (x,y)).
// The only seat with A directly above and D directly right is (3,2):
// a×2 + b = 3×2 + 2 = 8.
export const SEAT_GRID = [
  ['C', 'C', 'A', 'C', 'D'], // y = 1 (bottom)
  ['A', 'A', 'D', 'D', 'A'], // y = 2
  ['D', 'B', 'A', 'A', 'B'], // y = 3
  ['B', 'A', 'D', 'C', 'E'], // y = 4
  ['D', 'D', 'C', 'D', 'A'], // y = 5 (top)
]
const SG_OX = 44
const SG_OY = 16
const SG = 54
const sgX = (x: number) => SG_OX + (x - 1) * SG
const sgY = (y: number) => SG_OY + (5 - y) * SG

/** Seat grid. `seat` greens a cell; `above`/`right` ring its neighbours. */
export function SeatGridBoard({ seat, above = false, right = false }: { seat?: [number, number]; above?: boolean; right?: boolean }) {
  return (
    <svg viewBox="0 0 340 326" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 340 }} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((y) =>
        [1, 2, 3, 4, 5].map((x) => {
          const isSeat = seat && seat[0] === x && seat[1] === y
          const isAbove = above && seat && x === seat[0] && y === seat[1] + 1
          const isRight = right && seat && y === seat[1] && x === seat[0] + 1
          return (
            <g key={`${x}${y}`}>
              <rect x={sgX(x)} y={sgY(y)} width={SG} height={SG} fill={isSeat ? '#D1FAE5' : '#fff'} stroke={isAbove ? '#2563EB' : isRight ? '#F59E0B' : '#9CA3AF'} strokeWidth={isAbove || isRight ? 3.5 : 1.5} />
              <text x={sgX(x) + SG / 2} y={sgY(y) + SG / 2} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={isSeat ? '#047857' : '#1f2937'}>{SEAT_GRID[y - 1][x - 1]}</text>
            </g>
          )
        }),
      )}
      {[1, 2, 3, 4, 5].map((x) => <text key={`cx${x}`} x={sgX(x) + SG / 2} y={SG_OY + 5 * SG + 16} textAnchor="middle" fontSize={14} fontWeight={700} fill="#6B7280">{x}</text>)}
      {[1, 2, 3, 4, 5].map((y) => <text key={`cy${y}`} x={SG_OX - 16} y={sgY(y) + SG / 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} fill="#6B7280">{y}</text>)}
    </svg>
  )
}

export function SeatGrid22G2Illustration() {
  return (
    <Frame aria="A 5 by 5 grid of letters with column numbers 1 to 5 and row numbers 1 to 5.">
      <SeatGridBoard />
    </Frame>
  )
}

// ── Q19 · Shape addition (same shape = same digit) ─────────────────────────
// Recovered from 2022-final-g2-a-q19.jpg:
//   ■■■ + ■■▲ + ■▲● = 2022.  Solving: 666 + 668 + 688 = 2022, so
//   square = 6, triangle = 8, circle = 8 → square+triangle+circle = 22.
const SHAPE_COLS = { h: 232, t: 312, u: 392 } as const
const SHAPE_ROWS = [56, 124, 192]

function ShapeCell({ kind, cx, cy, val }: { kind: 'sq' | 'tri' | 'cir'; cx: number; cy: number; val?: number }) {
  const txt = val != null && (
    <text x={cx} y={cy + (kind === 'tri' ? 8 : 0)} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill="#1f2937">{val}</text>
  )
  if (kind === 'sq') return <g><rect x={cx - 27} y={cy - 27} width={54} height={54} rx={4} fill="#9CCC65" stroke="#5a8a1e" strokeWidth={2} />{txt}</g>
  if (kind === 'tri') return <g><polygon points={`${cx},${cy - 30} ${cx - 31},${cy + 26} ${cx + 31},${cy + 26}`} fill="#5BC0EB" stroke="#2b8fbf" strokeWidth={2} />{txt}</g>
  return <g><circle cx={cx} cy={cy} r={28} fill="#F4A6B0" stroke="#d06b7a" strokeWidth={2} />{txt}</g>
}

/** Shape-sum board. `s`/`t`/`c` fill known digits; `col` highlights a column. */
export function ShapeSumBoard({ s, t, c, col }: { s?: number; t?: number; c?: number; col?: 'h' | 't' | 'u' }) {
  const rows: Array<Array<'sq' | 'tri' | 'cir'>> = [
    ['sq', 'sq', 'sq'],
    ['sq', 'sq', 'tri'],
    ['sq', 'tri', 'cir'],
  ]
  const cols: Array<keyof typeof SHAPE_COLS> = ['h', 't', 'u']
  const valOf = (k: 'sq' | 'tri' | 'cir') => (k === 'sq' ? s : k === 'tri' ? t : c)
  return (
    <svg viewBox="0 0 480 300" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 440 }} aria-hidden="true">
      {col && <rect x={SHAPE_COLS[col] - 34} y={22} width={68} height={186} rx={8} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />}
      {rows.map((row, r) =>
        row.map((kind, ci) => (
          <ShapeCell key={`${r}${ci}`} kind={kind} cx={SHAPE_COLS[cols[ci]]} cy={SHAPE_ROWS[r]} val={valOf(kind)} />
        )),
      )}
      <text x={110} y={124} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill="#1f2937">+</text>
      <text x={110} y={192} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={800} fill="#1f2937">+</text>
      <line x1={118} y1={226} x2={428} y2={226} stroke="#1f2937" strokeWidth={2.5} />
      {[['2', 150], ['0', 232], ['2', 312], ['2', 392]].map(([d, x]) => (
        <text key={x} x={x as number} y={264} textAnchor="middle" dominantBaseline="central" fontSize={34} fontWeight={900} fill="#1f2937">{d}</text>
      ))}
    </svg>
  )
}

export function ShapeAddition22G2Illustration() {
  return (
    <Frame aria="A vertical addition where equal shapes stand for equal digits: square-square-square plus square-square-triangle plus square-triangle-circle equals 2022.">
      <ShapeSumBoard />
    </Frame>
  )
}

// ── Q20 · Password dial ────────────────────────────────────────────────────
// Recovered from 2022-final-g2-a-q20.jpg: 10 positions clockwise from the top
// are 0,3,1,9,2,7,6,4,8,5. Turns (blue=cw, green=ccw): 3,4,2,3,6.
// 0 →cw3→ 9 →ccw4→ 5 →cw2→ 3 →cw3→ 2 →ccw6→ 8  ⇒ 95328.
export const DIAL_VALUES = [0, 3, 1, 9, 2, 7, 6, 4, 8, 5]
export const DIAL_TURNS = [
  { dir: 'cw', n: 3, digit: 9 },
  { dir: 'ccw', n: 4, digit: 5 },
  { dir: 'cw', n: 2, digit: 3 },
  { dir: 'cw', n: 3, digit: 2 },
  { dir: 'ccw', n: 6, digit: 8 },
] as const
const DCX = 180
const DCY = 138
const DR = 88
const dAng = (i: number) => ((-90 + 36 * i) * Math.PI) / 180
const dx = (i: number, r: number) => DCX + r * Math.cos(dAng(i))
const dy = (i: number, r: number) => DCY + r * Math.sin(dAng(i))

function TurnIcon({ x, y, dir, n, active }: { x: number; y: number; dir: 'cw' | 'ccw'; n: number; active?: boolean }) {
  const col = dir === 'cw' ? '#2E9BD6' : '#5BB85B'
  const r = 15
  const T = `${x},${y - r}`
  const arc = dir === 'cw'
    ? `M ${T} A ${r} ${r} 0 1 1 ${x - 0.87 * r} ${y + 0.5 * r}`
    : `M ${T} A ${r} ${r} 0 1 0 ${x + 0.87 * r} ${y - 0.5 * r}`
  const head = dir === 'cw'
    ? `${x},${y - r - 6} ${x},${y - r + 6} ${x + 9},${y - r}`
    : `${x},${y - r - 6} ${x},${y - r + 6} ${x - 9},${y - r}`
  return (
    <g>
      {active && <circle cx={x} cy={y} r={24} fill="#FEF3C7" stroke="#F59E0B" strokeWidth={2} />}
      <path d={arc} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" />
      <polygon points={head} fill={col} />
      <text x={x} y={y + r + 16} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={col}>{n}</text>
    </g>
  )
}

/** Dial board. `pointerIndex` aims the needle; `recorded` (if given) shows the password slots. */
export function DialBoard({ pointerIndex = 0, recorded = null, activeTurn = -1 }: { pointerIndex?: number; recorded?: number[] | null; activeTurn?: number }) {
  const px = dx(pointerIndex, DR - 22)
  const py = dy(pointerIndex, DR - 22)
  const perp = dAng(pointerIndex) + Math.PI / 2
  const showPwd = recorded != null
  return (
    <svg viewBox={`0 0 360 ${showPwd ? 400 : 348}`} width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 360 }} aria-hidden="true">
      {/* sectors */}
      {DIAL_VALUES.map((_, i) => (
        <polygon key={`s${i}`} points={`${DCX},${DCY} ${dx(i, DR)},${dy(i, DR)} ${dx(i + 1, DR)},${dy(i + 1, DR)}`} fill={i % 2 === 0 ? '#FCEBD0' : '#FFFFFF'} stroke="#3a3a3a" strokeWidth={1.2} />
      ))}
      <circle cx={DCX} cy={DCY} r={DR} fill="none" stroke="#3a3a3a" strokeWidth={2} />
      {/* numbers */}
      {DIAL_VALUES.map((v, i) => (
        <text key={`n${i}`} x={dx(i, DR + 22)} y={dy(i, DR + 22)} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill="#1f2937">{v}</text>
      ))}
      {/* pointer */}
      <polygon
        points={`${px},${py} ${DCX + 7 * Math.cos(perp)},${DCY + 7 * Math.sin(perp)} ${DCX - 7 * Math.cos(perp)},${DCY - 7 * Math.sin(perp)}`}
        fill="#E23B3B"
      />
      <circle cx={DCX} cy={DCY} r={12} fill="#fff" stroke="#E23B3B" strokeWidth={5} />
      {/* turn icons */}
      {DIAL_TURNS.map((t, i) => (
        <TurnIcon key={i} x={48 + i * 66} y={showPwd ? 332 : 300} dir={t.dir} n={t.n} active={activeTurn === i} />
      ))}
      {/* password slots (explainer only) */}
      {showPwd && DIAL_TURNS.map((t, i) => (
        <g key={`p${i}`}>
          <rect x={56 + i * 50} y={258} width={40} height={40} rx={6} fill={recorded[i] != null ? '#D1FAE5' : '#F3F4F6'} stroke={recorded[i] != null ? '#10B981' : '#9CA3AF'} strokeWidth={2} />
          <text x={76 + i * 50} y={278} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill="#065F46">{recorded[i] != null ? recorded[i] : ''}</text>
        </g>
      ))}
    </svg>
  )
}

export function PasswordDial22G2Illustration() {
  return (
    <Frame aria="A 10-position password dial reading 0,3,1,9,2,7,6,4,8,5 clockwise, with five turns below: clockwise 3, counter-clockwise 4, clockwise 2, clockwise 3, counter-clockwise 6.">
      <DialBoard />
    </Frame>
  )
}

// ── Q21 · Matching-pairs card game ─────────────────────────────────────────
// Recovered from 2022-final-g2 Paper B Q6: Angie 2 9 J, Bob 5 8 9, Cox K J 3 5,
// Danny ?. Pairs 9-9, 5-5, J-J discard; singles 2, 8, K, 3 need partners in
// Danny, plus the one extra Jack with no partner → Danny holds 4 + 1 = 5 cards.
type Hand = { name: string; cards: Array<{ r: string; pair?: string }> }
export const Q21_HANDS: Hand[] = [
  { name: 'Angie', cards: [{ r: '2' }, { r: '9', pair: '9' }, { r: 'J', pair: 'J' }] },
  { name: 'Bob', cards: [{ r: '5', pair: '5' }, { r: '8' }, { r: '9', pair: '9' }] },
  { name: 'Cox', cards: [{ r: 'K' }, { r: 'J', pair: 'J' }, { r: '3' }, { r: '5', pair: '5' }] },
]
export const Q21_SINGLES = ['2', '8', 'K', '3']
export const Q21_DANNY = ['2', '8', 'K', '3', 'J']

function Card({ x, y, rank, faceDown, ring }: { x: number; y: number; rank?: string; faceDown?: boolean; ring?: string }) {
  const red = rank === 'J' || rank === 'K' ? '#B91C1C' : '#1f2937'
  return (
    <g>
      <rect x={x} y={y} width={40} height={56} rx={5} fill={faceDown ? '#3D5A9A' : '#fff'} stroke={ring ?? '#9CA3AF'} strokeWidth={ring ? 3.5 : 1.5} />
      {faceDown ? (
        <text x={x + 20} y={y + 30} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill="#fff">?</text>
      ) : (
        <>
          <text x={x + 7} y={y + 13} textAnchor="middle" fontSize={14} fontWeight={800} fill={red}>{rank}</text>
          <text x={x + 33} y={y + 47} textAnchor="middle" fontSize={14} fontWeight={800} fill={red} transform={`rotate(180 ${x + 33} ${y + 43})`}>{rank}</text>
          <text x={x + 20} y={y + 30} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={red}>{rank === 'J' ? '♥' : rank === 'K' ? '♦' : '♣'}</text>
        </>
      )}
    </g>
  )
}

/** Card hands. `pairs`/`singles` ring matching cards; `danny` reveals Danny's hand. */
export function CardHandsBoard({ pairs = false, singles = false, danny = null }: { pairs?: boolean; singles?: boolean; danny?: string[] | null }) {
  const rowY = (i: number) => 16 + i * 66
  const cardX = (i: number) => 92 + i * 48
  return (
    <svg viewBox="0 0 360 290" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 360 }} aria-hidden="true">
      {Q21_HANDS.map((hand, hi) => (
        <g key={hand.name}>
          <text x={16} y={rowY(hi) + 28} fontSize={15} fontWeight={800} fill="#1f2937">{hand.name}</text>
          {hand.cards.map((c, ci) => {
            const ring = pairs && c.pair ? '#10B981' : singles && Q21_SINGLES.includes(c.r) && !c.pair ? '#F59E0B' : undefined
            return <Card key={ci} x={cardX(ci)} y={rowY(hi)} rank={c.r} ring={ring} />
          })}
        </g>
      ))}
      <text x={16} y={rowY(3) + 28} fontSize={15} fontWeight={800} fill="#1f2937">Danny</text>
      {danny
        ? danny.map((r, i) => <Card key={i} x={cardX(i)} y={rowY(3)} rank={r} ring={i === 4 ? '#10B981' : '#F59E0B'} />)
        : <Card x={cardX(0)} y={rowY(3)} faceDown />}
    </svg>
  )
}

export function CardHands22G2Illustration() {
  return (
    <Frame aria="Card hands: Angie holds 2, 9, J; Bob holds 5, 8, 9; Cox holds K, J, 3, 5; Danny's hand is hidden.">
      <CardHandsBoard />
    </Frame>
  )
}

// ── Q23 · Soldiers crossing two holes ──────────────────────────────────────
// Recovered from 2022-final-g2-a-q23.jpg. The right hole is deep (holds 2), the
// left hole is shallow (holds 1). Front soldiers fill a hole, the rest cross,
// then fillers climb out to the back: 1234 → (deep)3,4,2,1 → (shallow)4,2,1,3.
function SoldierToken({ cx, cy, n }: { cx: number; cy: number; n: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy - 14} r={9} fill="#1F8A4C" />
      <path d={`M ${cx - 12} ${cy + 18} Q ${cx} ${cy - 6} ${cx + 12} ${cy + 18} Z`} fill="#1F8A4C" />
      <text x={cx} y={cy + 6} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#fff">{n}</text>
    </g>
  )
}

function Hole({ x, label, depth, soldiers }: { x: number; label: string; depth: number; soldiers: number[] }) {
  const w = 52
  const cellH = 30
  const top = 150
  return (
    <g>
      <rect x={x} y={top} width={w} height={depth * cellH} fill="#fff" stroke="#9b7b4a" strokeWidth={2} strokeDasharray="5 4" />
      {soldiers.map((n, i) => <SoldierToken key={n} cx={x + w / 2} cy={top + (depth - 1 - i) * cellH + cellH / 2 + 2} n={n} />)}
      <text x={x + w / 2} y={top + depth * cellH + 16} textAnchor="middle" fontSize={12} fontWeight={700} fill="#6B7280">{label}</text>
    </g>
  )
}

/** Soldier board: `order` is the surface queue (front on the left); holes hold fillers. */
export function SoldiersBoard({ order, leftHole = [], rightHole = [] }: { order: number[]; leftHole?: number[]; rightHole?: number[] }) {
  return (
    <svg viewBox="0 0 520 240" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 520 }} aria-hidden="true">
      {/* road surface */}
      <rect x={20} y={92} width={480} height={26} fill="#C9A876" stroke="#9b7b4a" strokeWidth={1.5} />
      <text x={40} y={40} fontSize={13} fontWeight={700} fill="#6B7280">← marching</text>
      {/* surface queue */}
      {order.map((n, i) => <SoldierToken key={n} cx={70 + i * 64} cy={70} n={n} />)}
      {/* holes */}
      <Hole x={150} label="shallow (1)" depth={1} soldiers={leftHole} />
      <Hole x={330} label="deep (2)" depth={2} soldiers={rightHole} />
    </svg>
  )
}

export function Soldiers22G2Illustration() {
  return (
    <Frame aria="Four numbered soldiers march left along a road with a shallow hole and a deep hole.">
      <SoldiersBoard order={[1, 2, 3, 4]} />
    </Frame>
  )
}

// ── Q24 · Mirror-view block solid ──────────────────────────────────────────
// Recovered from 2022-final-g2-a-q24.jpg. The 3-D solid is drawn as plain
// OUTLINE cubes (shape only) — the colours are read from the two mirrors:
//   front view  . G . / W G G / B B B      side view  G G / G W / W B
// (side-view columns: left = back row y=1, right = front row y=0 — the mirror
// flips left/right; its top-back cell IS gray on the scan, so the centre tower
// is TWO cubes deep). Blocks: white 1×1×1, gray 1×1×2, black 1×1×3.
// One black 1×1×3 (front base) + three gray 1×1×2 (deep top pair, deep middle
// pair, upright back-right pair) + 3 white singles → answer 3.
const ICW = 46
const ICH = 23
const IFH = 40
const FACE_SHAPE: [string, string, string] = ['#FCFCFC', '#ECECEC', '#DADADA']
const FACE_GRAY: [string, string, string] = ['#B8BEC3', '#9AA0A6', '#828890']
const FACE_BLACK: [string, string, string] = ['#4A4A4A', '#363636', '#262626']
const FACE_WHITE: [string, string, string] = ['#FFFFFF', '#EFEFEF', '#DCDCDC']

function IsoCube({ ox, oy, x, y, z, faces, cw = ICW, ch = ICH, fh = IFH }: {
  ox: number; oy: number; x: number; y: number; z: number; faces: [string, string, string]; cw?: number; ch?: number; fh?: number
}) {
  const sx = ox + (x - y) * (cw / 2)
  const sy = oy + (x + y) * (ch / 2) - z * fh
  const [t, l, r] = faces
  return (
    <g stroke="#2b2b2b" strokeWidth={1.3} strokeLinejoin="round">
      <polygon points={`${sx},${sy} ${sx + cw / 2},${sy + ch / 2} ${sx},${sy + ch} ${sx - cw / 2},${sy + ch / 2}`} fill={t} />
      <polygon points={`${sx - cw / 2},${sy + ch / 2} ${sx},${sy + ch} ${sx},${sy + ch + fh} ${sx - cw / 2},${sy + ch / 2 + fh}`} fill={l} />
      <polygon points={`${sx},${sy + ch} ${sx + cw / 2},${sy + ch / 2} ${sx + cw / 2},${sy + ch / 2 + fh} ${sx},${sy + ch + fh}`} fill={r} />
    </g>
  )
}

// Shape of the solid (12 unit cubes) — drawn uncoloured, shape only.
const MB_SHAPE = [
  { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }, // front base row
  { x: 0, y: 1, z: 0 }, { x: 1, y: 1, z: 0 }, { x: 2, y: 1, z: 0 }, // back base row
  { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 1, z: 1 }, // second level
  { x: 1, y: 0, z: 2 }, { x: 1, y: 1, z: 2 }, // deep peak pair
]

const MB_COLOR: Record<string, string> = { W: '#FFFFFF', G: '#9AA0A6', B: '#2B2B2B' }
const MB_FRONT = [[null, 'G', null], ['W', 'G', 'G'], ['B', 'B', 'B']]
const MB_SIDE = [['G', 'G'], ['G', 'W'], ['W', 'B']]

function MirrorPanel({ ox, oy, grid, cell = 26 }: { ox: number; oy: number; grid: Array<Array<string | null>>; cell?: number }) {
  const w = grid[0].length * cell
  const h = grid.length * cell
  return (
    <g>
      <rect x={ox - 8} y={oy - 8} width={w + 16} height={h + 16} fill="#fff" stroke="#9CA3AF" strokeWidth={1.5} />
      {grid.map((row, r) =>
        row.map((c, ci) => c && (
          <rect key={`${r}${ci}`} x={ox + ci * cell} y={oy + r * cell} width={cell} height={cell} fill={MB_COLOR[c]} stroke="#1f2937" strokeWidth={1} />
        )),
      )}
      <text x={ox + w / 2} y={oy + h + 24} textAnchor="middle" fontSize={13} fontWeight={700} fill="#6B7280">Mirror</text>
    </g>
  )
}

function LegendBox({ ox, oy, len, faces, label }: { ox: number; oy: number; len: number; faces: [string, string, string]; label: string }) {
  const cubes = []
  for (let i = 0; i < len; i++) cubes.push(<IsoCube key={i} ox={ox} oy={oy} x={i} y={0} z={0} faces={faces} cw={26} ch={13} fh={22} />)
  return (
    <g>
      {cubes}
      <text x={ox + 116} y={oy + 8} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1f2937">{label}</text>
    </g>
  )
}

export function MirrorBlocksBoard() {
  const order = [...MB_SHAPE].sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z)
  return (
    <svg viewBox="0 0 680 336" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 680 }} aria-hidden="true">
      {/* side-view mirror (left) */}
      <MirrorPanel ox={36} oy={150} grid={MB_SIDE} />
      {/* isometric solid — uncoloured outline cubes (shape only) */}
      <g>{order.map((c, i) => <IsoCube key={i} ox={236} oy={206} x={c.x} y={c.y} z={c.z} faces={FACE_SHAPE} />)}</g>
      {/* front-view mirror (upper, framed) */}
      <MirrorPanel ox={362} oy={36} grid={MB_FRONT} />
      {/* legend */}
      <g>
        <LegendBox ox={512} oy={148} len={1} faces={FACE_WHITE} label="1×1×1" />
        <LegendBox ox={512} oy={206} len={2} faces={FACE_GRAY} label="1×1×2" />
        <LegendBox ox={512} oy={264} len={3} faces={FACE_BLACK} label="1×1×3" />
      </g>
    </svg>
  )
}

export function MirrorBlocks22G2Illustration() {
  return (
    <Frame aria="A 3-D solid of unit cubes drawn as an outline, with its front-view and side-view colour mirrors and a legend: white 1×1×1, gray 1×1×2, black 1×1×3.">
      <MirrorBlocksBoard />
    </Frame>
  )
}

// ── Q25 · T-cover on a 4×4 value grid ──────────────────────────────────────
// Recovered from 2022-final-g2 Paper B Q10 table. Each cell is an expression;
// the evaluated grid is below. The T (3-in-a-row + 1 stem) covers at most
// 43+28+20+57 = 148 (column-3 rows 2–4 plus the right stem 57) → max 148.
export const TCOVER_EXPR = [
  ['8×8', '85−44', '72÷9', '35'],
  ['7×3', '12÷3', '68−25', '9×1'],
  ['56÷7', '58×0', '28', '21+36'],
  ['33+19', '70', '4×5', '36÷6'],
]
export const TCOVER_VALS = [
  [64, 41, 8, 35],
  [21, 4, 43, 9],
  [8, 0, 28, 57],
  [52, 70, 20, 6],
]
const TC_OX = 96
const TC_OY = 84
const TC_CELL = 90
const tcKey = (r: number, c: number) => r * 4 + c

/** T-cover board. `mode` expr|val; `cover` lists [r,c] cells under the T; `best` greens them. */
export function TCoverBoard({ mode = 'expr', cover = [], sum, best = false }: { mode?: 'expr' | 'val'; cover?: Array<[number, number]>; sum?: number; best?: boolean }) {
  const covered = new Set(cover.map(([r, c]) => tcKey(r, c)))
  const hl = best ? { fill: '#A7F3D0', stroke: '#059669' } : { fill: '#FED7AA', stroke: '#EA580C' }
  return (
    <svg viewBox="0 0 480 470" width="100%" style={{ display: 'block', margin: '0 auto', maxWidth: 440 }} aria-hidden="true">
      {/* T-cover tool, top-left */}
      <g fill="#F59E0B" stroke="#92400E" strokeWidth={2}>
        <rect x={20} y={36} width={22} height={22} />
        <rect x={42} y={36} width={22} height={22} />
        <rect x={64} y={36} width={22} height={22} />
        <rect x={42} y={14} width={22} height={22} />
      </g>
      <text x={104} y={34} fontSize={14} fontWeight={700} fill="#92400E">T-cover</text>
      {sum != null && (
        <text x={364} y={34} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={best ? '#047857' : '#9A3412'}>{`Sum = ${sum}`}</text>
      )}
      {/* grid */}
      {TCOVER_VALS.map((row, r) =>
        row.map((_, c) => {
          const on = covered.has(tcKey(r, c))
          const x = TC_OX + c * TC_CELL
          const y = TC_OY + r * TC_CELL
          return (
            <g key={`${r}${c}`}>
              <rect x={x} y={y} width={TC_CELL} height={TC_CELL} fill={on ? hl.fill : '#fff'} stroke={on ? hl.stroke : '#9CA3AF'} strokeWidth={on ? 3 : 1.5} />
              <text x={x + TC_CELL / 2} y={y + TC_CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={mode === 'expr' ? 19 : 24} fontWeight={mode === 'expr' ? 700 : 900} fill="#1f2937">
                {mode === 'expr' ? TCOVER_EXPR[r][c] : TCOVER_VALS[r][c]}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}

export function TCover22G2Illustration() {
  return (
    <Frame aria="A T-shaped cover of four squares and a 4 by 4 grid whose cells are arithmetic expressions such as 8×8, 85−44, 72÷9 and 35.">
      <TCoverBoard />
    </Frame>
  )
}

export function BallOption22G2({ choice }: { choice: WmiChoice }) {
  const balls = Q5_BALLS[choice.label] ?? Q5_BALLS.A
  return (
    <span role="img" aria-label={choice.text} className="inline-flex min-h-16 w-full items-center justify-center p-1">
      <BallRow balls={balls} />
    </span>
  )
}

export function ThickLineOption22G2({ choice }: { choice: WmiChoice }) {
  return (
    <span role="img" aria-label={choice.text} className="inline-flex min-h-16 w-full items-center justify-center p-1">
      <LineGrid option={choice.label} />
    </span>
  )
}
