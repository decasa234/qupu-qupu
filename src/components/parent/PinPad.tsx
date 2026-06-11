// src/components/parent/PinPad.tsx
//
// Presentational 4-digit PIN pad: a row of 4 dots, a 0-9 grid plus
// backspace, brand-styled (white keys, #FFE3CC ring, #FFD3B1 hard shadow,
// Fredoka digits). Owns only the in-progress digits; the parent component
// decides what a completed PIN means (verify / first entry / confirmation).
//
// Contract:
// - `onComplete(pin)` fires once when the 4th digit lands. The dots stay
//   filled (and the pad locks) until the parent reacts.
// - `error` is rendered below the dots when truthy.
// - `shakeNonce` increments on every failure: the dots shake, the digits
//   clear, and the pad unlocks for another try. A counter (not the error
//   string) so the same message twice still re-triggers the shake.
import { useEffect, useRef, useState } from 'react'

interface PinPadProps {
  onComplete: (pin: string) => void
  error?: string | null
  shakeNonce?: number
  busy?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'] as const

export default function PinPad({ onComplete, error, shakeNonce = 0, busy = false }: PinPadProps) {
  const [digits, setDigits] = useState('')
  const completedRef = useRef(false)

  // A new failure (shakeNonce bump) clears the entry and re-arms onComplete.
  const lastShakeRef = useRef(shakeNonce)
  useEffect(() => {
    if (shakeNonce !== lastShakeRef.current) {
      lastShakeRef.current = shakeNonce
      completedRef.current = false
      setDigits('')
    }
  }, [shakeNonce])

  const locked = busy || digits.length >= 4

  function pressDigit(digit: string) {
    if (locked) return
    const next = digits + digit
    setDigits(next)
    if (next.length === 4 && !completedRef.current) {
      completedRef.current = true
      onComplete(next)
    }
  }

  function pressBackspace() {
    if (locked) return
    setDigits((current) => current.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dots — re-keyed by shakeNonce so the shake animation restarts. */}
      <div
        key={shakeNonce}
        className={`flex items-center gap-3 ${shakeNonce > 0 ? 'animate-pin-shake' : ''}`}
        aria-label={`PIN ${digits.length} dari 4 digit`}
      >
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-4 w-4 rounded-full transition-colors ${
              index < digits.length ? 'bg-qupu-brand-orange' : 'bg-qupu-brand-blue/15'
            }`}
          />
        ))}
      </div>

      {error ? (
        <p className="text-center text-xs font-bold text-[#E11D48]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid w-full max-w-[15rem] grid-cols-3 gap-2.5">
        {KEYS.map((key, index) => {
          if (key === '') {
            return <span key={`blank-${index}`} aria-hidden="true" />
          }
          if (key === 'backspace') {
            return (
              <button
                key="backspace"
                type="button"
                onClick={pressBackspace}
                disabled={busy || digits.length === 0}
                aria-label="Hapus digit terakhir"
                className="flex h-14 items-center justify-center rounded-2xl bg-white text-lg text-qupu-brand-blue ring-2 ring-[#FFE3CC] shadow-[0_4px_0_0_#FFD3B1] transition-transform active:translate-y-0.5 disabled:opacity-40"
              >
                <i className="fa-solid fa-delete-left" aria-hidden="true" />
              </button>
            )
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => pressDigit(key)}
              disabled={locked}
              className="flex h-14 items-center justify-center rounded-2xl bg-white font-display text-2xl font-extrabold text-qupu-brand-blue ring-2 ring-[#FFE3CC] shadow-[0_4px_0_0_#FFD3B1] transition-transform active:translate-y-0.5 disabled:opacity-40"
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
