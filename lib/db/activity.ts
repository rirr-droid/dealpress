import { createClient } from "@/lib/supabase/server";

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  } | null;
}

/**
 * Get recent activity logs for an organization
 */
export async function getActivityLogs(
  organizationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActivityLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      organization_id,
      user_id,
      action,
      metadata,
      created_at,
      user:user_id(id, name, email, avatar_url)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }

  // Handle Supabase join array/object ambiguity
  const logs = (data || []).map(log => ({
    ...log,
    user: Array.isArray(log.user) ? log.user[0] : log.user
  })) as ActivityLog[];

  return logs;
}

/**
 * Get activity logs filtered by action type
 */
export async function getActivityLogsByType(
  organizationId: string,
  actionType: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      organization_id,
      user_id,
      action,
      metadata,
      created_at,
      user:user_id(id, name, email, avatar_url)
    `)
    .eq('organization_id', organizationId)
    .like('action', `${actionType}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity logs by type:', error);
    return [];
  }

  const logs = (data || []).map(log => ({
    ...log,
    user: Array.isArray(log.user) ? log.user[0] : log.user
  })) as ActivityLog[];

  return logs;
}

/**
 * Get activity logs for a specific user
 */
export async function getUserActivityLogs(
  organizationId: string,
  userId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      organization_id,
      user_id,
      action,
      metadata,
      created_at,
      user:user_id(id, name, email, avatar_url)
    `)
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activity logs:', error);
    return [];
  }

  const logs = (data || []).map(log => ({
    ...log,
    user: Array.isArray(log.user) ? log.user[0] : log.user
  })) as ActivityLog[];

  return logs;
}

/**
 * Format action text for display
 */
export function formatActionText(action: string, metadata: Record<string, unknown> | null): string {
  switch (action) {
    case 'request.created':
      return `created approval request "${metadata?.deal_name || 'Unknown'}"`;
    case 'request.submitted':
      return `submitted approval request "${metadata?.deal_name || 'Unknown'}"`;
    case 'step.approved':
      return `approved step in "${metadata?.deal_name || 'Unknown'}"`;
    case 'step.rejected':
      return `rejected step in "${metadata?.deal_name || 'Unknown'}"`;
    case 'user.invited':
      return `invited ${metadata?.email || 'a user'} to the team`;
    case 'user.role_changed':
      return `changed role to ${metadata?.new_role || 'unknown'}`;
    case 'user.removed':
      return `removed a team member`;
    case 'template.created':
      return `created template "${metadata?.name || 'Unknown'}"`;
    case 'template.updated':
      return `updated template "${metadata?.name || 'Unknown'}"`;
    case 'template.activated':
      return `activated template "${metadata?.name || 'Unknown'}"`;
    case 'template.deactivated':
      return `deactivated template "${metadata?.name || 'Unknown'}"`;
    case 'comment.created':
      return `added a comment`;
    case 'comment.deleted':
      return `deleted a comment`;
    default:
      return action.replace(/\./g, ' ');
  }
}

/**
 * Get icon and color for action type
 */
export function getActionStyle(action: string): { icon: string; color: string } {
  if (action.startsWith('request.')) {
    return { icon: 'FileText', color: '#0071e3' };
  }
  if (action.startsWith('step.approved')) {
    return { icon: 'CheckCircle', color: '#34c759' };
  }
  if (action.startsWith('step.rejected')) {
    return { icon: 'XCircle', color: '#ff3b30' };
  }
  if (action.startsWith('user.')) {
    return { icon: 'Users', color: '#ff9500' };
  }
  if (action.startsWith('template.')) {
    return { icon: 'LayoutTemplate', color: '#5856d6' };
  }
  if (action.startsWith('comment.')) {
    return { icon: 'MessageSquare', color: '#af52de' };
  }
  return { icon: 'Activity', color: '#86868b' };
}
