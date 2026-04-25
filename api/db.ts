import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Falling back to local pg defaults.')
}

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
      }
    : undefined,
)

export type DbExecutor = Pool | PoolClient

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
  executor: DbExecutor = pool,
): Promise<T[]> {
  const result = await executor.query<T>(text, params)
  return result.rows
}

export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
  executor: DbExecutor = pool,
): Promise<T | null> {
  const rows = await query<T>(text, params, executor)
  return rows[0] ?? null
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export default pool
