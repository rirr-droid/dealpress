import { User, ApprovalRequest, ApprovalTemplate, DashboardMetrics } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "sarah.chen@company.com",
    name: "Sarah Chen",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    role: "member"
  },
  {
    id: "2",
    email: "michael.park@company.com",
    name: "Michael Park",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    role: "admin"
  },
  {
    id: "3",
    email: "david.torres@company.com",
    name: "David Torres",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    role: "member"
  },
  {
    id: "4",
    email: "emily.rodriguez@company.com",
    name: "Emily Rodriguez",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    role: "member"
  },
  {
    id: "5",
    email: "james.kim@company.com",
    name: "James Kim",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    role: "member"
  }
];

export const mockTemplates: ApprovalTemplate[] = [
  {
    id: "1",
    organization_id: "org-1",
    name: "Standard Discount Approval",
    description: "For deals with discounts between 10-25%. Requires approval from Sales Manager and VP of Sales.",
    object_type: "opportunity",
    is_active: true,
    deal_amount_threshold: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [
      { name: "Sales Manager Approval", approver_role: "Sales Manager" },
      { name: "VP Sales Approval", approver_role: "VP of Sales" }
    ],
    usage_count: 42,
    avg_approval_time_hours: 8
  },
  {
    id: "2",
    organization_id: "org-1",
    name: "Enterprise Deal Review",
    description: "For enterprise deals over $100k. Full review process including legal and finance approval.",
    object_type: "opportunity",
    is_active: true,
    deal_amount_threshold: 100000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [
      { name: "Sales Manager Approval", approver_role: "Sales Manager" },
      { name: "VP Sales Approval", approver_role: "VP of Sales" },
      { name: "Legal Review", approver_role: "Legal" },
      { name: "Finance Approval", approver_role: "CFO" }
    ],
    usage_count: 18,
    avg_approval_time_hours: 24
  },
  {
    id: "3",
    organization_id: "org-1",
    name: "Quick Approval (< $50k)",
    description: "Fast-track for smaller deals under $50k. Single approver for speed.",
    object_type: "opportunity",
    is_active: true,
    deal_amount_threshold: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [
      { name: "Sales Manager Approval", approver_role: "Sales Manager" }
    ],
    usage_count: 127,
    avg_approval_time_hours: 4
  },
  {
    id: "4",
    organization_id: "org-1",
    name: "Custom Terms Agreement",
    description: "For deals requiring non-standard contract terms or payment schedules. Requires legal and executive review.",
    object_type: "opportunity",
    is_active: true,
    deal_amount_threshold: 75000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [
      { name: "Sales Manager Approval", approver_role: "Sales Manager" },
      { name: "Legal Review", approver_role: "Legal" },
      { name: "VP Sales Approval", approver_role: "VP of Sales" }
    ],
    usage_count: 31,
    avg_approval_time_hours: 16
  },
  {
    id: "5",
    organization_id: "org-1",
    name: "Partnership & Reseller Deals",
    description: "Special approval process for partnership and reseller channel deals with unique margin structures.",
    object_type: "opportunity",
    is_active: true,
    deal_amount_threshold: 25000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [
      { name: "Channel Manager Approval", approver_role: "Channel Manager" },
      { name: "VP Sales Approval", approver_role: "VP of Sales" }
    ],
    usage_count: 23,
    avg_approval_time_hours: 12
  },
  {
    id: "6",
    organization_id: "org-1",
    name: "Government & Public Sector",
    description: "Specialized workflow for government contracts with compliance and security review requirements.",
    object_type: "opportunity",
    is_active: false,
    deal_amount_threshold: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [
      { name: "Sales Manager Approval", approver_role: "Sales Manager" },
      { name: "Security Review", approver_role: "Security Officer" },
      { name: "Compliance Review", approver_role: "Compliance" },
      { name: "VP Sales Approval", approver_role: "VP of Sales" }
    ],
    usage_count: 7,
    avg_approval_time_hours: 36
  }
];

const now = new Date();
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const mockRequests: ApprovalRequest[] = [
  {
    id: "1",
    organization_id: "org-1",
    template_id: "2",
    deal_name: "Acme Corp Enterprise",
    deal_amount: 125000,
    deal_url: "https://salesforce.com/opportunity/123",
    external_record_id: "SF-OPP-123",
    external_source: "salesforce",
    status: "pending",
    priority: "high",
    reason: "Discount exceeds 20% threshold",
    requester_id: "5",
    requester: mockUsers[4],
    current_step_name: "Legal Review",
    submitted_at: hoursAgo(6),
    created_at: daysAgo(1),
    updated_at: hoursAgo(2),
    steps: [
      {
        id: "s1",
        request_id: "1",
        step_name: "Sales Manager Approval",
        step_order: 1,
        approver_id: "1",
        approver: mockUsers[0],
        status: "approved",
        comments: "Deal looks solid, margin is acceptable",
        assigned_at: hoursAgo(6),
        acted_at: hoursAgo(5.5),
        created_at: hoursAgo(6)
      },
      {
        id: "s2",
        request_id: "1",
        step_name: "VP Sales Approval",
        step_order: 2,
        approver_id: "2",
        approver: mockUsers[1],
        status: "approved",
        comments: "Approved - strategic account",
        assigned_at: hoursAgo(5.5),
        acted_at: hoursAgo(2.25),
        created_at: hoursAgo(5.5)
      },
      {
        id: "s3",
        request_id: "1",
        step_name: "Legal Review",
        step_order: 3,
        approver_id: "3",
        approver: mockUsers[2],
        status: "pending",
        assigned_at: hoursAgo(2.25),
        created_at: hoursAgo(2.25)
      },
      {
        id: "s4",
        request_id: "1",
        step_name: "Finance Approval",
        step_order: 4,
        approver_id: "4",
        approver: mockUsers[3],
        status: "not-started",
        assigned_at: hoursAgo(2.25),
        created_at: hoursAgo(2.25)
      }
    ]
  },
  {
    id: "2",
    organization_id: "org-1",
    template_id: "1",
    deal_name: "TechStart Pro Plan",
    deal_amount: 45000,
    status: "pending",
    priority: "normal",
    reason: "Standard discount approval - 15% off",
    requester_id: "1",
    requester: mockUsers[0],
    current_step_name: "Sales Manager Approval",
    submitted_at: hoursAgo(24),
    created_at: daysAgo(2),
    updated_at: hoursAgo(24),
    steps: [
      {
        id: "s5",
        request_id: "2",
        step_name: "Sales Manager Approval",
        step_order: 1,
        approver_id: "2",
        approver: mockUsers[1],
        status: "pending",
        assigned_at: hoursAgo(24),
        created_at: hoursAgo(24)
      },
      {
        id: "s6",
        request_id: "2",
        step_name: "VP Sales Approval",
        step_order: 2,
        approver_id: "3",
        approver: mockUsers[2],
        status: "not-started",
        assigned_at: hoursAgo(24),
        created_at: hoursAgo(24)
      }
    ]
  },
  {
    id: "3",
    organization_id: "org-1",
    template_id: "2",
    deal_name: "Global Enterprises Annual Contract",
    deal_amount: 250000,
    status: "approved",
    priority: "urgent",
    reason: "Multi-year enterprise contract",
    requester_id: "4",
    requester: mockUsers[3],
    submitted_at: daysAgo(5),
    completed_at: daysAgo(3),
    created_at: daysAgo(6),
    updated_at: daysAgo(3),
    steps: [
      {
        id: "s7",
        request_id: "3",
        step_name: "Sales Manager Approval",
        step_order: 1,
        approver_id: "1",
        approver: mockUsers[0],
        status: "approved",
        comments: "Excellent opportunity",
        assigned_at: daysAgo(5),
        acted_at: daysAgo(4.8),
        created_at: daysAgo(5)
      },
      {
        id: "s8",
        request_id: "3",
        step_name: "Legal Review",
        step_order: 2,
        approver_id: "3",
        approver: mockUsers[2],
        status: "approved",
        comments: "Contract terms reviewed and approved",
        assigned_at: daysAgo(4.8),
        acted_at: daysAgo(4),
        created_at: daysAgo(4.8)
      },
      {
        id: "s9",
        request_id: "3",
        step_name: "Finance Approval",
        step_order: 3,
        approver_id: "4",
        approver: mockUsers[3],
        status: "approved",
        assigned_at: daysAgo(4),
        acted_at: daysAgo(3.5),
        created_at: daysAgo(4)
      },
      {
        id: "s10",
        request_id: "3",
        step_name: "VP Sales Approval",
        step_order: 4,
        approver_id: "2",
        approver: mockUsers[1],
        status: "approved",
        comments: "Final approval granted",
        assigned_at: daysAgo(3.5),
        acted_at: daysAgo(3),
        created_at: daysAgo(3.5)
      }
    ]
  },
  {
    id: "4",
    organization_id: "org-1",
    template_id: "3",
    deal_name: "StartupXYZ Growth Package",
    deal_amount: 35000,
    status: "rejected",
    priority: "low",
    reason: "Custom pricing requested",
    requester_id: "5",
    requester: mockUsers[4],
    submitted_at: daysAgo(7),
    completed_at: daysAgo(6),
    created_at: daysAgo(8),
    updated_at: daysAgo(6),
    steps: [
      {
        id: "s11",
        request_id: "4",
        step_name: "Manager Approval",
        step_order: 1,
        approver_id: "2",
        approver: mockUsers[1],
        status: "rejected",
        comments: "Pricing below acceptable margin",
        assigned_at: daysAgo(7),
        acted_at: daysAgo(6),
        created_at: daysAgo(7)
      }
    ]
  },
  {
    id: "5",
    organization_id: "org-1",
    template_id: "1",
    deal_name: "MidMarket Solutions Upgrade",
    deal_amount: 78000,
    status: "pending",
    priority: "normal",
    reason: "Annual renewal with 18% discount",
    requester_id: "1",
    requester: mockUsers[0],
    current_step_name: "VP Sales Approval",
    submitted_at: hoursAgo(48),
    created_at: daysAgo(3),
    updated_at: hoursAgo(36),
    steps: [
      {
        id: "s12",
        request_id: "5",
        step_name: "Sales Manager Approval",
        step_order: 1,
        approver_id: "1",
        approver: mockUsers[0],
        status: "approved",
        comments: "Good renewal, competitive pricing",
        assigned_at: hoursAgo(48),
        acted_at: hoursAgo(36),
        created_at: hoursAgo(48)
      },
      {
        id: "s13",
        request_id: "5",
        step_name: "VP Sales Approval",
        step_order: 2,
        approver_id: "2",
        approver: mockUsers[1],
        status: "pending",
        assigned_at: hoursAgo(36),
        created_at: hoursAgo(36)
      }
    ]
  }
];

export const mockMetrics: DashboardMetrics = {
  totalRequests: 5,
  pendingApprovals: 3,
  avgApprovalTime: 18.5,
  approvalRate: 60,
  requestsByStatus: {
    pending: 3,
    approved: 1,
    rejected: 1
  }
};

// Helper function to get current user's pending approvals
export function getPendingApprovalsForUser(userId: string): ApprovalRequest[] {
  return mockRequests.filter(request =>
    request.status === "pending" &&
    request.steps?.some(step =>
      step.approver_id === userId && step.status === "pending"
    )
  );
}

// Helper function to calculate waiting time
export function getWaitingTime(assignedAt: string): string {
  const assigned = new Date(assignedAt);
  const now = new Date();
  const diffMs = now.getTime() - assigned.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    return `${diffDays}d ${remainingHours}h`;
  }
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMinutes}m`;
}
