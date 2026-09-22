# AI/ML and Remote Sensing Module

## 1. Purpose

The AI/ML module of Oceara MRV is intended to support the analysis and monitoring of blue carbon ecosystems, including mangroves and other coastal ecosystems.

The module may use remote sensing data, vegetation indices, computer vision, and machine learning techniques to support ecosystem assessment.

## 2. Role of Remote Sensing

Remote sensing allows environmental information to be collected using satellite or aerial imagery.

In Oceara MRV, remote sensing can support:

- Mangrove identification
- Vegetation monitoring
- Ecosystem change detection
- Project-area assessment
- Long-term environmental monitoring

## 3. Satellite Imagery

Satellite imagery can provide information about vegetation and land cover.

Potential data sources include:

- Sentinel-2 imagery
- Other publicly available satellite datasets
- Drone or field-collected imagery, where available

The availability and quality of imagery depend on location, cloud cover, resolution, and acquisition date.

## 4. NDVI

The Normalized Difference Vegetation Index, or NDVI, is a vegetation index calculated using the near-infrared and red spectral bands.

The formula is:

NDVI = (NIR - Red) / (NIR + Red)

NDVI values can help indicate vegetation characteristics.

However, NDVI alone cannot provide a complete or reliable estimate of carbon storage.

## 5. Biomass Estimation

Biomass estimation attempts to estimate the amount of biological material present in an ecosystem.

Mangrove biomass estimation may require:

- Tree height
- Trunk diameter
- Species information
- Vegetation characteristics
- Field measurements
- Appropriate allometric equations
- Suitable remote sensing information

The selection of a model depends on the ecosystem, available data, and validation requirements.

## 6. Proposed AI/ML Workflow

A possible workflow is:

1. Collect satellite or field data.
2. Preprocess the collected data.
3. Identify relevant vegetation or mangrove areas.
4. Calculate vegetation indices where appropriate.
5. Extract relevant features.
6. Apply an appropriate machine learning model.
7. Compare model outputs with ground-truth data.
8. Generate results for further MRV analysis.

## 7. Current Status

This document describes the proposed role of AI/ML and remote sensing in the project.

Every model, dataset, and output should be clearly marked as implemented, experimental, or planned.

## 8. Limitations

- Cloud cover can affect satellite imagery.
- Satellite resolution may limit detailed analysis.
- NDVI does not directly measure carbon storage.
- Biomass estimates require appropriate models and validation.
- Ground-truth data may be limited.
- AI outputs should not be treated as verified carbon estimates without proper validation.

## 9. Future Improvements

Possible future improvements include:

- Integrating real satellite imagery
- Developing a mangrove classification model
- Adding biomass estimation models
- Comparing predictions with field measurements
- Automating model evaluation
- Integrating validated outputs into the MRV workflow