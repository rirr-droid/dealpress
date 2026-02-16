-- Migration: Add Public Shareable Links Support
-- Feature: Public Shareable Request Links
-- Date: 2026-02-16

-- Add share link columns to approval_requests table
ALTER TABLE approval_requests
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN shared_at TIMESTAMPTZ,
ADD COLUMN share_view_count INTEGER DEFAULT 0;

-- Add index for faster token lookups
CREATE INDEX idx_approval_requests_share_token ON approval_requests(share_token) WHERE share_token IS NOT NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN approval_requests.share_token IS 'UUID token for public sharing - allows unauthenticated access to read-only request view';
COMMENT ON COLUMN approval_requests.shared_at IS 'Timestamp when share link was first generated';
COMMENT ON COLUMN approval_requests.share_view_count IS 'Number of times the public share link has been viewed';
