import { validateProjectUpdate } from '../lib/project-validation'
import { expect } from 'chai'
import { validateProjectInput } from '../lib/project-validation'

describe('validateProjectInput', function () {
  const validInput = {
    name: 'Sundarbans Restoration',
    location: 'West Bengal, India',
    area: '20 hectares',
    coordinates: { lat: 21.5, lng: 88.8 },
  }

  it('accepts valid project input', function () {
    expect(validateProjectInput(validInput)).to.deep.equal([])
  })

  it('accepts a positive numeric area and optional coordinates', function () {
    expect(validateProjectInput({ ...validInput, area: 20.5, coordinates: null })).to.deep.equal([])
  })

  it('rejects a blank project name', function () {
    expect(validateProjectInput({ ...validInput, name: '   ' })).to.include('Project name is required.')
  })

  it('rejects a blank project location', function () {
    expect(validateProjectInput({ ...validInput, location: '' })).to.include('Project location is required.')
  })

  it('rejects zero and negative areas', function () {
    expect(validateProjectInput({ ...validInput, area: '0' })).to.include(
      'Enter a valid project area greater than zero (for example, 20 or 20 hectares).',
    )
    expect(validateProjectInput({ ...validInput, area: '-20' })).to.include(
      'Enter a valid project area greater than zero (for example, 20 or 20 hectares).',
    )
  })

  it('rejects malformed area strings instead of extracting digits', function () {
    expect(validateProjectInput({ ...validInput, area: 'abc20' })).to.have.length.greaterThan(0)
    expect(validateProjectInput({ ...validInput, area: '20.5.6' })).to.have.length.greaterThan(0)
  })

  it('rejects latitude outside the valid range', function () {
    expect(validateProjectInput({ ...validInput, coordinates: { lat: 91, lng: 88.8 } })).to.include(
      'Latitude must be a number between -90 and 90.',
    )
  })

  it('rejects longitude outside the valid range', function () {
    expect(validateProjectInput({ ...validInput, coordinates: { lat: 21.5, lng: -181 } })).to.include(
      'Longitude must be a number between -180 and 180.',
    )
  })

  it('rejects non-finite coordinates', function () {
    expect(validateProjectInput({ ...validInput, coordinates: { lat: Number.NaN, lng: Number.POSITIVE_INFINITY } })).to.have.length(2)
  })
})


describe('validateProjectUpdate', function () {
  it('accepts a valid name-only update', function () {
    expect(validateProjectUpdate({ name: 'Updated Project' })).to.deep.equal([])
  })

  it('accepts an empty update', function () {
    expect(validateProjectUpdate({})).to.deep.equal([])
  })

  it('rejects a blank supplied name', function () {
    expect(validateProjectUpdate({ name: '   ' })).to.include('Project name is required.')
  })

  it('rejects an invalid supplied area', function () {
    expect(validateProjectUpdate({ area: '-20' })).to.include(
      'Enter a valid project area greater than zero (for example, 20 or 20 hectares).',
    )
  })

  it('rejects invalid supplied coordinates', function () {
    expect(validateProjectUpdate({ coordinates: { lat: 91, lng: 88.8 } })).to.include(
      'Latitude must be a number between -90 and 90.',
    )
  })

  it('rejects coordinates that are not an object', function () {
    expect(validateProjectUpdate({ coordinates: 'invalid' })).to.include(
      'Coordinates must contain valid latitude and longitude values.',
    )
  })
})