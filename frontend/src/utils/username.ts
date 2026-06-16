export const USERNAME_MIN_LENGTH = 3
export const USERNAME_MAX_LENGTH = 32

const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_]*$/

export function sanitizeUsernameInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, USERNAME_MAX_LENGTH)
}

export function normalizeUsername(value: string): string {
  return value.trim()
}

export type UsernameValidationError =
  | 'required'
  | 'tooShort'
  | 'tooLong'
  | 'startsWithAt'
  | 'invalidChars'

export function validateUsername(value: string): UsernameValidationError | null {
  const username = normalizeUsername(value)

  if (!username) return 'required'
  if (username.startsWith('@')) return 'startsWithAt'
  if (username.length < USERNAME_MIN_LENGTH) return 'tooShort'
  if (username.length > USERNAME_MAX_LENGTH) return 'tooLong'
  if (!USERNAME_PATTERN.test(username)) return 'invalidChars'

  return null
}

export function formatUsernameLabel(username: string): string {
  const clean = username.replace(/^@+/, '')
  return `@${clean}`
}
