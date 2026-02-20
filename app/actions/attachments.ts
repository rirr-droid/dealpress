'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

/**
 * Upload attachment to approval request
 */
export async function uploadAttachment(
  requestId: string,
  file: File
) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check subscription tier (Pro feature)
    const { data: org } = await supabase
      .from('organizations')
      .select('subscription_tier')
      .eq('id', orgId)
      .single();

    if (org?.subscription_tier !== 'pro' && org?.subscription_tier !== 'enterprise') {
      return { success: false, error: 'Attachments are a Pro feature. Upgrade to enable.' };
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File size must be less than 10MB' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Allowed: PDF, DOCX, XLSX, PNG, JPG' };
    }

    // Verify request belongs to user's org
    const { data: request } = await supabase
      .from('approval_requests')
      .select('id, organization_id')
      .eq('id', requestId)
      .eq('organization_id', orgId)
      .single();

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${orgId}/${requestId}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('approval-attachments')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Failed to upload file' };
    }

    // Save attachment metadata
    const { data: attachment, error: dbError } = await supabase
      .from('approval_attachments')
      .insert({
        request_id: requestId,
        organization_id: orgId,
        uploaded_by: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB error:', dbError);
      // Clean up uploaded file
      await supabase.storage
        .from('approval-attachments')
        .remove([storagePath]);
      return { success: false, error: 'Failed to save attachment' };
    }

    revalidatePath(`/requests/${requestId}`);
    return { success: true, data: attachment };
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get attachments for a request
 */
export async function getAttachments(requestId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized', data: [] };
    }

    const { data: attachments, error } = await supabase
      .from('approval_attachments')
      .select(`
        *,
        uploader:uploaded_by(name, email)
      `)
      .eq('request_id', requestId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachments:', error);
      return { success: false, error: 'Failed to fetch attachments', data: [] };
    }

    return { success: true, data: attachments || [] };
  } catch (error) {
    console.error('Error getting attachments:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
}

/**
 * Download attachment
 */
export async function getAttachmentUrl(attachmentId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get attachment metadata
    const { data: attachment, error: fetchError } = await supabase
      .from('approval_attachments')
      .select('storage_path, organization_id')
      .eq('id', attachmentId)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Generate signed URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('approval-attachments')
      .createSignedUrl(attachment.storage_path, 3600);

    if (error) {
      console.error('Error creating signed URL:', error);
      return { success: false, error: 'Failed to generate download link' };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Error getting attachment URL:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete attachment
 */
export async function deleteAttachment(attachmentId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get attachment
    const { data: attachment, error: fetchError } = await supabase
      .from('approval_attachments')
      .select('storage_path, organization_id, uploaded_by, request_id')
      .eq('id', attachmentId)
      .eq('organization_id', orgId)
      .single();

    if (fetchError || !attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Check permissions (owner or admin)
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    const isOwner = attachment.uploaded_by === user.id;
    const isAdmin = membership?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return { success: false, error: 'You do not have permission to delete this attachment' };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('approval-attachments')
      .remove([attachment.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('approval_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) {
      console.error('DB delete error:', dbError);
      return { success: false, error: 'Failed to delete attachment' };
    }

    revalidatePath(`/requests/${attachment.request_id}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
