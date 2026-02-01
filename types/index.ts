export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "draft";
export type StepStatus = "pending" | "approved" | "rejected" | "skipped" | "not-started";
export type Priority = "low" | "normal" | "high" | "urgent";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: "admin" | "member";
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface ApprovalTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  object_type: string;
  is_active: boolean;
  deal_amount_threshold?: number;
  created_at: string;
  updated_at: string;
  steps?: Array<{ name: string; approver_role: string }>;
  usage_count?: number;
  avg_approval_time_hours?: number;
}

export interface ApprovalTemplateStep {
  id: string;
  template_id: string;
  step_name: string;
  step_order: number;
  approver_id?: string;
  approver_role?: string;
  execution_type: "sequential" | "parallel";
  parallel_group?: number;
  is_required: boolean;
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  organization_id: string;
  template_id?: string;

  // Deal information
  deal_name: string;
  deal_amount?: number;
  deal_url?: string;
  external_record_id?: string;
  external_source?: string;

  // Approval metadata
  status: ApprovalStatus;
  priority: Priority;
  reason?: string;

  // Tracking
  requester_id: string;
  requester?: User;
  current_step_name?: string;
  submitted_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;

  // Relations
  steps?: ApprovalStep[];
}

export interface ApprovalStep {
  id: string;
  request_id: string;

  step_name: string;
  step_order: number;
  approver_id: string;
  approver?: User;

  status: StepStatus;
  comments?: string;

  // Time tracking
  assigned_at: string;
  acted_at?: string;

  created_at: string;
}

export interface DashboardMetrics {
  totalRequests: number;
  pendingApprovals: number;
  avgApprovalTime: number; // hours
  approvalRate: number; // percentage
  requestsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
}
