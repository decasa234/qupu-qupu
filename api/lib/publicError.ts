// api/lib/publicError.ts
//
// Member-facing error responses. Services throw short English sentinel
// messages ('Child not found', ...) that double as status discriminators;
// this module keeps that status mapping intact while making sure the
// response body is always safe Indonesian copy — an unrecognized message
// (Postgres internals, invariant violations) is never echoed to a member.
import type { Response } from 'express'
import type Joi from 'joi'

export const GENERIC_USER_ERROR = 'Terjadi kesalahan. Coba lagi.'
export const INVALID_REQUEST_ERROR = 'Permintaan tidak valid.'

interface PublicError {
  status: number
  message: string
}

// Allowlist: sentinel thrown by a service -> { historical status, public copy }.
// Statuses mirror what member.ts/wmi-member.ts returned before this module
// (Child/Paper/Question not found were 404, exam ownership 403, rest 400).
const KNOWN_ERRORS: Record<string, PublicError> = {
  'Child not found': { status: 404, message: 'Profil anak tidak ditemukan.' },
  'Paper not found': { status: 404, message: 'Paket soal tidak ditemukan.' },
  'Question not found': { status: 404, message: 'Soal tidak ditemukan.' },
  'Video not found': { status: 400, message: 'Video tidak ditemukan.' },
  'Concept not found': { status: 400, message: 'Konsep tidak ditemukan.' },
  // Quest claim ritual (P2.2)
  'Quest not found': { status: 404, message: 'Misi tidak ditemukan.' },
  'Quest not completed': { status: 400, message: 'Misi belum selesai.' },
  // Level-gated avatar items (P2.4) — forged pick of a locked icon/color.
  'Avatar item locked': {
    status: 400,
    message: 'Avatar ini masih terkunci. Naikkan level dulu untuk membukanya!',
  },
  'Sesi ujian ini milik profil anak yang lain': {
    status: 403,
    message: 'Sesi ujian ini milik profil anak yang lain',
  },
  'Exam session already completed': { status: 400, message: 'Sesi ujian ini sudah selesai.' },
  'No concepts available for this chapter': {
    status: 400,
    message: 'Belum ada soal untuk bab ini.',
  },
  // Konsep commit replayed with a session_id that belongs to a different
  // child/subject — reject without leaking the stored result.
  'Konsep session conflict': {
    status: 409,
    message: 'Sesi latihan ini tidak cocok dengan profil anak.',
  },
  // Ownership denial used by the shop/inventory routes (valid session,
  // childId not owned by the authenticated parent) — 403, not 401, so the
  // FE interceptor keeps the session alive.
  'Child does not belong to user': {
    status: 403,
    message: 'Profil anak ini tidak ada di akunmu.',
  },
}

export function resolvePublicError(error: unknown): PublicError {
  const message = error instanceof Error ? error.message : ''
  const known = KNOWN_ERRORS[message]
  if (known) return known
  // The concept engine throws intentionally-Indonesian dynamic messages
  // ("tidak bisa membuat soal untuk konsep <slug>") — safe to pass through.
  if (message.startsWith('tidak bisa membuat soal')) {
    return { status: 400, message }
  }
  return { status: 400, message: GENERIC_USER_ERROR }
}

/** Standard member-route error response. Callers keep their console.error. */
export function sendPublicError(res: Response, error: unknown): void {
  const { status, message } = resolvePublicError(error)
  res.status(status).json({ success: false, error: message })
}

/** Joi failures on member routes: stable Indonesian copy for the user, the
 *  English Joi detail kept in a side field for debugging (FE never reads it). */
export function sendValidationError(res: Response, error: Joi.ValidationError): void {
  res.status(400).json({
    success: false,
    error: INVALID_REQUEST_ERROR,
    detail: error.details[0]?.message,
  })
}
