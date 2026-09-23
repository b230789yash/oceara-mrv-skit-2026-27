# Oceara MRV Data Dictionary

## 1. Purpose

This document describes the major data fields that may be used by the Oceara MRV platform.

The data dictionary is intended to improve consistency between the frontend, backend, database, AI/ML, and blockchain modules.

The fields should be verified against the actual implementation before being used in production.

## 2. Project Information

| Field | Description | Example | Data Type |
|---|---|---|---|
| `project_id` | Unique identifier of a project | `PROJECT-001` | String |
| `project_name` | Name of the blue carbon project | `Mangrove Restoration Project` | String |
| `ecosystem_type` | Type of ecosystem | `Mangrove` | String |
| `area_hectares` | Project area in hectares | `25` | Number |
| `status` | Current project status | `Pending` | String |
| `created_at` | Project creation timestamp | ISO timestamp | Date/Time |

## 3. Location Information

| Field | Description | Example | Data Type |
|---|---|---|---|
| `latitude` | Geographic latitude | `21.5` | Number |
| `longitude` | Geographic longitude | `88.8` | Number |
| `location_name` | Human-readable location | `West Bengal` | String |
| `country` | Country where the project is located | `India` | String |

## 4. MRV Information

| Field | Description | Example | Data Type |
|---|---|---|---|
| `mrv_status` | Current MRV processing status | `Not Started` | String |
| `monitoring_date` | Date of monitoring activity | `2026-09-19` | Date |
| `report_id` | Identifier of an MRV report | `REPORT-001` | String |
| `verification_status` | Verification state | `Pending` | String |
| `verified_by` | Identifier of the verifying user | `ADMIN-001` | String |

## 5. AI/ML Information

| Field | Description | Example | Data Type |
|---|---|---|---|
| `model_name` | Name of the model used | `Mangrove Classification Model` | String |
| `model_version` | Version of the model | `v1.0` | String |
| `ndvi_value` | Calculated vegetation index value | `0.65` | Number |
| `biomass_estimate` | Estimated biomass value | `100.5` | Number |
| `confidence_score` | Model confidence value, if available | `0.85` | Number |

## 6. Blockchain Information

| Field | Description | Example | Data Type |
|---|---|---|---|
| `transaction_hash` | Blockchain transaction reference | `0x123...` | String |
| `network_name` | Blockchain network name | `Polygon` | String |
| `contract_address` | Address of a deployed smart contract | `0xabc...` | String |
| `ipfs_hash` | Reference to content stored through IPFS | `QmExample...` | String |

## 7. Validation Rules

The following validation rules are recommended:

- Project names should not be empty.
- Project area should be greater than zero.
- Latitude should be between `-90` and `90`.
- Longitude should be between `-180` and `180`.
- Project identifiers should be unique.
- MRV records should be linked to a valid project.
- Verification records should identify the responsible verifier.
- Model outputs should include units where applicable.
- Blockchain transaction hashes should be validated before being stored.
- Sensitive information should not be stored in publicly accessible fields.

## 8. Data Quality Considerations

- Required fields should be clearly identified.
- Invalid geographic coordinates should be rejected.
- Dates should use a consistent format.
- Duplicate project records should be detected.
- AI-generated values should be distinguished from verified values.
- Sample data must not be presented as real-world verified data.

## 9. Future Improvements

Possible improvements include:

- Creating a formal database schema
- Adding automated validation
- Adding data versioning
- Creating database migration scripts
- Adding audit history
- Connecting the data dictionary with API documentation