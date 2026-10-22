# Week 1: AI and Remote Sensing Audit

**Owner:** Vineet  
**Project:** Oceara MRV

## 1. Satellite data acquisition
- [ ] Identify the Sentinel-2 collection currently used.
- [ ] Verify the date range, geographic filter, and cloud-cover threshold.
- [ ] Test whether actual Earth Engine imagery can be retrieved.
- [ ] Record the source and acquisition date of retrieved imagery.

## 2. Vegetation analysis
- [ ] Identify where NDVI is calculated.
- [ ] Identify where EVI is calculated.
- [ ] Identify how vegetation health and density are derived.
- [ ] Verify that calculations use actual satellite-derived values when available.

## 3. Fallback and simulated data
- [ ] Identify fallback imagery used when Earth Engine fails.
- [ ] Identify simulated NDVI/EVI and time-series values.
- [ ] Check whether simulated and real results are clearly distinguished.
- [ ] Identify any outputs that are presented without actual satellite validation.

## 4. Biomass and carbon estimation
- [ ] Review `lib/estimation.ts`.
- [ ] Identify the equations and reference coefficients used.
- [ ] Record required inputs, units, assumptions, and limitations.
- [ ] Confirm whether a trained biomass model exists.

## 5. Existing interface and integration
- [ ] Review `components/EarthEngineSatelliteViewer.tsx`.
- [ ] Review `components/MLAnalysisDisplay.tsx`.
- [ ] Identify which outputs are displayed and where they originate.
- [ ] Check whether change detection is implemented or only displayed as sample data.

## 6. Testing and documentation
- [ ] Run the existing project.
- [ ] Record successful tests and errors.
- [ ] List missing features and data requirements.
- [ ] Prepare a prioritised list of next steps.

## Week 1 completion criteria

- [ ] Audit completed.
- [ ] Existing functionality documented.
- [ ] Known limitations recorded.
- [ ] No existing functionality unintentionally changed.
- [ ] Week 2 tasks identified.

