export interface SatelliteComparisonInput {
  coordinates: { lat: number; lng: number }
  radiusKm: number
  beforeStartDate: string
  beforeEndDate: string
  afterStartDate: string
  afterEndDate: string
}

const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
}

export function validateSatelliteComparisonInput(
  input: SatelliteComparisonInput,
): string[] {
  const errors: string[] = []
  const { lat, lng } = input.coordinates ?? ({} as SatelliteComparisonInput['coordinates'])

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.push('Latitude must be a finite number between -90 and 90.')
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    errors.push('Longitude must be a finite number between -180 and 180.')
  }

  if (!Number.isFinite(input.radiusKm) || input.radiusKm <= 0) {
    errors.push('Radius must be a finite number greater than zero.')
  }

  const dates = [
    input.beforeStartDate,
    input.beforeEndDate,
    input.afterStartDate,
    input.afterEndDate,
  ]

  if (!dates.every(isValidDate)) {
    errors.push('All dates must be valid dates in YYYY-MM-DD format.')
    return errors
  }

  const [beforeStart, beforeEnd, afterStart, afterEnd] =
    dates.map((date) => Date.parse(`${date}T00:00:00.000Z`))

  if (beforeStart >= beforeEnd) {
    errors.push('The before period start date must precede its end date.')
  }

  if (afterStart >= afterEnd) {
    errors.push('The after period start date must precede its end date.')
  }

  if (beforeEnd > afterStart) {
    errors.push('The before period must not overlap the after period.')
  }

  return errors
}
