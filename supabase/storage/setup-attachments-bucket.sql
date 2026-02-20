-- Create storage bucket for approval attachments
-- Run this in Supabase SQL Editor after migration

-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'approval-attachments',
  'approval-attachments',
  false, -- private bucket
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload attachments to their org"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'approval-attachments'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view attachments in their org"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'approval-attachments'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own attachments, admins can delete any"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'approval-attachments'
    AND (
      -- User is uploader (check metadata)
      (SELECT uploaded_by FROM approval_attachments WHERE storage_path = name LIMIT 1) = auth.uid()
      OR
      -- User is admin
      (storage.foldername(name))[1] IN (
        SELECT organization_id::text
        FROM organization_members
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );
