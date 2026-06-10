/*
 * Shared API error helpers. Previously every admin page hand-rolled the same
 * `extractErr` narrowing block; this is the single implementation.
 */

interface ApiErrorShape {
  response?: { data?: { error?: string } }
}

/** The server's `error` field verbatim (a code like `rate_limited` or a human
 *  message, depending on the endpoint), or null if the shape doesn't match. */
export function getApiErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const shaped = error as ApiErrorShape
    if (typeof shaped.response?.data?.error === 'string') {
      return shaped.response.data.error
    }
  }
  return null
}

/** The server's `error` message, or `fallback` when absent. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorCode(error) ?? fallback
}

/** The server's stable machine-readable `code` field (e.g. `OTP_EXPIRED`),
 *  or null. Use this — never the human message — for flow control. */
export function getApiResponseCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const shaped = error as { response?: { data?: { code?: unknown } } }
    if (typeof shaped.response?.data?.code === 'string') {
      return shaped.response.data.code
    }
  }
  return null
}
