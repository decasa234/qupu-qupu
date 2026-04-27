import { useEffect, useRef, useState } from 'react'

interface OtpInputProps {
  length: number
  disabled?: boolean
  onComplete: (otp: string) => void
}

export default function OtpInput({ length, disabled, onComplete }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(''))
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const updateAt = (index: number, char: string) => {
    setValues((prev) => {
      const next = [...prev]
      next[index] = char
      const joined = next.join('')
      if (joined.length === length && !next.includes('')) {
        onComplete(joined)
      }
      return next
    })
  }

  const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, '')
    if (raw.length <= 1) {
      updateAt(index, raw)
      if (raw && index < length - 1) {
        inputs.current[index + 1]?.focus()
      }
      return
    }
    // Pasted multiple digits
    const chars = raw.slice(0, length - index).split('')
    setValues((prev) => {
      const next = [...prev]
      chars.forEach((c, offset) => {
        next[index + offset] = c
      })
      const joined = next.join('')
      if (joined.length === length && !next.includes('')) {
        onComplete(joined)
      }
      return next
    })
    const focusIndex = Math.min(index + chars.length, length - 1)
    inputs.current[focusIndex]?.focus()
  }

  const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={length}
          value={values[i]}
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-10 rounded-xl border-2 border-qupu-peach bg-qupu-shell text-center font-mono text-xl font-bold text-qupu-brand-blue outline-none focus:border-qupu-brand-orange disabled:opacity-60"
        />
      ))}
    </div>
  )
}
