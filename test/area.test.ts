import { expect } from 'chai'
import {
  parseAreaInput,
  toNumericArea,
  formatAreaForDisplay,
} from '../lib/area'

describe('parseAreaInput', function () {
  it('accepts a positive integer string', function () {
    expect(parseAreaInput('20')).to.include({ value: 20, valid: true })
  })

  it('accepts decimal areas', function () {
    expect(parseAreaInput('20.5')).to.include({ value: 20.5, valid: true })
  })

  it('accepts supported hectare units', function () {
    expect(parseAreaInput('20 ha')).to.include({ value: 20, valid: true })
    expect(parseAreaInput('20 hectares')).to.include({ value: 20, valid: true })
  })

  it('trims surrounding whitespace', function () {
    expect(parseAreaInput('  20.5  ').value).to.equal(20.5)
  })

  it('rejects empty and whitespace-only strings', function () {
    expect(parseAreaInput('').valid).to.equal(false)
    expect(parseAreaInput('   ').valid).to.equal(false)
  })

  it('rejects negative numeric strings', function () {
    expect(parseAreaInput('-20').valid).to.equal(false)
  })

  it('rejects text containing numbers', function () {
    expect(parseAreaInput('abc20').valid).to.equal(false)
  })

  it('rejects malformed decimal strings', function () {
    expect(parseAreaInput('20.5.6').valid).to.equal(false)
  })

  it('rejects unsupported units', function () {
    expect(parseAreaInput('20 acres').valid).to.equal(false)
  })

  it('rejects non-finite numeric values', function () {
    expect(parseAreaInput(Number.NaN).valid).to.equal(false)
    expect(parseAreaInput(Number.POSITIVE_INFINITY).valid).to.equal(false)
  })

  it('returns zero as the fallback for invalid numeric conversion', function () {
    expect(toNumericArea('abc20')).to.equal(0)
  })

  it('formats valid areas for display', function () {
    expect(formatAreaForDisplay('20 ha')).to.equal('20 hectares')
  })

  it('returns an empty display string for invalid input', function () {
    expect(formatAreaForDisplay('abc20')).to.equal('')
  })
})
