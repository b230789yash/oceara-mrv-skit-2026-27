# 🌊 Oceara MRV
## Blockchain-Based Blue Carbon Registry & MRV System

**SKIT Final Year Project | Academic Session 2026–27**

Oceara MRV is a technology-driven platform designed to support the transparent, verifiable, and secure management of blue carbon projects through blockchain, remote sensing, artificial intelligence, and data analytics.

The platform focuses on improving the monitoring, reporting, and verification (MRV) of blue carbon ecosystems such as mangroves, seagrass meadows, and tidal wetlands.

---

## 🎓 Academic Information

| Field | Details |
|---|---|
| Institution | Swami Keshvanand Institute of Technology, Management & Gramothan |
| Department | Computer Science & Engineering — Artificial Intelligence |
| Academic Session | 2026–27 |
| Project Type | Final Year Project |
| Project Mentor | Mr. Sushant Singh |
| Project Domain | Blockchain, AI/ML, Remote Sensing, Data Engineering |

---

## 👥 Project Team

| Name | Role | Responsibilities |
|---|---|---|
| Yash Mathur | Blockchain & Web3 | Smart Contract Development & System Architecture |
| Vineet | AI / Computer Vision | Remote Sensing Pipelines & ML Biomass Models |
| Mohd. Nomaan | Data Science & Data Engineering | Data Pipeline Engineering & Analytics |
| Yuvika Halwai | UI/UX Design & Frontend Development | Frontend Web Dashboard & UI/UX Design |

---

## 🎯 Project Objectives

- Develop a digital registry for blue carbon projects.
- Enable transparent and traceable carbon project records.
- Integrate blockchain technology for data integrity.
- Use remote sensing data to monitor blue carbon ecosystems.
- Apply machine learning to estimate biomass and carbon storage.
- Provide a centralized dashboard for project monitoring.
- Support structured monitoring, reporting, and verification workflows.
- Improve accessibility to project data for relevant stakeholders.

---

## 🌱 What Is Blue Carbon?

Blue carbon refers to carbon captured and stored by coastal and marine ecosystems, including:

- Mangrove forests
- Seagrass meadows
- Tidal marshes
- Coastal wetlands

These ecosystems play an important role in climate regulation, biodiversity conservation, and coastal protection.

Oceara MRV aims to provide a digital infrastructure for monitoring and documenting the carbon-related activities of these ecosystems.

---

## 🏗️ Core System Components

### 1. Blockchain-Based Registry

- Secure project registration
- Tamper-evident records
- Transparent project history
- Smart contract integration
- Traceable project-related transactions

### 2. Remote Sensing & Satellite Analysis

- Satellite imagery integration
- Ecosystem monitoring
- Vegetation and land-cover analysis
- Geospatial data processing
- Monitoring of ecosystem changes

### 3. AI/ML-Based Carbon Estimation

- Biomass estimation
- Machine learning-based analysis
- Carbon-stock estimation
- Data-driven ecosystem assessment
- Model-based prediction workflows

### 4. Monitoring, Reporting & Verification

- Structured project data collection
- Monitoring records
- Verification workflows
- Project-level reporting
- Evidence-based documentation

### 5. Interactive Web Dashboard

- Project overview
- Data visualization
- Geospatial maps
- Analytics dashboards
- Project status tracking
- User-friendly interface

---

## 🧰 Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Three.js
- Recharts

### Backend & Database

- Node.js
- Supabase
- PostgreSQL
- Firebase

### Blockchain & Web3

- Solidity
- Smart Contracts
- MetaMask
- Web3 Integration

### AI/ML & Data Processing

- Python
- TensorFlow
- PyTorch
- Computer Vision
- Remote Sensing Pipelines

### Maps & Geospatial Tools

- Mapbox
- Google Maps
- Satellite Data Sources

### Development & Deployment

- Git
- GitHub
- Vercel
- Docker
- GitHub Actions

---

## 📁 Project Structure

```text
SKIT FINAL YEAR PROJECT/
│
├── app/                    # Application routes and pages
├── components/             # Reusable UI components
├── public/                 # Static assets
├── scripts/                # Utility and testing scripts
├── docs/                   # Project documentation
│   ├── DEVELOPMENT_WORKFLOW.md
│   ├── MRV_DATA_MODEL.md
│   ├── REMOTE_SENSING_PIPELINE.md
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── TEAM_RESPONSIBILITIES.md
│   └── UI_UX_AUDIT.md
│
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

> The structure may evolve as the project develops.

---

## 🚀 Getting Started

### Prerequisites

Ensure that the following tools are installed:

- Node.js
- npm
- Git
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/b230789yash/oceara-mrv-skit-2026-27.git
cd oceara-mrv-skit-2026-27
```

### 2. Install Dependencies

```bash
npm ci
```

If `npm ci` cannot be used because the lockfile is unavailable or outdated, use:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root.

Add the required environment variables based on the services used by your local setup.

> Never commit API keys, private keys, passwords, or other secrets to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local application at:

```text
http://localhost:3000
```

### 5. Create a Production Build

```bash
npm run build
```

### 6. Run the Production Server

```bash
npm run start
```

---

## 🌿 Git Workflow

Each team member should work on a separate feature branch.

### Create a New Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-name
```

### Save Your Changes

```bash
git add .
git commit -m "feat: describe your change"
```

### Push Your Branch

```bash
git push -u origin feature/your-name
```

### Development Guidelines

- Do not work directly on the `main` branch.
- Keep commits focused and descriptive.
- Pull the latest changes before starting new work.
- Do not commit environment files or secrets.
- Test your changes before creating a pull request.
- Review other team members' code when possible.
- Keep documentation updated.

---

## 📚 Project Documentation

Detailed project documentation is available in the `docs/` directory.

| Document | Description |
|---|---|
| `DEVELOPMENT_WORKFLOW.md` | Development, branching, and contribution workflow |
| `MRV_DATA_MODEL.md` | Proposed data entities and relationships |
| `REMOTE_SENSING_PIPELINE.md` | Remote sensing and biomass-estimation workflow |
| `SYSTEM_ARCHITECTURE.md` | High-level system architecture |
| `TEAM_RESPONSIBILITIES.md` | Team roles and ownership areas |
| `UI_UX_AUDIT.md` | UI/UX observations and improvement areas |

---

## 🔐 Security Guidelines

- Do not upload `.env` or `.env.local` files.
- Do not expose private blockchain keys.
- Do not commit service-account credentials.
- Use environment variables for sensitive configuration.
- Review third-party API permissions carefully.
- Validate user input and uploaded data.
- Keep authentication and authorization logic separate.
- Never assume that frontend-only restrictions provide security.

---

## 🧪 Testing & Validation

Before submitting a change, contributors should verify:

- The application starts successfully.
- The modified functionality works as expected.
- Existing functionality has not been broken.
- The production build completes successfully.
- No sensitive information has been exposed.
- Relevant documentation has been updated.

Available commands include:

```bash
npm run dev
npm run build
npm run start
npm run test:earth-engine
```

---

## 🗺️ Planned Development Areas

The project may evolve through the following stages:

1. Project architecture and requirements analysis
2. Data model and database design
3. Frontend dashboard development
4. Remote sensing pipeline integration
5. AI/ML biomass estimation
6. Blockchain registry integration
7. MRV workflow implementation
8. System testing and validation
9. Documentation and academic evaluation
10. Deployment and demonstration

---

## ⚠️ Project Status

This repository is being developed as an academic final-year project for the 2026–27 session.

Features, integrations, datasets, and technical implementations may change during development.

Any carbon estimates, model outputs, or project records generated by the system must be appropriately validated before being used for real-world decision-making.

---

## 📄 License

This project is developed for academic purposes.

Licensing and usage terms will be finalized by the project team.

---

## 👨‍🏫 Project Mentor

**Mr. Sushant Singh**  
Department of Computer Science & Engineering — Artificial Intelligence  
Swami Keshvanand Institute of Technology, Management & Gramothan

---

## 🌊 Project Name

**Oceara MRV — Blockchain-Based Blue Carbon Registry & MRV System**

<<<<<<< HEAD
**Academic Session:** 2026–27
=======
**Academic Session:** 2026–27
>>>>>>> origin/main
