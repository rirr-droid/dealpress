/**
 * Pre-built templates for instant value on signup
 * Users can activate these with one click
 */

export interface DefaultTemplate {
  name: string;
  description: string;
  category: 'enterprise' | 'standard' | 'discount' | 'custom' | 'payment';
  steps: {
    step_name: string;
    step_order: number;
    approver_role: string;
  }[];
}

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    name: 'Enterprise Deal ($100K+)',
    description: 'Multi-stage approval for large enterprise deals requiring executive sign-off',
    category: 'enterprise',
    steps: [
      { step_name: 'Sales Manager Review', step_order: 1, approver_role: 'Sales Manager' },
      { step_name: 'RevOps Review', step_order: 2, approver_role: 'RevOps' },
      { step_name: 'Finance Review', step_order: 3, approver_role: 'Finance' },
      { step_name: 'VP Sales Approval', step_order: 4, approver_role: 'VP Sales' },
      { step_name: 'CFO Final Approval', step_order: 5, approver_role: 'CFO' },
    ],
  },
  {
    name: 'Standard Deal ($10K-$100K)',
    description: 'Streamlined approval process for mid-market deals',
    category: 'standard',
    steps: [
      { step_name: 'Sales Manager Review', step_order: 1, approver_role: 'Sales Manager' },
      { step_name: 'Finance Review', step_order: 2, approver_role: 'Finance' },
      { step_name: 'VP Sales Approval', step_order: 3, approver_role: 'VP Sales' },
    ],
  },
  {
    name: 'Discount Approval (>20%)',
    description: 'Fast-track approval for deals with significant discounts',
    category: 'discount',
    steps: [
      { step_name: 'Sales Manager Review', step_order: 1, approver_role: 'Sales Manager' },
      { step_name: 'Pricing Review', step_order: 2, approver_role: 'Pricing Team' },
      { step_name: 'VP Sales Approval', step_order: 3, approver_role: 'VP Sales' },
    ],
  },
  {
    name: 'Custom Terms Request',
    description: 'Approval workflow for non-standard contract terms and conditions',
    category: 'custom',
    steps: [
      { step_name: 'Sales Manager Review', step_order: 1, approver_role: 'Sales Manager' },
      { step_name: 'Legal Review', step_order: 2, approver_role: 'Legal' },
      { step_name: 'Finance Review', step_order: 3, approver_role: 'Finance' },
      { step_name: 'VP Sales Approval', step_order: 4, approver_role: 'VP Sales' },
    ],
  },
  {
    name: 'Early Payment Request',
    description: 'Approval for deals requiring payment flexibility or extended terms',
    category: 'payment',
    steps: [
      { step_name: 'Sales Manager Review', step_order: 1, approver_role: 'Sales Manager' },
      { step_name: 'Finance Review', step_order: 2, approver_role: 'Finance' },
      { step_name: 'CFO Approval', step_order: 3, approver_role: 'CFO' },
    ],
  },
];

export function getTemplatesByCategory(category?: DefaultTemplate['category']) {
  if (!category) return DEFAULT_TEMPLATES;
  return DEFAULT_TEMPLATES.filter(t => t.category === category);
}

export function getTemplateByName(name: string) {
  return DEFAULT_TEMPLATES.find(t => t.name === name);
}
