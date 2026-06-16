// WMI-22F1A-Q1 (Grade 1) — "Count the money" (value tiles + unit coins).
//
// Recovered from db/seed/wmi/figures/2022-final-g1-a-q1.jpg. The figure shows a
// top row of six rectangular value tiles — one "50" (pale yellow), two "10"
// (pale blue), three "5" (pale pink), all with dark numbers — and below them a
// row of NINE small round coins each worth "1" (peach with a dark outline).
//
//   Total = 50 + 10 + 10 + 5 + 5 + 5 + 9 × 1 = 85 + 9 = 94   (answer A).
//
// This draws ONLY the problem (the tiles + coins). It never reveals the running
// total or the answer — that grouping/summing is the animator's job.
//
// Pure render, no params needed (a fixed paper figure), SSR-safe & deterministic
// (no Math.random / Date). The co-exported MoneyBoard primitive lets the
// animator optionally ring a group while reusing the identical glyphs.

// ---- Colours ----------------------------------------------------------------
// The qupu palette has no pale-blue / pale-pink tile token, so (like
// HexTree22G1Illustration / NestedTri22G3Explainer) we use raw hex constants
// that mirror the scan and echo the fill-qupu-* family. The dark numbers and
// outlines reuse the real qupu-ink token; the highlight ring reuses
// stroke-qupu-brand-orange. Both are applied via className below.
const TILE_FILLS: Record<number, string> = {
  50: '#FBF1A6', // pale yellow (matches scan)
  10: '#BFE0F2', // pale blue (matches scan)
  5: '#F8D4D4', // pale pink (matches scan)
}

// The six top-row tiles, left → right (value drives the fill colour).
const TILES: number[] = [50, 10, 10, 5, 5, 5]
const COIN_COUNT = 9

// Which tile indices belong to each highlight group.
const GROUPS: Record<'tens' | 'fives' | 'ones' | 'all', { tiles: number[]; coins: boolean }> = {
  tens: { tiles: [0, 1, 2], coins: false }, // 50 + 10 + 10
  fives: { tiles: [3, 4, 5], coins: false }, // 5 + 5 + 5
  ones: { tiles: [], coins: true }, // the nine coins
  all: { tiles: [0, 1, 2, 3, 4, 5], coins: true },
}

/**
 * MoneyBoard — the shared money figure (six value tiles + nine unit coins).
 *
 * `highlight` optionally rings a group with the brand-orange accent:
 *   'tens'  → the 50 + 10 + 10 tiles
 *   'fives' → the three 5 tiles
 *   'ones'  → the nine 1-coins
 *   'all'   → everything
 * The default export passes no highlight, so the static problem figure is plain.
 */
export function MoneyBoard({ highlight }: { highlight?: 'tens' | 'fives' | 'ones' | 'all' }) {
  // --- layout -------------------------------------------------------------
  const pad = 14
  const ringPad = 7 // headroom so the highlight ring never clips at edges

  // Top-row tiles.
  const tileW = 62
  const tileH = 52
  const tileGap = 14
  const rowW = TILES.length * tileW + (TILES.length - 1) * tileGap

  // Bottom-row coins, centred under the tile row.
  const coinR = 19
  const coinGap = 8
  const coinD = coinR * 2
  const coinsW = COIN_COUNT * coinD + (COIN_COUNT - 1) * coinGap
  const rowGap = 22

  const contentW = Math.max(rowW, coinsW)
  const width = pad * 2 + contentW
  const tileY = pad + ringPad
  const coinCY = tileY + tileH + rowGap + coinR
  const height = coinCY + coinR + ringPad + pad

  const tileX0 = pad + (contentW - rowW) / 2
  const coinX0 = pad + (contentW - coinsW) / 2

  const g = highlight ? GROUPS[highlight] : null
  const tileRinged = (i: number) => g?.tiles.includes(i) ?? false
  const coinsRinged = g?.coins ?? false

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(280, width)}>
      {/* top row: six rectangular value tiles */}
      {TILES.map((value, i) => {
        const x = tileX0 + i * (tileW + tileGap)
        return (
          <g key={`tile-${i}`}>
            <rect
              x={x}
              y={tileY}
              width={tileW}
              height={tileH}
              rx={4}
              fill={TILE_FILLS[value]}
              className="stroke-qupu-ink"
              strokeWidth={2.5}
            />
            <text
              x={x + tileW / 2}
              y={tileY + tileH / 2 + 9}
              textAnchor="middle"
              fontSize="26"
              fontWeight="bold"
              className="fill-qupu-ink"
            >
              {value}
            </text>
            {tileRinged(i) && (
              <rect
                x={x - ringPad}
                y={tileY - ringPad}
                width={tileW + ringPad * 2}
                height={tileH + ringPad * 2}
                rx={9}
                fill="none"
                className="stroke-qupu-brand-orange"
                strokeWidth={3}
              />
            )}
          </g>
        )
      })}

      {/* highlight ring around the whole coin row (drawn behind the coins) */}
      {coinsRinged && (
        <rect
          x={coinX0 - ringPad}
          y={coinCY - coinR - ringPad}
          width={coinsW + ringPad * 2}
          height={coinD + ringPad * 2}
          rx={coinR + ringPad}
          fill="none"
          className="stroke-qupu-brand-orange"
          strokeWidth={3}
        />
      )}

      {/* bottom row: nine round "1" coins */}
      {Array.from({ length: COIN_COUNT }, (_, i) => {
        const cx = coinX0 + coinR + i * (coinD + coinGap)
        return (
          <g key={`coin-${i}`}>
            <ellipse
              cx={cx}
              cy={coinCY}
              rx={coinR}
              ry={coinR - 1}
              className="fill-qupu-peach stroke-qupu-ink"
              strokeWidth={2.5}
            />
            <text
              x={cx}
              y={coinCY + 7}
              textAnchor="middle"
              fontSize="20"
              fontWeight="bold"
              className="fill-qupu-ink"
            >
              1
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/**
 * WMI-22F1A-Q1 question figure — six value tiles (50, 10, 10, 5, 5, 5) and nine
 * unit coins. Renders MoneyBoard with no highlight. `params` is accepted to
 * match the illustration signature but is unused (this is a fixed paper figure).
 */
export default function Money22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Uang dalam keping: satu kartu 50, dua kartu 10, tiga kartu 5, dan sembilan koin bernilai 1. Berapa jumlah seluruhnya?"
    >
      <MoneyBoard />
    </div>
  )
}
