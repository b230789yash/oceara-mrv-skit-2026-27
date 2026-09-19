'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Project as DBProject } from '@/lib/database/projects'
import { toNumericArea } from '@/lib/area'

// Legacy interface for backward compatibility (exported for EarthWithProjects etc.)
export interface Project {
  id: number | string
  name: string
  owner: string
  owner_email?: string
  location: string
  coordinates: { lat: number; lng: number }
  area: string
  creditsAvailable: number
  pricePerCredit: number
  verified: boolean
  status: 'Pending Review' | 'Under Verification' | 'Verified' | 'Active' | 'Rejected'
  impact: string
  image: string
  description: string
  submittedDate: string
  images: string[]
  satelliteImages?: string[]
  fieldData?: {
    trees: number
    species: string
    soilType: string
    waterSalinity: string
  }
  mlAnalysis?: {
    treeCount: number
    mangroveArea: number
    healthScore: number
    speciesDetected: string[]
    carbonCredits: number
    confidence: number
  }
  documents?: string[]
  /** True for built-in demo/sample projects; always shown and labeled in UI */
  isDemo?: boolean
}

// Convert database project to app format
function dbToApp(project: DBProject): Project {
  return {
    id: project.id,
    name: project.name,
    owner: project.owner,
    owner_email: project.owner_email,
    location: project.location,
    coordinates: project.coordinates,
    area: project.area,
    creditsAvailable: project.credits_available,
    pricePerCredit: project.price_per_credit,
    verified: project.verified,
    status: project.status,
    impact: project.impact || '',
    image: project.image || '🌴',
    description: project.description || '',
    submittedDate: project.submitted_date,
    images: project.images || [],
    satelliteImages: project.satellite_images,
    fieldData: project.field_data,
    mlAnalysis: project.ml_analysis,
    documents: project.documents || [],
  }
}

// Convert app format to database format (area sent as number for DB)
function appToDb(project: Omit<Project, 'id' | 'submittedDate'>): Omit<DBProject, 'id' | 'submitted_date' | 'created_at' | 'updated_at'> {
  return {
    name: project.name,
    owner: project.owner,
    owner_email: project.owner_email,
    location: project.location,
    coordinates: project.coordinates,
    area: toNumericArea(project.area) as unknown as string,
    credits_available: project.creditsAvailable,
    price_per_credit: project.pricePerCredit,
    verified: project.verified,
    status: project.status,
    impact: project.impact,
    image: project.image,
    description: project.description,
    images: project.images,
    satellite_images: project.satelliteImages,
    field_data: project.fieldData,
    ml_analysis: project.mlAnalysis,
    documents: project.documents,
  }
}

/** Build PATCH payload: only defined keys, in DB (snake_case) format; area as number */
function toDbPartial(updates: Partial<Project>): Record<string, unknown> {
  const r: Record<string, unknown> = {}
  if (updates.name !== undefined) r.name = updates.name
  if (updates.owner !== undefined) r.owner = updates.owner
  if (updates.owner_email !== undefined) r.owner_email = updates.owner_email
  if (updates.location !== undefined) r.location = updates.location
  if (updates.coordinates !== undefined) r.coordinates = updates.coordinates
  if (updates.area !== undefined) r.area = toNumericArea(updates.area)
  if (updates.creditsAvailable !== undefined) r.credits_available = updates.creditsAvailable
  if (updates.pricePerCredit !== undefined) r.price_per_credit = updates.pricePerCredit
  if (updates.verified !== undefined) r.verified = updates.verified
  if (updates.status !== undefined) r.status = updates.status
  if (updates.impact !== undefined) r.impact = updates.impact
  if (updates.image !== undefined) r.image = updates.image
  if (updates.description !== undefined) r.description = updates.description
  if (updates.images !== undefined) r.images = updates.images
  if (updates.satelliteImages !== undefined) r.satellite_images = updates.satelliteImages
  if (updates.fieldData !== undefined) r.field_data = updates.fieldData
  if (updates.mlAnalysis !== undefined) r.ml_analysis = updates.mlAnalysis
  if (updates.documents !== undefined) r.documents = updates.documents
  return r
}

interface DataContextType {
  projects: Project[]
  isLoaded: boolean
  addProject: (project: Omit<Project, 'id' | 'submittedDate'>) => Promise<Project>
  updateProject: (id: number | string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: number | string) => Promise<void>
  getProjectsByOwner: (owner: string) => Project[]
  getPendingProjects: () => Project[]
  getVerifiedProjects: () => Project[]
  useDatabase: boolean
  dbError: string | null
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const STORAGE_KEY = 'oceara_projects_data'

// Initial mock data
const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Sundarbans Mangrove Conservation',
    owner: 'Demo Landowner',
    location: 'West Bengal, India',
    coordinates: { lat: 21.9497, lng: 88.8837 },
    area: '250 hectares',
    creditsAvailable: 1250,
    pricePerCredit: 25,
    verified: true,
    status: 'Active',
    impact: '3,125 tons CO₂/year',
    image: '🌴',
    description: 'Largest mangrove forest restoration project in India',
    submittedDate: '2024-09-15',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 12500,
      species: 'Rhizophora mucronata',
      soilType: 'Muddy clay',
      waterSalinity: '25 ppt'
    },
    mlAnalysis: {
      treeCount: 12450,
      mangroveArea: 250,
      healthScore: 87,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 1250,
      confidence: 92
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 2,
    name: 'Kerala Backwater Restoration',
    owner: 'Demo Landowner',
    location: 'Kerala, India',
    coordinates: { lat: 9.9312, lng: 76.2673 },
    area: '180 hectares',
    creditsAvailable: 890,
    pricePerCredit: 22,
    verified: true,
    status: 'Active',
    impact: '2,225 tons CO₂/year',
    image: '🌊',
    description: 'Coastal ecosystem restoration in Kerala backwaters',
    submittedDate: '2024-10-01',
    images: ['📷', '📷'],
    fieldData: {
      trees: 8900,
      species: 'Avicennia marina',
      soilType: 'Sandy loam',
      waterSalinity: '30 ppt'
    },
    mlAnalysis: {
      treeCount: 8880,
      mangroveArea: 180,
      healthScore: 91,
      speciesDetected: ['Avicennia marina', 'Bruguiera gymnorrhiza'],
      carbonCredits: 890,
      confidence: 95
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 3,
    name: 'Andaman Islands Blue Carbon',
    owner: 'Demo User 2',
    location: 'Andaman & Nicobar, India',
    coordinates: { lat: 11.7401, lng: 92.6586 },
    area: '320 hectares',
    creditsAvailable: 1600,
    pricePerCredit: 28,
    verified: true,
    status: 'Active',
    impact: '4,480 tons CO₂/year',
    image: '🏝️',
    description: 'Pristine mangrove conservation in Andaman Islands',
    submittedDate: '2024-09-20',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 16000,
      species: 'Rhizophora mucronata',
      soilType: 'Coral sand',
      waterSalinity: '28 ppt'
    },
    mlAnalysis: {
      treeCount: 15980,
      mangroveArea: 320,
      healthScore: 94,
      speciesDetected: ['Rhizophora mucronata', 'Bruguiera gymnorrhiza', 'Sonneratia apetala'],
      carbonCredits: 1600,
      confidence: 96
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 4,
    name: 'Gujarat Coastal Protection',
    owner: 'Demo User 3',
    location: 'Gujarat, India',
    coordinates: { lat: 21.5222, lng: 70.4579 },
    area: '200 hectares',
    creditsAvailable: 1000,
    pricePerCredit: 24,
    verified: true,
    status: 'Active',
    impact: '2,500 tons CO₂/year',
    image: '🌅',
    description: 'Mangrove plantation for coastal protection',
    submittedDate: '2024-10-05',
    images: ['📷', '📷'],
    fieldData: {
      trees: 10000,
      species: 'Avicennia marina',
      soilType: 'Clay',
      waterSalinity: '32 ppt'
    },
    mlAnalysis: {
      treeCount: 9950,
      mangroveArea: 200,
      healthScore: 88,
      speciesDetected: ['Avicennia marina'],
      carbonCredits: 1000,
      confidence: 93
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 5,
    name: 'Mumbai Coastal Mangrove',
    owner: 'Rajesh Kumar',
    location: 'Mumbai, Maharashtra',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    area: '150 hectares',
    creditsAvailable: 750,
    pricePerCredit: 26,
    verified: false,
    status: 'Pending Review',
    impact: '1,875 tons CO₂/year',
    image: '🏙️',
    description: 'Urban mangrove conservation in Mumbai metropolitan area',
    submittedDate: '2024-10-10',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=17&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=18&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 7500,
      species: 'Rhizophora mucronata',
      soilType: 'Muddy clay',
      waterSalinity: '25 ppt'
    },
    mlAnalysis: {
      treeCount: 7450,
      mangroveArea: 150,
      healthScore: 87,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 750,
      confidence: 92
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 6,
    name: 'Tamil Nadu Estuary Project',
    owner: 'Priya Sharma',
    location: 'Tamil Nadu, India',
    coordinates: { lat: 11.1271, lng: 78.6569 },
    area: '220 hectares',
    creditsAvailable: 1100,
    pricePerCredit: 23,
    verified: false,
    status: 'Under Verification',
    impact: '2,750 tons CO₂/year',
    image: '🌺',
    description: 'Estuary mangrove restoration with community involvement',
    submittedDate: '2024-10-08',
    images: ['📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=11.1271,78.6569&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=11.1271,78.6569&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 11000,
      species: 'Avicennia marina',
      soilType: 'Sandy loam',
      waterSalinity: '30 ppt'
    },
    mlAnalysis: {
      treeCount: 10980,
      mangroveArea: 220,
      healthScore: 91,
      speciesDetected: ['Avicennia marina', 'Bruguiera gymnorrhiza'],
      carbonCredits: 1100,
      confidence: 95
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 7,
    name: 'Odisha Deltaic Mangrove',
    owner: 'Anil Patel',
    location: 'Odisha, India',
    coordinates: { lat: 20.2961, lng: 85.8245 },
    area: '190 hectares',
    creditsAvailable: 950,
    pricePerCredit: 24,
    verified: false,
    status: 'Pending Review',
    impact: '2,375 tons CO₂/year',
    image: '🌊',
    description: 'Delta region mangrove conservation and fish habitat',
    submittedDate: '2024-10-12',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=20.2961,85.8245&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=20.2961,85.8245&zoom=17&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=20.2961,85.8245&zoom=18&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 9500,
      species: 'Bruguiera gymnorrhiza',
      soilType: 'Silty clay',
      waterSalinity: '28 ppt'
    },
    mlAnalysis: {
      treeCount: 9470,
      mangroveArea: 190,
      healthScore: 89,
      speciesDetected: ['Bruguiera gymnorrhiza', 'Rhizophora mucronata'],
      carbonCredits: 950,
      confidence: 94
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 8,
    name: 'Goa Coastal Restoration',
    owner: 'Maria Fernandes',
    location: 'Goa, India',
    coordinates: { lat: 15.2993, lng: 74.1240 },
    area: '95 hectares',
    creditsAvailable: 475,
    pricePerCredit: 27,
    verified: true,
    status: 'Active',
    impact: '1,188 tons CO₂/year',
    image: '🏖️',
    description: 'Tourism-friendly mangrove conservation project',
    submittedDate: '2024-09-25',
    images: ['📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=15.2993,74.1240&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=15.2993,74.1240&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 4750,
      species: 'Sonneratia apetala',
      soilType: 'Sandy',
      waterSalinity: '26 ppt'
    },
    mlAnalysis: {
      treeCount: 4730,
      mangroveArea: 95,
      healthScore: 86,
      speciesDetected: ['Sonneratia apetala', 'Avicennia marina'],
      carbonCredits: 475,
      confidence: 91
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance', 'Tourism Board Approval']
  },
  {
    id: 9,
    name: 'Karnataka Coastal Belt',
    owner: 'Suresh Reddy',
    location: 'Karnataka, India',
    coordinates: { lat: 14.8520, lng: 74.1350 },
    area: '135 hectares',
    creditsAvailable: 675,
    pricePerCredit: 25,
    verified: false,
    status: 'Under Verification',
    impact: '1,688 tons CO₂/year',
    image: '🌴',
    description: 'Mangrove reforestation along Karnataka coast',
    submittedDate: '2024-10-09',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=14.8520,74.1350&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=14.8520,74.1350&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 6750,
      species: 'Rhizophora mucronata',
      soilType: 'Clay loam',
      waterSalinity: '27 ppt'
    },
    mlAnalysis: {
      treeCount: 6720,
      mangroveArea: 135,
      healthScore: 88,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 675,
      confidence: 93
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 10,
    name: 'Lakshadweep Marine Sanctuary',
    owner: 'Ahmed Ali',
    location: 'Lakshadweep, India',
    coordinates: { lat: 10.5667, lng: 72.6417 },
    area: '275 hectares',
    creditsAvailable: 1375,
    pricePerCredit: 30,
    verified: true,
    status: 'Active',
    impact: '3,438 tons CO₂/year',
    image: '🏝️',
    description: 'Island mangrove ecosystem with coral reef protection',
    submittedDate: '2024-09-18',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=10.5667,72.6417&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=10.5667,72.6417&zoom=17&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=10.5667,72.6417&zoom=18&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 13750,
      species: 'Rhizophora mucronata',
      soilType: 'Coral sand',
      waterSalinity: '32 ppt'
    },
    mlAnalysis: {
      treeCount: 13700,
      mangroveArea: 275,
      healthScore: 95,
      speciesDetected: ['Rhizophora mucronata', 'Bruguiera gymnorrhiza', 'Sonneratia apetala'],
      carbonCredits: 1375,
      confidence: 97
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Clearance', 'Marine Board Approval']
  },
  {
    id: 11,
    name: 'Pichavaram Mangrove Forest',
    owner: 'Eco Warriors Foundation',
    location: 'Tamil Nadu, India',
    coordinates: { lat: 11.4274, lng: 79.7722 },
    area: '280 hectares',
    creditsAvailable: 1420,
    pricePerCredit: 24,
    verified: true,
    status: 'Active',
    impact: '3,550 tons CO₂/year',
    image: '🌿',
    description: 'One of the largest mangrove forests in India with rich biodiversity',
    submittedDate: '2024-09-28',
    images: ['📷', '📷', '📷', '📷'],
    fieldData: {
      trees: 14200,
      species: 'Avicennia marina',
      soilType: 'Estuarine mud',
      waterSalinity: '26 ppt'
    },
    mlAnalysis: {
      treeCount: 14180,
      mangroveArea: 280,
      healthScore: 90,
      speciesDetected: ['Avicennia marina', 'Rhizophora apiculata', 'Bruguiera cylindrica'],
      carbonCredits: 1420,
      confidence: 94
    },
    documents: ['Forest Department Certificate', 'Survey Report', 'Environmental Clearance']
  },
  {
    id: 12,
    name: 'Bhitarkanika National Park Extension',
    owner: 'Green Earth Society',
    location: 'Odisha, India',
    coordinates: { lat: 20.7186, lng: 87.0333 },
    area: '310 hectares',
    creditsAvailable: 1580,
    pricePerCredit: 26,
    verified: true,
    status: 'Active',
    impact: '4,100 tons CO₂/year',
    image: '🐊',
    description: 'Extension of Bhitarkanika wetlands with rich mangrove diversity',
    submittedDate: '2024-10-02',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 15800,
      species: 'Heritiera fomes',
      soilType: 'Deltaic alluvium',
      waterSalinity: '22 ppt'
    },
    mlAnalysis: {
      treeCount: 15750,
      mangroveArea: 310,
      healthScore: 93,
      speciesDetected: ['Heritiera fomes', 'Excoecaria agallocha', 'Ceriops decandra'],
      carbonCredits: 1580,
      confidence: 97
    },
    documents: ['National Park Permit', 'Wildlife Clearance', 'Survey Report']
  },
  {
    id: 13,
    name: 'Coringa Wildlife Sanctuary Buffer',
    owner: 'Coastal Protection Trust',
    location: 'Andhra Pradesh, India',
    coordinates: { lat: 16.7500, lng: 82.2333 },
    area: '195 hectares',
    creditsAvailable: 990,
    pricePerCredit: 23,
    verified: true,
    status: 'Active',
    impact: '2,480 tons CO₂/year',
    image: '🦜',
    description: 'Buffer zone restoration supporting wildlife sanctuary',
    submittedDate: '2024-09-25',
    images: ['📷', '📷'],
    fieldData: {
      trees: 9900,
      species: 'Avicennia officinalis',
      soilType: 'Muddy',
      waterSalinity: '24 ppt'
    },
    mlAnalysis: {
      treeCount: 9880,
      mangroveArea: 195,
      healthScore: 88,
      speciesDetected: ['Avicennia officinalis', 'Sonneratia apetala'],
      carbonCredits: 990,
      confidence: 91
    },
    documents: ['Wildlife Sanctuary NOC', 'Survey Report']
  },
  {
    id: 14,
    name: 'Konkan Coast Restoration',
    owner: 'Blue Planet Initiative',
    location: 'Maharashtra, India',
    coordinates: { lat: 17.9689, lng: 73.0125 },
    area: '165 hectares',
    creditsAvailable: 840,
    pricePerCredit: 25,
    verified: true,
    status: 'Active',
    impact: '2,100 tons CO₂/year',
    image: '⛵',
    description: 'Coastal protection and mangrove restoration along Konkan coast',
    submittedDate: '2024-10-05',
    images: ['📷', '📷', '📷'],
    fieldData: {
      trees: 8400,
      species: 'Rhizophora mucronata',
      soilType: 'Sandy clay',
      waterSalinity: '29 ppt'
    },
    mlAnalysis: {
      treeCount: 8390,
      mangroveArea: 165,
      healthScore: 89,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 840,
      confidence: 93
    },
    documents: ['Coastal Regulation Zone Clearance', 'Survey Report']
  },
  {
    id: 15,
    name: 'Chilika Lake Mangrove Buffer',
    owner: 'Wetlands Forever',
    location: 'Odisha, India',
    coordinates: { lat: 19.7167, lng: 85.3167 },
    area: '220 hectares',
    creditsAvailable: 1120,
    pricePerCredit: 24,
    verified: true,
    status: 'Active',
    impact: '2,800 tons CO₂/year',
    image: '🦩',
    description: 'Protecting Asia\'s largest brackish water lagoon ecosystem',
    submittedDate: '2024-09-30',
    images: ['📷', '📷', '📷', '📷'],
    fieldData: {
      trees: 11200,
      species: 'Excoecaria agallocha',
      soilType: 'Lagoon sediment',
      waterSalinity: '18 ppt'
    },
    mlAnalysis: {
      treeCount: 11180,
      mangroveArea: 220,
      healthScore: 92,
      speciesDetected: ['Excoecaria agallocha', 'Avicennia alba', 'Acanthus ilicifolius'],
      carbonCredits: 1120,
      confidence: 95
    },
    documents: ['Ramsar Site NOC', 'Environmental Clearance', 'Survey Report']
  },
  {
    id: 16,
    name: 'Andaman Islands Coastal Restoration',
    owner: 'Island Conservation Society',
    location: 'Andaman & Nicobar Islands, India',
    coordinates: { lat: 11.7401, lng: 92.6586 },
    area: '195 hectares',
    creditsAvailable: 990,
    pricePerCredit: 28,
    verified: false,
    status: 'Pending Review',
    impact: '2,475 tons CO₂/year',
    image: '🏝️',
    description: 'Island mangrove restoration with coral reef protection',
    submittedDate: '2024-10-10',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=11.7401,92.6586&zoom=16&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 9900,
      species: 'Rhizophora apiculata',
      soilType: 'Volcanic sand',
      waterSalinity: '33 ppt'
    },
    mlAnalysis: {
      treeCount: 9850,
      mangroveArea: 195,
      healthScore: 91,
      speciesDetected: ['Rhizophora apiculata', 'Bruguiera gymnorrhiza'],
      carbonCredits: 990,
      confidence: 94
    },
    documents: ['Land Deed', 'Survey Report', 'Environmental Impact Assessment']
  },
  {
    id: 17,
    name: 'Ratnagiri Coastal Belt',
    owner: 'Maharashtra Coastal Trust',
    location: 'Maharashtra, India',
    coordinates: { lat: 16.9902, lng: 73.3120 },
    area: '145 hectares',
    creditsAvailable: 730,
    pricePerCredit: 24,
    verified: false,
    status: 'Under Verification',
    impact: '1,825 tons CO₂/year',
    image: '🌊',
    description: 'Coastal protection project along Konkan coast',
    submittedDate: '2024-10-09',
    images: ['📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=16.9902,73.3120&zoom=16&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 7300,
      species: 'Avicennia marina',
      soilType: 'Sandy clay',
      waterSalinity: '27 ppt'
    },
    mlAnalysis: {
      treeCount: 7280,
      mangroveArea: 145,
      healthScore: 87,
      speciesDetected: ['Avicennia marina', 'Sonneratia apetala'],
      carbonCredits: 730,
      confidence: 90
    },
    documents: ['Land Deed', 'Survey Report']
  },
  {
    id: 18,
    name: 'Cauvery Delta Mangrove Project',
    owner: 'Tamil Nadu Green Initiative',
    location: 'Tamil Nadu, India',
    coordinates: { lat: 10.7672, lng: 79.8449 },
    area: '215 hectares',
    creditsAvailable: 1080,
    pricePerCredit: 25,
    verified: false,
    status: 'Pending Review',
    impact: '2,700 tons CO₂/year',
    image: '🌾',
    description: 'Delta restoration with agricultural integration',
    submittedDate: '2024-10-08',
    images: ['📷', '📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=10.7672,79.8449&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=10.7672,79.8449&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 10800,
      species: 'Rhizophora mucronata',
      soilType: 'Deltaic alluvium',
      waterSalinity: '21 ppt'
    },
    mlAnalysis: {
      treeCount: 10750,
      mangroveArea: 215,
      healthScore: 89,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia officinalis'],
      carbonCredits: 1080,
      confidence: 93
    },
    documents: ['Land Deed', 'Survey Report', 'Agricultural Department NOC']
  },
  {
    id: 19,
    name: 'Hooghly Estuary Conservation',
    owner: 'Bengal Wetlands Foundation',
    location: 'West Bengal, India',
    coordinates: { lat: 22.3511, lng: 88.2250 },
    area: '185 hectares',
    creditsAvailable: 935,
    pricePerCredit: 26,
    verified: false,
    status: 'Pending Review',
    impact: '2,338 tons CO₂/year',
    image: '🏭',
    description: 'Urban mangrove restoration near Kolkata',
    submittedDate: '2024-10-07',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=22.3511,88.2250&zoom=16&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 9350,
      species: 'Avicennia alba',
      soilType: 'Estuarine silt',
      waterSalinity: '23 ppt'
    },
    mlAnalysis: {
      treeCount: 9320,
      mangroveArea: 185,
      healthScore: 85,
      speciesDetected: ['Avicennia alba', 'Sonneratia caseolaris'],
      carbonCredits: 935,
      confidence: 89
    },
    documents: ['Land Deed', 'Survey Report', 'Urban Development NOC']
  },
  {
    id: 20,
    name: 'Pulicat Lake Northern Extension',
    owner: 'Andhra-Tamil Border Trust',
    location: 'Andhra Pradesh-Tamil Nadu Border',
    coordinates: { lat: 13.6667, lng: 80.3167 },
    area: '255 hectares',
    creditsAvailable: 1280,
    pricePerCredit: 27,
    verified: false,
    status: 'Under Verification',
    impact: '3,200 tons CO₂/year',
    image: '🦅',
    description: 'Lagoon ecosystem with bird sanctuary integration',
    submittedDate: '2024-10-06',
    images: ['📷', '📷', '📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=13.6667,80.3167&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=13.6667,80.3167&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 12800,
      species: 'Bruguiera gymnorrhiza',
      soilType: 'Lagoon sediment',
      waterSalinity: '20 ppt'
    },
    mlAnalysis: {
      treeCount: 12750,
      mangroveArea: 255,
      healthScore: 94,
      speciesDetected: ['Bruguiera gymnorrhiza', 'Avicennia marina', 'Rhizophora mucronata'],
      carbonCredits: 1280,
      confidence: 96
    },
    documents: ['Land Deed', 'Survey Report', 'Bird Sanctuary NOC', 'Environmental Clearance']
  },
  {
    id: 21,
    name: 'Machilipatnam Coastal Protection',
    owner: 'Coastal Guardians NGO',
    location: 'Andhra Pradesh, India',
    coordinates: { lat: 16.1875, lng: 81.1389 },
    area: '168 hectares',
    creditsAvailable: 845,
    pricePerCredit: 24,
    verified: false,
    status: 'Pending Review',
    impact: '2,113 tons CO₂/year',
    image: '🛥️',
    description: 'Port city mangrove restoration with coastal erosion prevention',
    submittedDate: '2024-10-11',
    images: ['📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=16.1875,81.1389&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=16.1875,81.1389&zoom=17&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 8450,
      species: 'Rhizophora mucronata',
      soilType: 'Coastal sediment',
      waterSalinity: '28 ppt'
    },
    mlAnalysis: {
      treeCount: 8420,
      mangroveArea: 168,
      healthScore: 86,
      speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
      carbonCredits: 845,
      confidence: 92
    },
    documents: ['Land Deed', 'Survey Report', 'Port Authority NOC']
  },
  {
    id: 22,
    name: 'Diu Island Marine Ecosystem',
    owner: 'Island Eco Trust',
    location: 'Diu, India',
    coordinates: { lat: 20.7144, lng: 70.9871 },
    area: '125 hectares',
    creditsAvailable: 630,
    pricePerCredit: 26,
    verified: false,
    status: 'Pending Review',
    impact: '1,575 tons CO₂/year',
    image: '🏖️',
    description: 'Small island mangrove conservation with tourism integration',
    submittedDate: '2024-10-11',
    images: ['📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=20.7144,70.9871&zoom=16&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 6300,
      species: 'Avicennia marina',
      soilType: 'Sandy',
      waterSalinity: '31 ppt'
    },
    mlAnalysis: {
      treeCount: 6280,
      mangroveArea: 125,
      healthScore: 84,
      speciesDetected: ['Avicennia marina', 'Rhizophora apiculata'],
      carbonCredits: 630,
      confidence: 88
    },
    documents: ['Land Deed', 'Survey Report', 'Tourism Board Approval']
  },
  {
    id: 23,
    name: 'Mahanadi Delta Extension',
    owner: 'Delta Conservation Forum',
    location: 'Odisha, India',
    coordinates: { lat: 20.3000, lng: 86.4000 },
    area: '285 hectares',
    creditsAvailable: 1430,
    pricePerCredit: 25,
    verified: false,
    status: 'Under Verification',
    impact: '3,575 tons CO₂/year',
    image: '🌊',
    description: 'Large delta mangrove expansion with flood protection benefits',
    submittedDate: '2024-10-10',
    images: ['📷', '📷', '📷', '📷', '📷'],
    satelliteImages: [
      'https://maps.googleapis.com/maps/api/staticmap?center=20.3000,86.4000&zoom=16&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=20.3000,86.4000&zoom=17&size=800x600&maptype=satellite&key=',
      'https://maps.googleapis.com/maps/api/staticmap?center=20.3000,86.4000&zoom=18&size=800x600&maptype=satellite&key='
    ],
    fieldData: {
      trees: 14300,
      species: 'Sonneratia apetala',
      soilType: 'Deltaic alluvium',
      waterSalinity: '19 ppt'
    },
    mlAnalysis: {
      treeCount: 14250,
      mangroveArea: 285,
      healthScore: 91,
      speciesDetected: ['Sonneratia apetala', 'Avicennia officinalis', 'Excoecaria agallocha'],
      carbonCredits: 1430,
      confidence: 95
    },
    documents: ['Land Deed', 'Survey Report', 'Flood Control Department NOC', 'Environmental Clearance']
  }
]

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [useDatabase, setUseDatabase] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  // Load data via API (server-side Supabase) so the browser never gets 401 from Supabase. Fall back to local/demo data on error.
  useEffect(() => {
    const loadData = async () => {
      const applyFallback = (stored: string | null) => {
        setUseDatabase(false)
        const withIdAndDemo = (p: any) => ({ ...p, id: String(p.id), isDemo: true })
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setProjects(Array.isArray(parsed) ? parsed.map(withIdAndDemo) : initialProjects.map(withIdAndDemo))
          } catch {
            setProjects(initialProjects.map(withIdAndDemo))
          }
        } else {
          setProjects(initialProjects.map(withIdAndDemo))
        }
      }

      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          const list = data.projects || []
          const fromDb = list.map((p: DBProject) => ({ ...dbToApp(p), isDemo: false }))
          const demo = initialProjects.map((p, i) => ({ ...p, id: `demo-${i + 1}`, isDemo: true }))
          setUseDatabase(true)
          setProjects([...fromDb, ...demo])
          setDbError(null)
        } else {
          setDbError(res.status === 401 || res.status === 403 ? 'Registry in offline mode. Sign in for full sync.' : `Registry unavailable (${res.status})`)
          applyFallback(typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
        }
      } catch (err: any) {
        setDbError(err?.message || 'Load failed')
        applyFallback(typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
      }
      setIsLoaded(true)
    }

    loadData()
  }, [])

  // Save to localStorage as backup (if not using database)
  useEffect(() => {
    if (isLoaded && !useDatabase) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    }
  }, [projects, isLoaded, useDatabase])

  const addProject = async (project: Omit<Project, 'id' | 'submittedDate'>) => {
    if (useDatabase) {
      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appToDb(project))
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        const data = await res.json()
        const created = data.project
        if (!created || created.id == null) {
          throw new Error('Invalid response: project not returned')
        }
        const newProject = { ...dbToApp(created), isDemo: false }
        setProjects(prev => [...prev, newProject])
        return newProject
      } catch (error: any) {
        setDbError(error.message)
        throw error
      }
    } else {
      // LocalStorage fallback
      const maxId = Math.max(...projects.map(p => {
        const numId = typeof p.id === 'number' ? p.id : parseInt(String(p.id), 10)
        return isNaN(numId) ? 0 : numId
      }), 0)
      const newProject: Project = {
        ...project,
        id: String(maxId + 1),
        submittedDate: new Date().toISOString().split('T')[0]
      }
      setProjects(prev => [...prev, newProject])
      return newProject
    }
  }

  const updateProject = async (id: number | string, updates: Partial<Project>) => {
    if (useDatabase) {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toDbPartial(updates))
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `HTTP ${res.status}`)
        }
        const data = await res.json()
        const updatedProject = dbToApp(data.project)
        setProjects(prev =>
          prev.map(project =>
            String(project.id) === String(id) ? updatedProject : project
          )
        )
      } catch (error: any) {
        setDbError(error.message)
        throw error
      }
    } else {
      // LocalStorage fallback
      setProjects(prev =>
        prev.map(project =>
          String(project.id) === String(id) ? { ...project, ...updates } : project
        )
      )
    }
  }

  const deleteProject = async (id: number | string) => {
    if (useDatabase) {
      try {
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setProjects(prev => prev.filter(project => String(project.id) !== String(id)))
      } catch (error: any) {
        setDbError(error.message)
        throw error
      }
    } else {
      // LocalStorage fallback
      setProjects(prev => prev.filter(project => String(project.id) !== String(id)))
    }
  }

  const getProjectsByOwner = (owner: string) => {
    return projects.filter(project => project.owner === owner)
  }

  const getPendingProjects = () => {
    return projects.filter(project =>
      project.status === 'Pending Review' || project.status === 'Under Verification'
    )
  }

  const getVerifiedProjects = () => {
    return projects.filter(project =>
      project.verified && (project.status === 'Verified' || project.status === 'Active')
    )
  }

  return (
    <DataContext.Provider
      value={{
        projects,
        isLoaded,
        addProject,
        updateProject,
        deleteProject,
        getProjectsByOwner,
        getPendingProjects,
        getVerifiedProjects,
        useDatabase,
        dbError
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

