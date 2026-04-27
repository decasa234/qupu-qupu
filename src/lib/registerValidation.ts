export interface RegistrationFormValues {
  name: string
  email: string
  phone: string
  password: string
}

export type RegistrationErrors = Partial<Record<keyof RegistrationFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(value: string): string | undefined {
  const trimmed = value.trim()
  if (trimmed.length < 2) return 'Nama minimal 2 karakter.'
  if (trimmed.length > 50) return 'Nama maksimal 50 karakter.'
  return undefined
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return 'Email wajib diisi.'
  if (!EMAIL_PATTERN.test(trimmed)) return 'Format email tidak valid.'
  return undefined
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'No. HP wajib diisi.'
  if (digits.length < 10 || digits.length > 13) {
    return 'No. HP harus 10–13 digit angka.'
  }
  if (!digits.startsWith('08') && !digits.startsWith('628')) {
    return 'No. HP harus mulai dari 08.'
  }
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (value.length < 8) return 'Password minimal 8 karakter.'
  return undefined
}

export function validateRegistrationForm(values: RegistrationFormValues): RegistrationErrors {
  const errors: RegistrationErrors = {}
  const name = validateName(values.name)
  if (name) errors.name = name
  const email = validateEmail(values.email)
  if (email) errors.email = email
  const phone = validatePhone(values.phone)
  if (phone) errors.phone = phone
  const password = validatePassword(values.password)
  if (password) errors.password = password
  return errors
}

export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 13)
}
