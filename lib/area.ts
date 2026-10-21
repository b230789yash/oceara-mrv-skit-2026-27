/**
 * Parse and validate area input in hectares.
 * Accepts: "20", "20 ha", "20 hectare", "20 hectares", "20.5", etc.
 * Rejects malformed numbers, negative strings, embedded text and unsupported units.
 * Use for form validation, API normalization and database writes.
 */

export interface ParseAreaResult {
  value: number
  valid: boolean
  error?: string
}

const INVALID_MESSAGE =
  'Please enter a valid area in hectares (e.g. 20 or 20 hectares).'

export function parseAreaInput(
  input: string | number | null | undefined
): ParseAreaResult {
  if (input == null) {
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }

  if (typeof input === 'number') {
    if (Number.isFinite(input) && input >= 0) {
      return { value: input, valid: true }
    }

    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }

  const str = input.trim()

  if (!str) {
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }

  const match = str.match(
    /^(\d+(?:\.\d+)?)\s*(?:ha|hectares?)?$/i
  )

  if (!match) {
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }

  const value = Number(match[1])

  if (!Number.isFinite(value) || value < 0) {
    return { value: 0, valid: false, error: INVALID_MESSAGE }
  }

  return { value, valid: true }
}

/** Get numeric area for DB/API. Invalid input falls back to 0. */
export function toNumericArea(
  input: string | number | null | undefined
): number {
  const result = parseAreaInput(input)
  return result.valid ? result.value : 0
}

/** Format a valid area for UI display using the hectares unit. */
export function formatAreaForDisplay(
  area: string | number | null | undefined
): string {
  const result = parseAreaInput(area)

  if (!result.valid) return ''

  return `${result.value} hectares`
}
