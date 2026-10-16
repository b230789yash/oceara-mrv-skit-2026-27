
import { googleEarthEngineService } from './googleEarthEngineFixed'

export interface SatelliteComparisonResult {
  beforeDate: string
  afterDate: string
  beforeNDVI: number
  afterNDVI: number
  ndviChange: number
  trend: 'Increase' | 'Decrease' | 'No significant change'
}

interface Coordinates {
  lat: number
  lng: number
}

export async function compareSatelliteVegetation(
  coordinates: Coordinates,
  radiusKm: number,
  beforeStartDate: string,
  beforeEndDate: string,
  afterStartDate: string,
  afterEndDate: string
): Promise<SatelliteComparisonResult> {
  const initialized = await googleEarthEngineService.initialize()

  if (!initialized) {
    throw new Error('Google Earth Engine initialization failed')
  }

  const ee = window.ee

  const point = ee.Geometry.Point([
    coordinates.lng,
    coordinates.lat
  ])

  const region = point.buffer(radiusKm * 1000)

  async function getPeriodNDVI(
    startDate: string,
    endDate: string
  ): Promise<{ date: string; ndvi: number }> {
    const collection = ee
      .ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterDate(startDate, endDate)
      .filterBounds(region)
      .filter(
        ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20)
      )
      .sort('system:time_start', false)

    const count = collection.size().getInfo()

    if (!count) {
      throw new Error(
        `No suitable Sentinel-2 imagery between ${startDate} and ${endDate}`
      )
    }

    const image = ee.Image(collection.first())

    const ndvi = image.normalizedDifference(['B8', 'B4'])

    const stats = ndvi.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 10,
      maxPixels: 1e9
    }).getInfo()

    if (stats?.nd == null || !Number.isFinite(stats.nd)) {
      throw new Error('Unable to calculate NDVI for this period')
    }

    const timestamp = image.get('system:time_start').getInfo()

    return {
      date: new Date(timestamp).toISOString().split('T')[0],
      ndvi: stats.nd
    }
  }

  const before = await getPeriodNDVI(
    beforeStartDate,
    beforeEndDate
  )

  const after = await getPeriodNDVI(
    afterStartDate,
    afterEndDate
  )

  const ndviChange = after.ndvi - before.ndvi

  let trend: SatelliteComparisonResult['trend']

  if (ndviChange > 0.01) {
    trend = 'Increase'
  } else if (ndviChange < -0.01) {
    trend = 'Decrease'
  } else {
    trend = 'No significant change'
  }

  return {
    beforeDate: before.date,
    afterDate: after.date,
    beforeNDVI: before.ndvi,
    afterNDVI: after.ndvi,
    ndviChange,
    trend
  }
}

