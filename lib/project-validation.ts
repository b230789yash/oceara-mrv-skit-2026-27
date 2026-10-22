/**
 * Validation for landowner project registration input.
 * Keep this independent of React so it can be reused by forms and tested directly.
 */

export interface ProjectValidationInput {
  name: unknown
  location: unknown
  area: unknown
  coordinates?: { lat?: unknown; lng?: unknown } | null
}

const AREA_ERROR = 'Enter a valid project area greater than zero (for example, 20 or 20 hectares).'

/**
 * Accept plain positive numbers with an optional supported unit.
 * Examples: 20, 20.5, "20 ha", "20 hectares".
 * Rejects malformed values instead of stripping characters (e.g. "-20" or "abc20").
 */
function isValidPositiveArea(value: unknown): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0
  }

  if (typeof value !== 'string') return false

  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(?:ha|hectares?)?$/i)
  if (!match) return false

  const area = Number(match[1])
  return Number.isFinite(area) && area > 0
}

/** Return user-readable validation errors; an empty array means the input is valid. */
export function validateProjectInput(input: ProjectValidationInput): string[] {
  const errors: string[] = []

  if (typeof input.name !== 'string' || input.name.trim().length === 0) {
    errors.push('Project name is required.')
  }

  if (typeof input.location !== 'string' || input.location.trim().length === 0) {
    errors.push('Project location is required.')
  }

  if (!isValidPositiveArea(input.area)) {
    errors.push(AREA_ERROR)
  }

  // Coordinates are optional in the current form (the app has a default region),
  // but if provided, they must be valid geographic coordinates.
  if (input.coordinates != null) {
    const { lat, lng } = input.coordinates

    if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
      errors.push('Latitude must be a number between -90 and 90.')
    }

    if (typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      errors.push('Longitude must be a number between -180 and 180.')
    }
  }

  return errors
}


/**
 * Validate only the fields supplied in a partial project update.
 * Omitted fields are allowed; supplied fields must be valid.
 */
export function validateProjectUpdate(input: Record<string, unknown>): string[] {
  const errors: string[] = []

  if (Object.prototype.hasOwnProperty.call(input, 'name')) {
    if (typeof input.name !== 'string' || input.name.trim().length === 0) {
      errors.push('Project name is required.')
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'location')) {
    if (typeof input.location !== 'string' || input.location.trim().length === 0) {
      errors.push('Project location is required.')
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'area')) {
    if (!isValidPositiveArea(input.area)) {
      errors.push(AREA_ERROR)
    }
  }

  if (Object.prototype.hasOwnProperty.call(input, 'coordinates') && input.coordinates != null) {
    const coordinates = input.coordinates

    if (typeof coordinates !== 'object' || Array.isArray(coordinates)) {
      errors.push('Coordinates must contain valid latitude and longitude values.')
    } else {
      const { lat, lng } = coordinates as { lat?: unknown; lng?: unknown }

      if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
        errors.push('Latitude must be a number between -90 and 90.')
      }

      if (typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        errors.push('Longitude must be a number between -180 and 180.')
      }
    }
  }

  return errors
}
