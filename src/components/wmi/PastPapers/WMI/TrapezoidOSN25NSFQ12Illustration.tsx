// TrapezoidOSN25NSFQ12Illustration — OSN-25-SD-NAS-SEMIFINAL-Q12
//
// Trapesium ABCD dengan AD ∥ BC.
//   AD = 21 cm (sisi kiri vertikal), BC = 7 cm (sisi kanan vertikal),
//   AB = 13 cm (kaki bawah miring), DC = 15 cm (kaki atas miring).
//
// Koordinat (12 px = 1 cm, SVG y ke bawah):
//   A = (50, 302), D = (50, 50), B = (194, 242), C = (194, 158)
//
// Verifikasi: DA = 252 px = 21 cm ✓, BC = 84 px = 7 cm ✓,
//   AB = √(144²+60²) = √24336 = 156 px = 13 cm ✓,
//   DC = √(144²+108²) = √32400 = 180 px = 15 cm ✓
//
// Co-exports TrapezoidFigure untuk explainer (dengan prop highlight).
// SSR-safe: tidak ada hooks, tidak ada framer-motion.

// ── Koordinat ──────────────────────────────────────────────────────────────────
export const PA = [50,  302] as const   // A bottom-left
export const PD = [50,  50]  as const   // D top-left
export const PB = [194, 242] as const   // B bottom-right
export const PC = [194, 158] as const   // C top-right
// Kaki tegak lurus dari B dan C ke garis DA (sumbu x = 50)
export const PM = [50,  242] as const   // M: kaki dari B ke DA
export const PN = [50,  158] as const   // N: kaki dari C ke DA

// ── Props untuk figure bersama ─────────────────────────────────────────────────
export interface TrapezoidFigureProps {
  /** Tampilkan garis tegak lurus BM dan CN ke DA */
  showPerp?: boolean
  /** Sorot AB (amber) */
  highlightAB?: boolean
  /** Sorot DC (hijau) */
  highlightDC?: boolean
  /** Sorot tinggi h = BM dalam biru */
  highlightH?: boolean
  /** Isi area trapesium dengan warna terang */
  fillArea?: boolean
  /** Label tinggi h di dekat garis BM */
  heightLabel?: string
}

// ── Komponen figure bersama ───────────────────────────────────────────────────
export function TrapezoidFigure({
  showPerp    = false,
  highlightAB = false,
  highlightDC = false,
  highlightH  = false,
  fillArea    = false,
  heightLabel,
}: TrapezoidFigureProps = {}) {
  const neutral = '#374151'
  const abColor = highlightAB ? '#D97706' : neutral
  const dcColor = highlightDC ? '#16A34A' : neutral
  const hColor  = highlightH  ? '#2563EB' : '#9CA3AF'
  const abW     = highlightAB ? 3 : 1.8
  const dcW     = highlightDC ? 3 : 1.8
  const dot     = '#111827'

  const trapPath =
    `M ${PA[0]} ${PA[1]} L ${PB[0]} ${PB[1]} L ${PC[0]} ${PC[1]} L ${PD[0]} ${PD[1]} Z`

  // Midpoints for side labels
  const midDA = [(PA[0] + PD[0]) / 2, (PA[1] + PD[1]) / 2]
  const midAB = [(PA[0] + PB[0]) / 2, (PA[1] + PB[1]) / 2]
  const midBC = [(PB[0] + PC[0]) / 2, (PB[1] + PC[1]) / 2]
  const midDC = [(PD[0] + PC[0]) / 2, (PD[1] + PC[1]) / 2]

  return (
    <svg
      viewBox="0 0 280 360"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: 280, height: 'auto', display: 'block' }}
    >
      {/* Area fill */}
      {fillArea && (
        <path d={trapPath} fill="#DBEAFE" stroke="none" />
      )}

      {/* Perpendicular helpers */}
      {showPerp && (
        <>
          {/* Garis BM (tegak lurus dari B ke DA) */}
          <line
            x1={PB[0]} y1={PB[1]} x2={PM[0]} y2={PM[1]}
            stroke={hColor} strokeWidth={1.5} strokeDasharray="5 3"
          />
          {/* Tanda siku di M */}
          <path
            d={`M ${PM[0]} ${PM[1] - 9} L ${PM[0] + 9} ${PM[1] - 9} L ${PM[0] + 9} ${PM[1]}`}
            fill="none" stroke={hColor} strokeWidth={1.2}
          />
          {/* Garis CN (tegak lurus dari C ke DA) */}
          <line
            x1={PC[0]} y1={PC[1]} x2={PN[0]} y2={PN[1]}
            stroke={hColor} strokeWidth={1.5} strokeDasharray="5 3"
          />
          {/* Tanda siku di N */}
          <path
            d={`M ${PN[0]} ${PN[1] - 9} L ${PN[0] + 9} ${PN[1] - 9} L ${PN[0] + 9} ${PN[1]}`}
            fill="none" stroke={hColor} strokeWidth={1.2}
          />
          {/* Label AM = 5 */}
          <text x={PM[0] - 16} y={(PA[1] + PM[1]) / 2}
            fontSize={11} fill="#6B7280" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central"
          >5</text>
          {/* Label MN = 7 */}
          <text x={PM[0] - 16} y={(PM[1] + PN[1]) / 2}
            fontSize={11} fill="#6B7280" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central"
          >7</text>
          {/* Label ND = 9 */}
          <text x={PN[0] - 16} y={(PN[1] + PD[1]) / 2}
            fontSize={11} fill="#6B7280" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central"
          >9</text>
        </>
      )}

      {/* ── Trapesium ABCD ─────────────────────────────────────────────────── */}
      {/* Sisi DA (kiri vertikal) */}
      <line x1={PD[0]} y1={PD[1]} x2={PA[0]} y2={PA[1]} stroke={neutral} strokeWidth={1.8} />
      {/* Sisi AB (kaki bawah miring) */}
      <line x1={PA[0]} y1={PA[1]} x2={PB[0]} y2={PB[1]} stroke={abColor} strokeWidth={abW} />
      {/* Sisi BC (kanan vertikal) */}
      <line x1={PB[0]} y1={PB[1]} x2={PC[0]} y2={PC[1]} stroke={neutral} strokeWidth={1.8} />
      {/* Sisi DC (kaki atas miring) */}
      <line x1={PD[0]} y1={PD[1]} x2={PC[0]} y2={PC[1]} stroke={dcColor} strokeWidth={dcW} />

      {/* Garis tinggi h (BM sorot) */}
      {highlightH && (
        <line
          x1={PB[0]} y1={PB[1]} x2={PM[0]} y2={PM[1]}
          stroke={hColor} strokeWidth={2.5}
        />
      )}

      {/* Label h */}
      {heightLabel && highlightH && (
        <text
          x={(PB[0] + PM[0]) / 2} y={PB[1] + 18}
          fontSize={13} fontWeight="700" fill={hColor} fontFamily="sans-serif" textAnchor="middle"
        >{heightLabel}</text>
      )}

      {/* ── Titik sudut ────────────────────────────────────────────────────── */}
      {([PA, PD, PB, PC] as readonly (readonly [number, number])[]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={dot} />
      ))}

      {/* ── Label sudut ────────────────────────────────────────────────────── */}
      <text x={PA[0] - 16} y={PA[1] + 6}  fontSize={14} fontWeight="700" fill={dot} fontFamily="sans-serif" textAnchor="middle">A</text>
      <text x={PD[0] - 16} y={PD[1] + 6}  fontSize={14} fontWeight="700" fill={dot} fontFamily="sans-serif" textAnchor="middle">D</text>
      <text x={PB[0] + 16} y={PB[1] + 6}  fontSize={14} fontWeight="700" fill={dot} fontFamily="sans-serif" textAnchor="middle">B</text>
      <text x={PC[0] + 16} y={PC[1] + 6}  fontSize={14} fontWeight="700" fill={dot} fontFamily="sans-serif" textAnchor="middle">C</text>

      {/* ── Label sisi ─────────────────────────────────────────────────────── */}
      {/* DA = 21 cm (kiri) */}
      <text
        x={midDA[0] - 26} y={midDA[1]}
        fontSize={13} fontWeight="600" fill={neutral} fontFamily="sans-serif"
        textAnchor="middle" dominantBaseline="central"
      >21 cm</text>
      {/* AB = 13 cm (bawah-miring) */}
      <text
        x={midAB[0] + 10} y={midAB[1] + 22}
        fontSize={13} fontWeight="600" fill={abColor} fontFamily="sans-serif" textAnchor="middle"
      >13 cm</text>
      {/* BC = 7 cm (kanan) */}
      <text
        x={midBC[0] + 28} y={midBC[1]}
        fontSize={13} fontWeight="600" fill={neutral} fontFamily="sans-serif"
        textAnchor="middle" dominantBaseline="central"
      >7 cm</text>
      {/* DC = 15 cm (atas-miring) */}
      <text
        x={midDC[0] + 10} y={midDC[1] - 16}
        fontSize={13} fontWeight="600" fill={dcColor} fontFamily="sans-serif" textAnchor="middle"
      >15 cm</text>

      {/* Parallel markers pada DA dan BC */}
      <text x={midDA[0] + 8} y={midDA[1] - 2} fontSize={13} fill="#6B7280" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">›</text>
      <text x={midBC[0] - 8} y={midBC[1] - 2} fontSize={13} fill="#6B7280" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">›</text>
    </svg>
  )
}

// ── Default export: ilustrasi soal (tanpa jawaban) ────────────────────────────
export default function TrapezoidOSN25NSFQ12Illustration() {
  return (
    <div
      className="mx-auto w-full max-w-[280px]"
      role="img"
      aria-label={
        'Trapesium ABCD dengan AD sejajar BC. ' +
        'DA = 21 cm (kiri), BC = 7 cm (kanan), AB = 13 cm (bawah), DC = 15 cm (atas).'
      }
    >
      <TrapezoidFigure />
    </div>
  )
}
