interface BudgetParams {
  prices: number[]
  budget: number
}

const SAMPLE: BudgetParams = { prices: [30, 50, 90, 120], budget: 160 }

/**
 * W7 = budget-selection — question figure.
 *
 * A ticket booth sells four seats at four prices. The learner has a budget and
 * buys TWO different tickets, aiming for the biggest two-ticket total that still
 * fits. This draws ONLY the problem (four price tickets + the budget); it never
 * reveals which pair is the answer.
 *
 * Pure render from params — no random, no dates, SSR-safe. Falls back to a
 * sample so it still renders in previews when params have the wrong shape.
 *
 * LANGUAGE: concept illustrations are handed only `{ params }` (see
 * `IllustrationComponent` in ../registry.ts) and `params` carries no locale, so
 * the figure cannot know whether the stem is rendering in EN or ID. It is
 * therefore drawn WORDLESS — the wallet glyph plus the currency amount carry
 * the "money you may spend" meaning in both languages. Only the aria-label is
 * necessarily prose; it is pinned to English via `lang="en"` on the wrapper so
 * screen readers announce it correctly under the page's `<html lang="id">`.
 */
export default function BudgetSelectionIllustration({ params }: { params: unknown }) {
  const p = (params ?? {}) as Partial<BudgetParams>
  const prices =
    Array.isArray(p.prices) && p.prices.length === 4 && p.prices.every((n) => typeof n === 'number')
      ? (p.prices as number[])
      : SAMPLE.prices
  const budget = typeof p.budget === 'number' ? p.budget : SAMPLE.budget

  // --- layout -------------------------------------------------------------
  const cardW = 108
  const cardH = 74
  const gapX = 20
  const gapY = 20
  const perRow = 2
  const padX = 18
  const padTop = 18
  const cols = perRow
  const rows = Math.ceil(prices.length / perRow)
  const gridW = cols * cardW + (cols - 1) * gapX
  const gridH = rows * cardH + (rows - 1) * gapY

  const budgetH = 46
  const budgetGap = 18

  const width = padX * 2 + gridW
  const height = padTop + gridH + budgetGap + budgetH + 14

  const ariaPrices = prices.map((v) => `$${v}`).join(', ')

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      lang="en"
      aria-label={`Ticket booth: four tickets priced ${ariaPrices}. Wallet holds $${budget} to spend. Buy two tickets with the biggest total that still fits.`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(280, width)}>
        {/* perforation pattern for the ticket notch line */}
        <defs>
          <pattern id="bs-perf" width="6" height="2" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1" r="1" className="fill-white" />
          </pattern>
        </defs>

        {/* four price tickets in a 2x2 grid */}
        {prices.map((value, i) => {
          const col = i % perRow
          const row = Math.floor(i / perRow)
          const x = padX + col * (cardW + gapX)
          const y = padTop + row * (cardH + gapY)
          const notchX = x + cardW * 0.66
          return (
            <g key={i}>
              {/* card body */}
              <rect
                x={x}
                y={y}
                width={cardW}
                height={cardH}
                rx={12}
                className="fill-qupu-cream stroke-qupu-brand-orange"
                strokeWidth={2.5}
              />
              {/* perforation line splitting stub from ticket */}
              <line
                x1={notchX}
                y1={y + 6}
                x2={notchX}
                y2={y + cardH - 6}
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray="3 3"
                className="text-qupu-brand-orange"
              />
              {/* notch cut-outs top and bottom */}
              <circle cx={notchX} cy={y} r={5} className="fill-white stroke-qupu-brand-orange" strokeWidth={2} />
              <circle
                cx={notchX}
                cy={y + cardH}
                r={5}
                className="fill-white stroke-qupu-brand-orange"
                strokeWidth={2}
              />
              {/* price on the main panel */}
              <text
                x={x + (notchX - x) / 2}
                y={y + cardH / 2 + 8}
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                className="fill-qupu-brand-blue"
              >
                {`$${value}`}
              </text>
              {/* little ticket icon (drawn) on the stub side */}
              <g transform={`translate(${notchX + (cardW - (notchX - x)) / 2 - 10}, ${y + cardH / 2 - 12})`}>
                <rect x={0} y={0} width={20} height={24} rx={3} className="fill-qupu-peach stroke-qupu-brand-orange" strokeWidth={1.5} />
                <line x1={4} y1={7} x2={16} y2={7} stroke="currentColor" strokeWidth={1.5} className="text-qupu-brand-orange" />
                <line x1={4} y1={12} x2={16} y2={12} stroke="currentColor" strokeWidth={1.5} className="text-qupu-brand-orange" />
                <line x1={4} y1={17} x2={12} y2={17} stroke="currentColor" strokeWidth={1.5} className="text-qupu-brand-orange" />
              </g>
            </g>
          )
        })}

        {/* Budget banner — a wallet holding the amount that may be spent. No
            caption word: see the LANGUAGE note above. */}
        {(() => {
          const by = padTop + gridH + budgetGap
          const bx = padX
          const bw = gridW
          const amount = `$${budget}`
          const amountSize = 22
          // Deterministic width estimate (never measures the DOM, so it is
          // identical on the server and the client) keeps the wallet + amount
          // group optically centred for 2- and 3-digit budgets alike.
          const amountW = amount.length * amountSize * 0.6
          const walletW = 28
          const glyphGap = 10
          const groupX = bx + (bw - (walletW + glyphGap + amountW)) / 2
          return (
            <g>
              <rect x={bx} y={by} width={bw} height={budgetH} rx={12} className="fill-qupu-brand-blue" />
              {/* wallet flap accent */}
              <rect x={bx} y={by} width={bw} height={16} rx={12} className="fill-qupu-brand-blue-shadow" />
              {/* drawn wallet glyph — the wordless "this is your money" marker */}
              <g transform={`translate(${groupX}, ${by + budgetH / 2 - 11})`}>
                <rect x={0} y={2} width={26} height={20} rx={4} className="fill-qupu-brand-yellow stroke-qupu-shell" strokeWidth={1.5} />
                <rect x={16} y={8} width={12} height={8} rx={2} className="fill-qupu-peach stroke-qupu-shell" strokeWidth={1.5} />
                <circle cx={22} cy={12} r={1.5} className="fill-qupu-brand-blue" />
              </g>
              <text
                x={groupX + walletW + glyphGap}
                y={by + budgetH / 2 + 8}
                fontSize={amountSize}
                fontWeight="bold"
                className="fill-qupu-cream"
              >
                {amount}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
