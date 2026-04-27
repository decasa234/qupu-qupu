import bcrypt from 'bcrypt'
import crypto from 'crypto'
import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction } from '../db.js'
import { sendOtpEmail } from './email.js'

const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_OTP_ATTEMPTS = 5
const OTP_BCRYPT_COST = 10
const PASSWORD_BCRYPT_COST = 12

export class RegistrationError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface InitInput {
  email: string
  phone: string
  name: string
  age: number | null
  password: string
}

export interface InitResult {
  pendingId: string
  expiresAt: string
}

export interface VerifyResult {
  user: {
    id: string
    email: string
    name: string
    role: string
    phone: string | null
    age: number | null
  }
}

function generateOtp(): string {
  const n = crypto.randomInt(0, 1_000_000)
  return String(n).padStart(6, '0')
}

async function findExistingPasswordUser(
  client: PoolClient,
  email: string,
  phone: string,
): Promise<{ field: 'email' | 'phone' } | null> {
  const byEmail = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE email = $1 AND password_hash IS NOT NULL`,
    [email],
    client,
  )
  if (byEmail) return { field: 'email' }

  const byPhone = await queryOne<{ id: string }>(
    `SELECT id FROM users WHERE phone = $1 AND password_hash IS NOT NULL`,
    [phone],
    client,
  )
  if (byPhone) return { field: 'phone' }

  return null
}

export async function initRegistration(input: InitInput): Promise<InitResult> {
  return withTransaction(async (client) => {
    const conflict = await findExistingPasswordUser(client, input.email, input.phone)
    if (conflict?.field === 'email') {
      throw new RegistrationError(409, 'Email sudah terdaftar, silakan login.')
    }
    if (conflict?.field === 'phone') {
      throw new RegistrationError(409, 'No. HP sudah terdaftar.')
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_BCRYPT_COST)
    const otp = generateOtp()
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_COST)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    await client.query(
      `DELETE FROM pending_registrations WHERE email = $1`,
      [input.email],
    )

    const inserted = await queryOne<{ id: string; expires_at: string }>(
      `
        INSERT INTO pending_registrations
          (email, phone, name, age, password_hash, otp_hash, expires_at, last_sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, expires_at
      `,
      [
        input.email,
        input.phone,
        input.name,
        input.age,
        passwordHash,
        otpHash,
        expiresAt.toISOString(),
      ],
      client,
    )

    if (!inserted) {
      throw new RegistrationError(500, 'Gagal membuat pending registration.')
    }

    try {
      await sendOtpEmail(input.email, input.name, otp)
    } catch (error) {
      // Roll back the pending row by deleting it; transaction commits will
      // happen anyway, so we explicitly delete here.
      await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [inserted.id])
      console.error('Resend send failed:', error)
      throw new RegistrationError(
        500,
        'Gagal kirim email. Cek koneksi atau coba beberapa saat lagi.',
      )
    }

    return {
      pendingId: inserted.id,
      expiresAt: inserted.expires_at,
    }
  })
}

export interface VerifyInput {
  pendingId: string
  otp: string
}

export async function verifyOtp(input: VerifyInput): Promise<VerifyResult['user']> {
  return withTransaction(async (client) => {
    const pending = await queryOne<{
      id: string
      email: string
      phone: string
      name: string
      age: number | null
      password_hash: string
      otp_hash: string
      attempts_count: number
    }>(
      `
        SELECT id, email, phone, name, age, password_hash, otp_hash, attempts_count
        FROM pending_registrations
        WHERE id = $1 AND expires_at > NOW()
        FOR UPDATE
      `,
      [input.pendingId],
      client,
    )

    if (!pending) {
      throw new RegistrationError(400, 'Kode kadaluarsa.')
    }

    if (pending.attempts_count >= MAX_OTP_ATTEMPTS) {
      await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [pending.id])
      throw new RegistrationError(429, 'Terlalu banyak percobaan.')
    }

    const matches = await bcrypt.compare(input.otp, pending.otp_hash)
    if (!matches) {
      await client.query(
        `UPDATE pending_registrations SET attempts_count = attempts_count + 1 WHERE id = $1`,
        [pending.id],
      )
      throw new RegistrationError(400, 'Kode salah.')
    }

    const conflict = await findExistingPasswordUser(client, pending.email, pending.phone)
    if (conflict) {
      await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [pending.id])
      throw new RegistrationError(409, 'Email sudah terdaftar, silakan login.')
    }

    const ageGroup =
      pending.age !== null
        ? await queryOne<{ id: string }>(
            `
              SELECT id FROM age_groups
              WHERE min_age <= $1 AND max_age >= $1
              ORDER BY min_age ASC
              LIMIT 1
            `,
            [pending.age],
            client,
          )
        : null

    const user = await queryOne<{
      id: string
      email: string
      name: string
      role: string
      phone: string | null
      age: number | null
    }>(
      `
        INSERT INTO users (email, phone, name, age, age_group_id, password_hash, role, is_verified)
        VALUES ($1, $2, $3, $4, $5, $6, 'parent', TRUE)
        RETURNING id, email, name, role, phone, age
      `,
      [
        pending.email,
        pending.phone,
        pending.name,
        pending.age,
        ageGroup?.id ?? null,
        pending.password_hash,
      ],
      client,
    )

    if (!user) {
      throw new RegistrationError(500, 'Gagal membuat akun.')
    }

    await client.query(`DELETE FROM pending_registrations WHERE id = $1`, [pending.id])

    return user
  })
}

export interface ResendInput {
  pendingId: string
}

export async function resendOtp(input: ResendInput): Promise<{ expiresAt: string }> {
  return withTransaction(async (client) => {
    const pending = await queryOne<{
      id: string
      email: string
      name: string
      last_sent_at: string
    }>(
      `
        SELECT id, email, name, last_sent_at
        FROM pending_registrations
        WHERE id = $1 AND expires_at > NOW()
        FOR UPDATE
      `,
      [input.pendingId],
      client,
    )

    if (!pending) {
      throw new RegistrationError(400, 'Kode kadaluarsa.')
    }

    const lastSent = new Date(pending.last_sent_at).getTime()
    if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
      throw new RegistrationError(429, 'Tunggu sebentar sebelum kirim ulang.')
    }

    const otp = generateOtp()
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_COST)
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    const updated = await queryOne<{ expires_at: string }>(
      `
        UPDATE pending_registrations
        SET otp_hash = $2, attempts_count = 0, expires_at = $3, last_sent_at = NOW()
        WHERE id = $1
        RETURNING expires_at
      `,
      [pending.id, otpHash, expiresAt.toISOString()],
      client,
    )

    if (!updated) {
      throw new RegistrationError(500, 'Gagal memperbarui kode.')
    }

    try {
      await sendOtpEmail(pending.email, pending.name, otp)
    } catch (error) {
      console.error('Resend send failed:', error)
      throw new RegistrationError(
        500,
        'Gagal kirim email. Cek koneksi atau coba beberapa saat lagi.',
      )
    }

    return { expiresAt: updated.expires_at }
  })
}

// Lazy cleanup of stale rows. Called occasionally on read paths to keep the
// table from accumulating expired entries forever.
export async function purgeExpiredPendingRegistrations(): Promise<void> {
  await query(
    `DELETE FROM pending_registrations WHERE expires_at < NOW() - INTERVAL '7 days'`,
  )
}
