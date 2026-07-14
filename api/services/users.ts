// api/services/users.ts
//
// users-table reads/writes for the auth and profile routes. Extracted from
// inline route SQL so the highest-consequence lookups (login, PIN) live in
// the same testable service layer as everything else.
import { queryOne } from '../db.js'

export interface UserProfile {
  id: string
  email: string
  phone: string
  name: string
  age: number
  role: string
  age_group_id: string | null
  plan: string
  notify_email: boolean
  pinSet: boolean
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return queryOne<UserProfile>(
    `
      SELECT id, email, phone, name, age, role, age_group_id, plan, notify_email,
             (parent_pin_hash IS NOT NULL) AS "pinSet"
      FROM users
      WHERE id = $1
    `,
    [userId],
  )
}

export async function findAgeGroupIdForAge(age: number): Promise<string | null> {
  const ageGroup = await queryOne<{ id: string }>(
    'SELECT id FROM age_groups WHERE min_age <= $1 AND max_age >= $1 LIMIT 1',
    [age],
  )
  return ageGroup?.id ?? null
}

export async function updateUserProfile(
  userId: string,
  fields: {
    name?: string
    age?: number
    phone?: string
    email?: string
    ageGroupId?: string | null
    notifyEmail?: boolean
  },
) {
  return queryOne<{
    id: string
    email: string
    phone: string
    name: string
    age: number
    role: string
    age_group_id: string | null
    notify_email: boolean
  }>(
    `
      UPDATE users
      SET
        name = COALESCE($2, name),
        age = COALESCE($3, age),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        age_group_id = COALESCE($6, age_group_id),
        notify_email = COALESCE($7, notify_email),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, phone, name, age, role, age_group_id, notify_email
    `,
    [
      userId,
      fields.name ?? null,
      fields.age ?? null,
      fields.phone ?? null,
      fields.email ?? null,
      fields.ageGroupId ?? null,
      fields.notifyEmail ?? null,
    ],
  )
}

// Both PIN endpoints need the stored hashes to verify against.
export async function getUserCredentials(userId: string) {
  return queryOne<{ parent_pin_hash: string | null; password_hash: string | null }>(
    'SELECT parent_pin_hash, password_hash FROM users WHERE id = $1',
    [userId],
  )
}

export async function setParentPinHash(userId: string, pinHash: string): Promise<void> {
  await queryOne('UPDATE users SET parent_pin_hash = $2, updated_at = NOW() WHERE id = $1 RETURNING id', [
    userId,
    pinHash,
  ])
}

// Login lookup: only password identities match (Google-only accounts have
// password_hash NULL and are a separate identity by design).
export async function findUserForLogin(email: string) {
  return queryOne<{
    id: string
    email: string
    name: string
    role: string
    phone: string | null
    age: number | null
    password_hash: string
  }>(
    `
      SELECT id, email, name, role, phone, age, password_hash
      FROM users
      WHERE email = $1 AND password_hash IS NOT NULL
    `,
    [email],
  )
}
