/**
 * Generate MRV report as PDF (client-side). Includes project metadata, carbon estimate, health, confidence, ref ID.
 */

import { jsPDF } from 'jspdf'

export interface ProjectForReport {
  id: number | string
  name: string
  location: string
  area: string
  coordinates?: { lat: number; lng: number }
  status: string
  verified: boolean
  impact?: string
  creditsAvailable?: number
  submittedDate?: string
  mlAnalysis?: {
    healthScore?: number
    confidence?: number
    carbonCredits?: number
    speciesDetected?: string[]
  }
}

export function generateMrvReportPdf(project: ProjectForReport, immutableRefId?: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const refId = immutableRefId || `MRV-${Date.now()}-${String(project.id).slice(0, 8)}`
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

  let y = 20
  const line = 7

  doc.setFontSize(18)
  doc.text('Carbon Estimation Report (Pre-Certification)', 20, y)
  y += line + 4

  doc.setFontSize(10)
  doc.text(`Reference ID: ${refId}`, 20, y)
  y += line
  doc.text(`Generated: ${now}`, 20, y)
  y += line + 4

  doc.setDrawColor(200, 200, 200)
  doc.line(20, y, 190, y)
  y += 6

  doc.setFontSize(12)
  doc.text('Project', 20, y)
  y += line
  doc.setFontSize(10)
  doc.text(`Name: ${project.name}`, 20, y)
  y += line
  doc.text(`Location: ${project.location}`, 20, y)
  y += line
  doc.text(`Area: ${project.area}`, 20, y)
  y += line
  if (project.coordinates) {
    doc.text(`Coordinates: ${project.coordinates.lat.toFixed(4)}, ${project.coordinates.lng.toFixed(4)}`, 20, y)
    y += line
  }
  doc.text(`Status: ${project.status} | Verified: ${project.verified ? 'Yes' : 'No'}`, 20, y)
  y += line + 4

  doc.setFontSize(12)
  doc.text('MRV Summary', 20, y)
  y += line
  doc.setFontSize(10)
  const carbon = project.creditsAvailable ?? project.mlAnalysis?.carbonCredits ?? 0
  doc.text(`Estimated carbon potential (pre-certification): ${carbon}`, 20, y)
  y += line
  if (project.impact) { doc.text(`Impact: ${project.impact}`, 20, y); y += line }
  const health = project.mlAnalysis?.healthScore ?? 0
  doc.text(`Health score: ${health}`, 20, y)
  y += line
  const conf = project.mlAnalysis?.confidence ?? 0
  doc.text(`Confidence: ${conf}%`, 20, y)
  y += line
  if (project.mlAnalysis?.speciesDetected?.length) {
    doc.text(`Species detected: ${project.mlAnalysis.speciesDetected.join(', ')}`, 20, y)
    y += line
  }
  y += 4

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Carbon values are AI-based estimates and require institutional or regulatory verification before certification.', 20, y)
  y += line
  doc.text('This report is for MRV and registry purposes. Not a tradeable credit certificate unless otherwise certified.', 20, y)

  doc.save(`MRV-Report-${project.name.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${refId}.pdf`)
}
