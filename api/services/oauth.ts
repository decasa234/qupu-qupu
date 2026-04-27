import { OAuth2Client } from 'google-auth-library'
import { queryOne, withTransaction } from '../db.js'

export interface GoogleClaims {
  sub: string
  email: string
  emailVerified: boolean
  name: string
}

export interface OAuthUser {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  age: number | null
}

let cachedClient: OAuth2Client | null = null

function getClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not set')
  }
  if (!cachedClient) {
    cachedClient = new OAuth2Client(clientId)
  }
  return cachedClient
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleClaims> {
  const client = getClient()
  const audience = process.env.GOOGLE_CLIENT_ID

  const ticket = await client.verifyIdToken({ idToken, audience })
  const payload = ticket.getPayload()

  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Invalid Google credential')
  }

  return {
    sub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: payload.name || payload.email.split('@')[0],
  }
}

export async function findOrCreateGoogleUser(claims: GoogleClaims): Promise<OAuthUser> {
  return withTransaction(async (client) => {
    const bySub = await queryOne<OAuthUser>(
      `SELECT id, email, name, role, phone, age FROM users WHERE google_sub = $1`,
      [claims.sub],
      client,
    )

    if (bySub) {
      return bySub
    }

    if (!claims.emailVerified) {
      throw new Error('Google email is not verified')
    }

    const created = await queryOne<OAuthUser>(
      `
        INSERT INTO users (email, name, google_sub, role, is_verified)
        VALUES ($1, $2, $3, 'parent', TRUE)
        RETURNING id, email, name, role, phone, age
      `,
      [claims.email, claims.name, claims.sub],
      client,
    )

    if (!created) {
      throw new Error('Failed to create user')
    }

    return created
  })
}
