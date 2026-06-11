// api/lib/pin.ts
//
// Parent PIN format: exactly 4 ASCII digits, always handled as a string
// (a leading-zero PIN like "0123" must survive transport intact).
export const PIN_REGEX = /^[0-9]{4}$/

export function isValidPin(value: unknown): value is string {
  return typeof value === 'string' && PIN_REGEX.test(value)
}
