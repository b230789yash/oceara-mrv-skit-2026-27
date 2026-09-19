/**
 * Report metadata for MRV reports (immutable reference, download tracking).
 * Persists to Supabase report_metadata when configured.
 */

import { createClient } from '@/lib/supabase/client'

export type ReportType = 'MRV_SUMMARY' | 'CARBON_ESTIMATION'

export async function createReportMetadata(
  projectId: string,
  reportType: ReportType = 'MRV_SUMMARY',
  createdBy?: string
): Promise<{ id: string; immutable_ref_id: string } | null> {
  const supabase = createClient()
  if (!supabase) return null

  const immutableRefId = `MRV-${Date.now()}-${projectId.slice(0, 8)}`

  const { data, error } = await supabase
    .from('report_metadata')
    .insert({
      project_id: projectId,
      report_type: reportType,
      immutable_ref_id: immutableRefId,
      created_by: createdBy ?? null,
    })
    .select('id, immutable_ref_id')
    .single()

  if (error) {
    console.error('Report metadata create failed:', error)
    return null
  }
  return data
}

export async function getReportMetadataByProject(projectId: string): Promise<any[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('report_metadata')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}
