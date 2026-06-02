import { queryOne, type DbExecutor } from '../db.js'

/**
 * Throws "Child not found" if the supplied childId is not owned by the
 * supplied parentUserId. Accepts any DbExecutor (the shared pool or a
 * transaction client) so callers can run it inside or outside a transaction.
 */
export async function assertChildOwnership(
  executor: DbExecutor,
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
