// api/lib/deterministicUuid.ts
//
// Stable UUID-shaped value derived from a natural-key seed.
//
// reward_ledger.source_id is a UUID column, but several grants' natural
// idempotency keys are strings (e.g. "streak-shield:<child>:<date>",
// "tier-up:<child>:<slug>:<tier>"). Same seed → same id → the UNIQUE
// (child_id, reward_type, source_type, source_id) ledger key absorbs
// retries, replays, and recomputes.

import { createHash } from 'node:crypto'

export function deterministicUuid(seed: string): string {
  const h = createHash('md5').update(seed).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}
