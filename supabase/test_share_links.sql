-- Test Queries for Public Shareable Links Feature
-- Run these in Supabase SQL Editor to verify feature works correctly

-- =====================================================
-- 1. Verify Migration Applied Successfully
-- =====================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'approval_requests'
  AND column_name IN ('share_token', 'shared_at', 'share_view_count');

-- Expected result: 3 rows showing the new columns

-- =====================================================
-- 2. Check Unique Index on share_token
-- =====================================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'approval_requests'
  AND indexname = 'idx_approval_requests_share_token';

-- Expected result: 1 row showing the partial index

-- =====================================================
-- 3. View All Requests with Share Links
-- =====================================================
SELECT
  id,
  deal_name,
  status,
  share_token,
  shared_at,
  share_view_count,
  organization_id
FROM approval_requests
WHERE share_token IS NOT NULL
ORDER BY shared_at DESC;

-- Expected result: List of requests with active share links

-- =====================================================
-- 4. Test Share Link Generation (Manual)
-- =====================================================
-- Replace YOUR_REQUEST_ID and YOUR_ORG_ID with actual values
UPDATE approval_requests
SET
  share_token = gen_random_uuid()::text,
  shared_at = NOW(),
  share_view_count = 0
WHERE id = 'YOUR_REQUEST_ID'
  AND organization_id = 'YOUR_ORG_ID'
  AND share_token IS NULL
RETURNING id, deal_name, share_token;

-- Expected result: 1 row with new UUID token

-- =====================================================
-- 5. Test View Count Increment
-- =====================================================
-- Replace YOUR_SHARE_TOKEN with actual token
UPDATE approval_requests
SET share_view_count = COALESCE(share_view_count, 0) + 1
WHERE share_token = 'YOUR_SHARE_TOKEN'
RETURNING deal_name, share_view_count;

-- Expected result: 1 row with incremented count

-- =====================================================
-- 6. Test Share Link Revocation
-- =====================================================
-- Replace YOUR_REQUEST_ID and YOUR_ORG_ID
UPDATE approval_requests
SET
  share_token = NULL,
  shared_at = NULL,
  share_view_count = 0
WHERE id = 'YOUR_REQUEST_ID'
  AND organization_id = 'YOUR_ORG_ID'
RETURNING id, deal_name, share_token;

-- Expected result: 1 row with null token

-- =====================================================
-- 7. Find Public Request by Share Token (Simulates Public View)
-- =====================================================
-- Replace YOUR_SHARE_TOKEN with actual token
SELECT
  ar.id,
  ar.deal_name,
  ar.deal_amount,
  ar.status,
  ar.priority,
  ar.reason,
  ar.submitted_at,
  ar.completed_at,
  ar.created_at,
  ar.share_view_count,
  up.name as requester_name,
  up.avatar_url as requester_avatar
FROM approval_requests ar
LEFT JOIN user_profiles up ON ar.requester_id = up.id
WHERE ar.share_token = 'YOUR_SHARE_TOKEN';

-- Expected result: 1 row with sanitized request data (no sensitive info)

-- =====================================================
-- 8. Get Public Steps for Shared Request
-- =====================================================
-- Replace YOUR_SHARE_TOKEN with actual token
SELECT
  s.id,
  s.step_name,
  s.step_order,
  s.status,
  s.assigned_at,
  s.acted_at,
  s.created_at
  -- NOTE: approver_id and comments are intentionally excluded for privacy
FROM approval_steps s
JOIN approval_requests ar ON s.request_id = ar.id
WHERE ar.share_token = 'YOUR_SHARE_TOKEN'
ORDER BY s.step_order;

-- Expected result: Steps without approver identity or comments

-- =====================================================
-- 9. Analytics: Share Link Usage Stats
-- =====================================================
SELECT
  COUNT(*) as total_shared_requests,
  SUM(share_view_count) as total_views,
  AVG(share_view_count) as avg_views_per_link,
  MAX(share_view_count) as max_views,
  MIN(shared_at) as first_share_date,
  MAX(shared_at) as most_recent_share
FROM approval_requests
WHERE share_token IS NOT NULL;

-- Expected result: Aggregate stats for all shared links

-- =====================================================
-- 10. Analytics: Most Viewed Share Links
-- =====================================================
SELECT
  deal_name,
  status,
  share_view_count,
  shared_at,
  CONCAT(
    COALESCE(NULLIF(SPLIT_PART(COALESCE(NULLIF(CURRENT_SETTING('request.headers', true), ''), ''), 'referer: ', 2), ''), 'Direct'),
    '/share/',
    share_token
  ) as public_url
FROM approval_requests
WHERE share_token IS NOT NULL
ORDER BY share_view_count DESC
LIMIT 10;

-- Expected result: Top 10 most viewed share links

-- =====================================================
-- 11. Security Check: Verify No Sensitive Data Leaks
-- =====================================================
-- This query simulates what a public viewer would see
-- Replace YOUR_SHARE_TOKEN
SELECT
  'Should show' as category,
  'deal_name' as field,
  deal_name as value
FROM approval_requests
WHERE share_token = 'YOUR_SHARE_TOKEN'

UNION ALL

SELECT 'Should show', 'deal_amount', deal_amount::text
FROM approval_requests
WHERE share_token = 'YOUR_SHARE_TOKEN'

UNION ALL

SELECT 'Should show', 'status', status
FROM approval_requests
WHERE share_token = 'YOUR_SHARE_TOKEN'

UNION ALL

SELECT 'Should NOT show', 'organization_id', organization_id::text
FROM approval_requests
WHERE share_token = 'YOUR_SHARE_TOKEN';

-- Expected result: Verify only safe fields are exposed

-- =====================================================
-- 12. Cleanup: Remove Test Share Links
-- =====================================================
-- CAUTION: Only run this in development/testing
-- Replace YOUR_ORG_ID
/*
UPDATE approval_requests
SET
  share_token = NULL,
  shared_at = NULL,
  share_view_count = 0
WHERE organization_id = 'YOUR_ORG_ID'
  AND share_token IS NOT NULL;
*/

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Replace placeholder IDs (YOUR_REQUEST_ID, etc.) with actual values
-- 2. Test in development environment first
-- 3. Monitor share_view_count increments
-- 4. Verify tokens are UUIDs (36 characters with dashes)
-- 5. Check that public queries don't expose sensitive data
