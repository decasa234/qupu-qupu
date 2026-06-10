import { describe, expect, it } from 'vitest'
import {
  NETWORK_ERROR_MESSAGE,
  RATE_LIMIT_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
  toIndonesianErrorMessage,
} from './errorMessage'

const FALLBACK = 'Gagal memuat'

// axios.isAxiosError() only checks `isAxiosError === true` on an object,
// so plain objects shaped like AxiosError exercise the real code path.
function axiosError(response?: { status: number; data?: unknown }) {
  return { isAxiosError: true, message: 'Request failed with status code 500', response }
}

describe('toIndonesianErrorMessage', () => {
  it('maps a no-response axios error (offline/timeout) to the network message', () => {
    expect(toIndonesianErrorMessage(axiosError(undefined), FALLBACK)).toBe(NETWORK_ERROR_MESSAGE)
  })

  it('maps 5xx to the server message, ignoring any body', () => {
    expect(
      toIndonesianErrorMessage(axiosError({ status: 500, data: { error: 'Internal server error' } }), FALLBACK),
    ).toBe(SERVER_ERROR_MESSAGE)
    expect(toIndonesianErrorMessage(axiosError({ status: 503 }), FALLBACK)).toBe(SERVER_ERROR_MESSAGE)
  })

  it('maps 429 to the rate-limit message', () => {
    expect(
      toIndonesianErrorMessage(axiosError({ status: 429, data: { error: 'Too many' } }), FALLBACK),
    ).toBe(RATE_LIMIT_ERROR_MESSAGE)
  })

  it('shows the server envelope message on 4xx', () => {
    expect(
      toIndonesianErrorMessage(
        axiosError({ status: 404, data: { success: false, error: 'Profil anak tidak ditemukan.' } }),
        FALLBACK,
      ),
    ).toBe('Profil anak tidak ditemukan.')
    expect(
      toIndonesianErrorMessage(
        axiosError({ status: 400, data: { success: false, error: 'Email atau kata sandi salah' } }),
        FALLBACK,
      ),
    ).toBe('Email atau kata sandi salah')
  })

  it('falls back when a 4xx has no usable envelope message', () => {
    expect(toIndonesianErrorMessage(axiosError({ status: 400 }), FALLBACK)).toBe(FALLBACK)
    expect(toIndonesianErrorMessage(axiosError({ status: 400, data: { error: '   ' } }), FALLBACK)).toBe(FALLBACK)
    expect(toIndonesianErrorMessage(axiosError({ status: 400, data: { error: 42 } }), FALLBACK)).toBe(FALLBACK)
    expect(toIndonesianErrorMessage(axiosError({ status: 400, data: null }), FALLBACK)).toBe(FALLBACK)
  })

  it('never returns a raw Error message', () => {
    expect(toIndonesianErrorMessage(new Error('Network Error'), FALLBACK)).toBe(FALLBACK)
    expect(toIndonesianErrorMessage(new Error('connect ECONNREFUSED 127.0.0.1:3001'), FALLBACK)).toBe(FALLBACK)
  })

  it('falls back for non-error junk', () => {
    expect(toIndonesianErrorMessage(undefined, FALLBACK)).toBe(FALLBACK)
    expect(toIndonesianErrorMessage(null, FALLBACK)).toBe(FALLBACK)
    expect(toIndonesianErrorMessage('boom', FALLBACK)).toBe(FALLBACK)
    expect(toIndonesianErrorMessage({ message: 'boom' }, FALLBACK)).toBe(FALLBACK)
  })

  it('treats 2xx-status axios errors (should not happen) as fallback', () => {
    expect(toIndonesianErrorMessage(axiosError({ status: 200, data: { error: 'x' } }), FALLBACK)).toBe(FALLBACK)
  })
})
