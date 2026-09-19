/**
 * Audit log for traceability (admin actions, project approvals, etc.).
 * Writes to Supabase audit_logs when configured; no-op otherwise.
 */

import { createClient } from '@/lib/supabase/client'

export type AuditAction =
  | 'project_submit'
  | 'project_approve'
  | 'project_reject'
  | 'project_update'
  | 'role_assign'
  | 'marketplace_access_toggle'
  | 'report_generate'

export interface AuditEntry {
  action: AuditAction
  resource_type: string
  resource_id?: string
  details?: Record<string, unknown>
  user_id?: string
  user_email?: string
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  const supabase = createClient()
  if (!supabase) return

  try {
    const { error } = await supabase.from('audit_logs').insert({
      user_id: entry.user_id ?? null,
      user_email: entry.user_email ?? null,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id ?? null,
      details: entry.details ?? null,
    })
    if (error) console.error('Audit log write failed:', error)
  } catch (e) {
    console.error('Audit log error:', e)
  }
}
