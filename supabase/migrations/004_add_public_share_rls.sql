-- Add RLS policy to allow public access to shared requests
-- This allows anyone with a share_token to view the request, even without authentication

-- Policy for approval_requests: Allow public SELECT when share_token is used
CREATE POLICY "public_view_shared_requests"
  ON approval_requests
  FOR SELECT
  USING (share_token IS NOT NULL);

-- Policy for approval_steps: Allow public SELECT for steps of shared requests
CREATE POLICY "public_view_shared_steps"
  ON approval_steps
  FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM approval_requests WHERE share_token IS NOT NULL
    )
  );

-- Policy for user_profiles: Allow public SELECT for users involved in shared requests
-- (needed to show requester name on public share page)
CREATE POLICY "public_view_shared_request_users"
  ON user_profiles
  FOR SELECT
  USING (
    id IN (
      SELECT requester_id FROM approval_requests WHERE share_token IS NOT NULL
    )
  );
