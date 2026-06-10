// src/lib/errorMessage.ts
//
// Maps any thrown error to a parent/kid-friendly Indonesian message.
// Axios errors carry raw English internals ("Network Error", "Request
// failed with status code 500") that must NEVER reach a member screen,
// so this helper never returns `err.message` — only mapped copy, the
// server's own (Indonesian) envelope message on 4xx, or the fallback.
import { isAxiosError } from 'axios'

export const NETWORK_ERROR_MESSAGE = 'Koneksi bermasalah. Periksa internetmu, ya.'
export const SERVER_ERROR_MESSAGE = 'Server sedang bermasalah. Coba lagi sebentar lagi.'
export const RATE_LIMIT_ERROR_MESSAGE = 'Terlalu banyak percobaan. Tunggu sebentar, ya.'

export function toIndonesianErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const response = err.response
    // No response at all: network down, DNS failure, timeout, CORS.
    if (!response) return NETWORK_ERROR_MESSAGE
    if (response.status >= 500) return SERVER_ERROR_MESSAGE
    if (response.status === 429) return RATE_LIMIT_ERROR_MESSAGE
    if (response.status >= 400) {
      // Our API's standard envelope is { success: false, error: <message> }.
      // 4xx envelope messages are authored Indonesian copy, safe to show.
      const serverMessage = (response.data as { error?: unknown } | null)?.error
      if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
        return serverMessage
      }
    }
  }
  return fallback
}
