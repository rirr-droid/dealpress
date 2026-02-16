-- Migration: Add email approval tracking columns
-- Feature: One-Click Email Approvals
-- Date: 2026-02-16

-- Add approved_via column to track how the approval was made
ALTER TABLE approval_steps
ADD COLUMN IF NOT EXISTS approved_via TEXT CHECK (approved_via IN ('web', 'email', 'slack'));

-- Add email_token_used column to prevent replay attacks
ALTER TABLE approval_steps
ADD COLUMN IF NOT EXISTS email_token_used BOOLEAN DEFAULT FALSE;

-- Add comment for approved_via column
COMMENT ON COLUMN approval_steps.approved_via IS 'Tracks the channel through which the approval was made: web, email, or slack';

-- Add comment for email_token_used column
COMMENT ON COLUMN approval_steps.email_token_used IS 'Prevents token replay attacks by marking when an email token has been used';
