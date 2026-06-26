// OSN-15-SD-NAS-Q13 — Sudut lancip jarum jam pukul 03:25
//
// Soal: "Pada pukul 03:25, besar sudut lancip yang dibentuk oleh kedua jarum adalah ..."
// Perhitungan:
//   Jarum menit  = 25 × 6°              = 150°  (menunjuk antara 4 dan 5)
//   Jarum jam    = 3×30° + 25×0,5°      = 102,5° (sedikit melewati angka 3)
//   Sudut lancip = 150° − 102,5°        = 47,5°
//
// Gambar batang: jam analog pukul 03:25 dengan busur oranye di antara kedua
// jarum dan label "?°" di dalamnya — TIDAK menampilkan jawaban.
//
// Diadaptasi dari ClockAngle16B23Illustration (geometri muka jam identik).
// Terikat ke breakdown.quantities:
//   minuteAngle  = 150°
//   hourAngle    = 102,5°
//   angleBetween = 47,5°

/** Sudut CW dari angka 12 + jari-jari → titik SVG tengah (75,75). */
function handPoint(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 75 + r * Math.sin(rad), y: 75 - r * Math.cos(rad) }
}

/** Path busur SVG antara dua sudut jarum (CW dari 12) pada jari-jari r. */
function arcPath(startDeg: number, endDeg: number, r: number): string {
  const s = handPoint(startDeg, r)
  const e = handPoint(endDeg, r)
  const span = ((endDeg - startDeg) + 360) % 360
  const largeArc = span > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

// ─── Konstanta sudut untuk pukul 03:25 ────────────────────────────────────────
export const MINUTE_ANGLE = 150    // 25 × 6°
export const HOUR_ANGLE   = 102.5  // 3×30° + 25×0,5°
const ARC_R = 26

const BLUE   = '#2f6df0'
const PURPLE = '#341857'
const ORANGE = '#F97316'

// ─── Muka jam yang dapat dipakai ulang oleh Explainer ─────────────────────────
export function ClockAngleOSN15NQ13Face({
  size = 160,
  showArc = true,
  minuteAngle = MINUTE_ANGLE,
  hourAngle   = HOUR_ANGLE,
  arcLabel    = '?°',
}: {
  size?: number
  showArc?: boolean
  minuteAngle?: number
  hourAngle?: number
  arcLabel?: string
}) {
  const minuteTip = handPoint(minuteAngle, 50)
  const hourTip   = handPoint(hourAngle,   34)

  const arcStart   = hourAngle
  const arcEnd     = minuteAngle
  const span       = ((arcEnd - arcStart) + 360) % 360
  const largeArc   = span > 180 ? 1 : 0
  const arcS       = handPoint(arcStart, ARC_R)
  const arcE       = handPoint(arcEnd,   ARC_R)
  const sectorPath = `M 75 75 L ${arcS.x} ${arcS.y} A ${ARC_R} ${ARC_R} 0 ${largeArc} 1 ${arcE.x} ${arcE.y} Z`
  const midAngle   = arcStart + span / 2
  const labelPt    = handPoint(midAngle, ARC_R * 0.55)

  return (
    <svg viewBox="0 0 150 150" width={size} height={size} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Muka jam */}
      <circle cx={75} cy={75} r={62} fill="white" stroke={BLUE} strokeWidth={3} />

      {/* 12 tanda jam */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * 30
        const inner = handPoint(angle, 54)
        const outer = handPoint(angle, 62)
        return (
          <line key={i}
            x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
            stroke={BLUE} strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
          />
        )
      })}

      {/* Angka 12 / 3 / 6 / 9 */}
      {([12, 3, 6, 9] as const).map((n) => {
        const pos = handPoint((n % 12) * 30, 46)
        return (
          <text key={n}
            x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={11} fontWeight="bold" fill={PURPLE}
          >{n}</text>
        )
      })}

      {/* Isian sektor & busur sudut */}
      {showArc && (
        <>
          <path d={sectorPath} fill="rgba(249,115,22,0.15)" />
          <path d={arcPath(arcStart, arcEnd, ARC_R)} fill="none" stroke={ORANGE} strokeWidth={2} />
          <text
            x={labelPt.x} y={labelPt.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight="bold" fill={ORANGE}
          >{arcLabel}</text>
        </>
      )}

      {/* Jarum menit (panjang) */}
      <line
        x1={75} y1={75} x2={minuteTip.x} y2={minuteTip.y}
        stroke="#475569" strokeWidth={2.5} strokeLinecap="round"
      />

      {/* Jarum jam (pendek) */}
      <line
        x1={75} y1={75} x2={hourTip.x} y2={hourTip.y}
        stroke="#475569" strokeWidth={3.5} strokeLinecap="round"
      />

      {/* Titik tengah */}
      <circle cx={75} cy={75} r={4} fill={PURPLE} />
    </svg>
  )
}

// ─── Default export: kartu ilustrasi batang ────────────────────────────────────
export default function ClockAngleOSN15NQ13Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-4"
      role="img"
      aria-label="Jam analog pukul 03:25. Jarum menit menunjuk antara angka 4 dan 5 (150°) dan jarum jam sedikit melewati angka 3 (102,5°). Busur oranye menandai sudut lancip yang ditanya."
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <ClockAngleOSN15NQ13Face />
      </div>
      <p style={{
        textAlign: 'center',
        marginTop: 8,
        fontSize: 13,
        color: PURPLE,
        fontWeight: 600,
      }}>
        Pukul 03:25 — berapa sudut lancip antar jarum?
      </p>
    </div>
  )
}
