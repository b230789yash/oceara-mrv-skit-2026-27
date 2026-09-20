# Project Integration and Module Coordination

## Project Information

- **Project:** Oceara MRV
- **Project Type:** Blockchain-Based Blue Carbon Registry and MRV System
- **Academic Session:** 2026–27
- **Institution:** SKIT Jaipur
- **Project Lead:** Yash Mathur

## 1. Purpose

This document describes how the major modules of Oceara MRV are expected to work together.

The purpose is to maintain clear responsibilities and consistent communication between the project modules.

## 2. Major System Modules

The project consists of the following major modules:

1. Frontend web application
2. Database and data-management layer
3. AI/ML and remote-sensing module
4. MRV reporting and verification module
5. Blockchain registry module
6. Authentication and access-control system

## 3. Module Responsibilities

### Frontend

The frontend allows users to view projects, access dashboards, review project information, and interact with MRV-related features.

### Database Layer

The database layer manages project information, geographic details, user records, monitoring data, analysis results, and verification records.

### AI/ML and Remote Sensing

This module may support satellite-image analysis, vegetation monitoring, mangrove identification, vegetation-index calculations, and biomass estimation.

AI-generated results must be validated before being treated as verified information.

### MRV Module

The MRV module organizes monitoring activities, reports, supporting evidence, verification records, project status, and review history.

### Blockchain Module

The blockchain module may be used to record important registry events, maintain tamper-evident references, and store transaction references.

Sensitive information should not be stored directly on a public blockchain.

## 4. Proposed Data Flow

1. A user registers or selects a blue carbon project.
2. Project information is stored in the database.
3. Geographic and satellite data are collected where available.
4. The AI/ML module processes the relevant data.
5. Analysis results are associated with the relevant project.
6. MRV records and supporting evidence are prepared.
7. Authorized users review and verify the information.
8. Important registry events may be recorded on the blockchain.
9. The frontend displays the project status and relevant results.

## 5. Team Responsibilities

| Team Member | Area | Responsibility |
|---|---|---|
| Yash Mathur | Blockchain and Architecture | System design, integration, and blockchain planning |
| Vineet | AI and Computer Vision | Remote-sensing analysis and AI/ML research |
| Mohd. Nomaan | Data Engineering | Data structures, validation, and analytics |
| Yuvika Halwai | UI/UX and Frontend | Dashboard interfaces and user experience |

## 6. Integration Guidelines

- Each module should have a clearly defined responsibility.
- Data formats should be agreed upon before integration.
- Database fields should remain consistent across modules.
- AI-generated results should include relevant metadata.
- Authentication and authorization should protect sensitive operations.
- Blockchain transactions should be independently verifiable.
- New features should be tested before integration.
- Existing functionality should not be changed without review.

## 7. Implementation Status

Each feature should be classified as:

- Implemented
- Partially implemented
- Experimental
- Planned

This distinction prevents planned functionality from being presented as completed functionality.

## 8. Future Integration Tasks

- Finalize API contracts between modules.
- Validate database relationships.
- Connect AI outputs to project records.
- Integrate verified records with blockchain transactions.
- Add automated testing.
- Improve system-wide error handling.
- Prepare final deployment documentation.

## 9. Conclusion

This integration plan provides a common understanding of how the different technical components of Oceara MRV can work together.

It will be updated as the project evolves.
