import { expect } from 'chai'
import { validateSatelliteComparisonInput } from '../lib/satelliteComparisonValidation'

describe('validateSatelliteComparisonInput', function () {
  const validInput = {
    coordinates: { lat: 21.5, lng: 88.8 },
    radiusKm: 2,
    beforeStartDate: '2024-01-01',
    beforeEndDate: '2024-02-01',
    afterStartDate: '2024-03-01',
    afterEndDate: '2024-04-01',
  }

  it('accepts valid coordinates, radius, and ordered date periods', function () {
    expect(validateSatelliteComparisonInput(validInput)).to.deep.equal([])
  })

  it('rejects invalid coordinates', function () {
    expect(validateSatelliteComparisonInput({
      ...validInput,
      coordinates: { lat: 91, lng: 181 },
    })).to.have.length(2)
  })

  it('rejects a zero or negative radius', function () {
    expect(validateSatelliteComparisonInput({
      ...validInput,
      radiusKm: 0,
    })).to.include('Radius must be a finite number greater than zero.')
  })

  it('rejects impossible calendar dates', function () {
    expect(validateSatelliteComparisonInput({
      ...validInput,
      beforeStartDate: '2024-02-30',
    })).to.include('All dates must be valid dates in YYYY-MM-DD format.')
  })

  it('rejects reversed date periods', function () {
    expect(validateSatelliteComparisonInput({
      ...validInput,
      beforeStartDate: '2024-02-01',
      beforeEndDate: '2024-01-01',
    })).to.include('The before period start date must precede its end date.')
  })

  it('rejects overlapping before and after periods', function () {
    expect(validateSatelliteComparisonInput({
      ...validInput,
      afterStartDate: '2024-01-15',
    })).to.include('The before period must not overlap the after period.')
  })
})
