# TODOS

Deferred work, with enough context to pick it up cold.

## Avatar / cosmetics shop (coin spend side)

**What:** The avatar-cosmetics shop — `cosmetic_items` and `child_cosmetic_unlocks`
tables, the coin purchase flow, and the shop UI. The spend side of the coin economy.

**Why:** Coins earn-only (shipped in the coins v1 plan) is a weak retention mechanic —
effectively a second XP counter. The shop is what turns earned coins into a real
reason a kid comes back.

**Context:** Deferred from the coins v1 plan by decision D10 of the 2026-05-20
`/plan-eng-review`. Reason: the shop is blocked on the avatar art pipeline (the QUPU
mascot is a flat PNG — `public/hero-mascot.png` — with no rigged/layered avatar), and
it validates nothing while QUPU is pre-launch with no users. The coins v1 plan ships
earning only; a `coin_balance` is shown next to XP.

The eng review already resolved the shop's design — carry these forward so they are
not re-derived:
- **Purchase transaction (Issue 1):** insert the unlock row first with
  `ON CONFLICT (child_id, cosmetic_item_id) DO NOTHING`; if nothing inserted, the kid
  already owns it, stop with no debit; then debit with one conditional
  `UPDATE ... SET coin_balance = coin_balance - price WHERE coin_balance >= price`;
  zero rows affected means insufficient funds, roll back. (`CHECK (coin_balance >= 0)`
  is already on the column from coins v1.)
- **Spend record (Issue 2):** store `coins_spent` on each `child_cosmetic_unlocks`
  row at purchase time, so the balance is reconcilable and repricing does not rewrite
  history.
- **Catalog flag (Issue 5):** `is_active BOOLEAN NOT NULL DEFAULT TRUE` on
  `cosmetic_items`; the shop list filters it; the purchase validates the item exists
  and is active.
- **Catalog integrity (outside voice):** `CHECK (coin_price > 0)` on `cosmetic_items`;
  an active cosmetic with a NULL `asset_key` should not be sellable.
- **Casino-presentation:** the shop UI must avoid loot-box, rarity-tier, and
  countdown patterns. "Coins as learning progress, not gambling" is a design
  constraint, not just earn mechanics.

**Depends on / blocked by:** Open Question 1 of the coins design doc (avatar art
pipeline decision), and ideally real returning kids so the shop is built for an
audience that exists. Run `/plan-design-review` on the shop UI when it is built.
