import type { PoolClient } from 'pg'
import { queryOne } from '../db.js'

/**
 * Throws "Child not found" if the supplied childId is not owned by the
 * supplied parentUserId.
 */
export async function assertChildOwnership(
  executor: PoolClient,
  parentUserId: string,
  childId: string,
): Promise<void> {
  const owned = await queryOne<{ id: string }>(
    'SELECT id FROM children WHERE id = $1 AND parent_user_id = $2',
    [childId, parentUserId],
    executor,
  )

  if (!owned) {
    throw new Error('Child not found')
  }
}
