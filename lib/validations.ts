import { z } from 'zod';

/**
 * Validation schemas for server actions
 */

// Approval request validation
export const createRequestSchema = z.object({
  deal_name: z.string().min(1, 'Deal name is required').max(200, 'Deal name is too long'),
  deal_amount: z.number().positive('Deal amount must be positive').optional(),
  deal_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  reason: z.string().max(1000, 'Reason is too long').optional(),
  template_id: z.string().uuid('Invalid template ID').optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;

// Approval step action validation
export const approveStepSchema = z.object({
  stepId: z.string().uuid('Invalid step ID'),
  comments: z.string().max(1000, 'Comments are too long').optional(),
});

export const rejectStepSchema = z.object({
  stepId: z.string().uuid('Invalid step ID'),
  comments: z.string().min(1, 'Comments are required for rejection').max(1000, 'Comments are too long'),
});

// Team invitation validation
export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  jobTitle: z.string().max(100, 'Job title is too long').optional(),
});

// User signup validation
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name is too long'),
});

// Template creation validation
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  is_active: z.boolean().default(true),
  steps: z.array(z.object({
    step_name: z.string().min(1, 'Step name is required').max(100, 'Step name is too long'),
    step_order: z.number().int().min(1),
    approver_role: z.string().max(50, 'Approver role is too long').optional(),
    execution_type: z.enum(['sequential', 'parallel']).default('sequential'),
    is_required: z.boolean().default(true),
  })).min(1, 'At least one approval step is required'),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
