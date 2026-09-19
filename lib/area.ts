/**
 * Parse and validate area input (hectares).
 * Accepts: "20", "20 ha", "20 hectares", "20.5", " 20 " etc.
 * Strips non-numeric characters (keeps one decimal point), rejects invalid.
 * Use for: form validation, API normalization, DB writes.
 */

export interface ParseAreaResult {
  value: number
  valid: boolean
  error?: string
}

const INVALID_MESSAGE = 'Please enter a valid area in hectares (e.g. 20 or 20 hectares).'

export function parseAreaInput(input: string | number | null | undefined): ParseAreaResult {
  if (input == null || input === '') {
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }
  if (typeof input === 'number') {
    if (Number.isFinite(input) && input >= 0) {
      return { value: input, valid: true }
    }
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }
  const str = String(input).trim()
  if (!str) {
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }
  const stripped = str.replace(/[^0-9.]/g, '')
  const value = parseFloat(stripped)
  if (!Number.isFinite(value) || value < 0) {
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }
  return { value, valid: true }
}

/** Get numeric area for DB/API. Safe fallback to 0. */
export function toNumericArea(input: string | number | null | undefined): number {
  return parseAreaInput(input).value
}

/** Format area for UI display (add "hectares" unit). */
export function formatAreaForDisplay(area: string | number | null | undefined): string {
  const { value, valid } = parseAreaInput(area)
  if (!valid && value === 0) return ''
  return `${value} hectares`
}
