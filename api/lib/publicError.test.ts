import { describe, expect, it } from 'vitest'
import { GENERIC_USER_ERROR, resolvePublicError } from './publicError'

describe('resolvePublicError', () => {
  it('maps ownership sentinels to 404 with Indonesian copy', () => {
    expect(resolvePublicError(new Error('Child not found'))).toEqual({
      status: 404,
      message: 'Profil anak tidak ditemukan.',
    })
    expect(resolvePublicError(new Error('Paper not found'))).toEqual({
      status: 404,
      message: 'Paket soal tidak ditemukan.',
    })
    expect(resolvePublicError(new Error('Question not found'))).toEqual({
      status: 404,
      message: 'Soal tidak ditemukan.',
    })
  })

  it('keeps the exam-ownership 403 passthrough', () => {
    expect(resolvePublicError(new Error('Sesi ujian ini milik profil anak yang lain'))).toEqual({
      status: 403,
      message: 'Sesi ujian ini milik profil anak yang lain',
    })
  })

  it('passes through intentionally-Indonesian dynamic engine messages', () => {
    expect(resolvePublicError(new Error('tidak bisa membuat soal untuk konsep digit-sum'))).toEqual({
      status: 400,
      message: 'tidak bisa membuat soal untuk konsep digit-sum',
    })
  })

  it('masks unknown messages (Postgres internals, invariants) as generic 400', () => {
    expect(
      resolvePublicError(new Error('duplicate key value violates unique constraint "users_pkey"')),
    ).toEqual({ status: 400, message: GENERIC_USER_ERROR })
    expect(resolvePublicError(new Error('gamification_profile missing after ensureProfile'))).toEqual({
      status: 400,
      message: GENERIC_USER_ERROR,
    })
  })

  it('masks non-Error throws as generic 400', () => {
    expect(resolvePublicError('boom')).toEqual({ status: 400, message: GENERIC_USER_ERROR })
    expect(resolvePublicError(undefined)).toEqual({ status: 400, message: GENERIC_USER_ERROR })
  })
})
