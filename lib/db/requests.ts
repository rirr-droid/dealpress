import { createClient } from "@/lib/supabase/server";
import { getUserOrgId } from "@/lib/auth";

/**
 * Get all approval requests for the current user's organization
 */
export async function getRequests() {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return [];
  }

  const { data, error } = await supabase
    .from('approval_requests')
    .select(`
      *,
      requester:requester_id(id, name, email, avatar_url),
      steps:approval_steps(
        *,
        approver:approver_id(id, name, email, avatar_url)
      )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single approval request by ID
 */
export async function getRequest(id: string) {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return null;
  }

  const { data, error } = await supabase
    .from('approval_requests')
    .select(`
      *,
      requester:requester_id(id, name, email, avatar_url),
      steps:approval_steps(
        *,
        approver:approver_id(id, name, email, avatar_url)
      )
    `)
    .eq('id', id)
    .eq('organization_id', orgId)
    .single();

  if (error) {
    console.error('Error fetching request:', error);
    return null;
  }

  return data;
}

/**
 * Get requests submitted by a specific user
 */
export async function getMySubmittedRequests(userId: string) {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return [];
  }

  const { data, error } = await supabase
    .from('approval_requests')
    .select(`
      *,
      requester:requester_id(id, name, email, avatar_url),
      steps:approval_steps(
        *,
        approver:approver_id(id, name, email, avatar_url)
      )
    `)
    .eq('organization_id', orgId)
    .eq('requester_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submitted requests:', error);
    return [];
  }

  console.log('My submitted requests:', data?.length, 'for user:', userId);
  return data || [];
}

/**
 * Get pending approvals for a specific user
 */
export async function getPendingApprovalsForUser(userId: string) {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return [];
  }

  // Get all approval steps that are pending for this user
  const { data: pendingSteps, error: stepsError } = await supabase
    .from('approval_steps')
    .select('request_id')
    .eq('approver_id', userId)
    .eq('status', 'pending');

  if (stepsError) {
    console.error('Error fetching pending steps:', stepsError);
    return [];
  }

  // If no pending steps, return empty array
  if (!pendingSteps || pendingSteps.length === 0) {
    return [];
  }

  // Get the unique request IDs
  const requestIds = [...new Set(pendingSteps.map(s => s.request_id))];

  // Fetch the full requests with all their steps
  const { data, error } = await supabase
    .from('approval_requests')
    .select(`
      *,
      requester:requester_id(id, name, email, avatar_url),
      steps:approval_steps(
        *,
        approver:approver_id(id, name, email, avatar_url)
      )
    `)
    .eq('organization_id', orgId)
    .in('id', requestIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending approvals:', error);
    return [];
  }

  // Filter to only include requests where the user has a pending step
  const filtered = (data || []).filter(request => {
    return request.steps?.some((step: { approver_id: string; status: string }) =>
      step.approver_id === userId && step.status === 'pending'
    );
  });

  return filtered;
}

/**
 * Get dashboard metrics for the current organization
 */
export async function getDashboardMetrics() {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return {
      totalRequests: 0,
      pendingApprovals: 0,
      avgApprovalTime: 0,
      approvalRate: 0,
    };
  }

  // Get total requests
  const { count: totalRequests } = await supabase
    .from('approval_requests')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  // Get pending approvals
  const { count: pendingApprovals } = await supabase
    .from('approval_requests')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'pending');

  // Get approved requests
  const { count: approvedCount } = await supabase
    .from('approval_requests')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .eq('status', 'approved');

  // Calculate approval rate
  const approvalRate = totalRequests && totalRequests > 0
    ? Math.round((approvedCount || 0) / totalRequests * 100)
    : 0;

  // Get avg approval time (simplified - just return a default for now)
  const avgApprovalTime = 18.5; // TODO: Calculate actual avg from completed requests

  return {
    totalRequests: totalRequests || 0,
    pendingApprovals: pendingApprovals || 0,
    avgApprovalTime,
    approvalRate,
  };
}

/**
 * Get current step name for a request
 */
export function getCurrentStepName(request: { steps?: Array<{ status: string; step_name: string }> }): string | undefined {
  if (!request.steps || request.steps.length === 0) {
    return undefined;
  }

  const pendingStep = request.steps.find(s => s.status === 'pending');
  return pendingStep?.step_name;
}
