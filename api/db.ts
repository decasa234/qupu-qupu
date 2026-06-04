import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Falling back to local pg defaults.')
}

// SSL is opt-in via DATABASE_SSL so local Postgres (no TLS) keeps working:
//   DATABASE_SSL=verify   → TLS with full cert verification. PREFERRED for
//                           production. If the provider uses a private CA,
//                           point Node at it via NODE_EXTRA_CA_CERTS rather
//                           than disabling verification.
//   DATABASE_SSL=require  → TLS WITHOUT cert verification. Convenient for some
//                           managed providers, but it does NOT protect against
//                           a man-in-the-middle — prefer `verify` + a trusted
//                           CA wherever possible.
//   unset/anything else   → no TLS (local dev).
function resolveSsl(): false | { rejectUnauthorized: boolean } {
  switch (process.env.DATABASE_SSL) {
    case 'verify':
      return { rejectUnauthorized: true }
    case 'require':
      return { rejectUnauthorized: false }
    default:
      return false
  }
}

// Bound the pool per serverless instance — on Vercel many warm instances each
// hold a pool, so an unbounded `max` exhausts Postgres connections. Keep it
// small and lean on a pooler (PgBouncer / Neon / Supabase) for scale.
export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        max: Number(process.env.PG_POOL_MAX ?? 5),
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 10_000,
        ssl: resolveSsl(),
      }
    : undefined,
)

// Without this handler, an error on an idle client (e.g. the DB dropping the
// connection) is emitted as an unhandled 'error' event and crashes the process.
pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client:', err)
})

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
