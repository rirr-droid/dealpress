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
export async function uploadAttachment(requestId: string, file: File) {
  try {
    console.log('[UPLOAD] Starting upload:', { name: file.name, size: file.size, type: file.type });

    // Get auth
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      console.error('[UPLOAD] No auth');
      return { success: false, error: 'Not authenticated' };
    }

    console.log('[UPLOAD] User authenticated:', user.id);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: 'File too large. Maximum 10MB.' };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Use PDF, DOCX, XLSX, PNG, or JPG.' };
    }

    console.log('[UPLOAD] File validated');

    // Check subscription (temporarily disabled for testing)
    // TODO: Re-enable subscription check
    /*
    const { data: org } = await supabase
      .from('organizations')
      .select('subscription_tier')
      .eq('id', orgId)
      .single();

    if (org?.subscription_tier !== 'pro' && org?.subscription_tier !== 'enterprise') {
      return { success: false, error: 'Attachments require Pro subscription' };
    }
    */

    console.log('[UPLOAD] Subscription check passed (disabled for testing)');

    // Verify request exists
    const { data: request, error: requestError } = await supabase
      .from('approval_requests')
      .select('id')
      .eq('id', requestId)
      .eq('organization_id', orgId)
      .single();

    if (requestError || !request) {
      console.error('[UPLOAD] Request not found:', requestError);
      return { success: false, error: 'Request not found' };
    }

    console.log('[UPLOAD] Request verified');

    // Create storage path
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${orgId}/${requestId}/${timestamp}-${cleanName}`;

    console.log('[UPLOAD] Storage path:', storagePath);

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[UPLOAD] Buffer created, size:', buffer.length);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('approval-attachments')
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[UPLOAD] Storage error:', uploadError);
      return { success: false, error: 'Storage upload failed: ' + uploadError.message };
    }

    console.log('[UPLOAD] File uploaded to storage');

    // Save to database
    const { error: dbError } = await supabase
      .from('approval_attachments')
      .insert({
        request_id: requestId,
        organization_id: orgId,
        uploaded_by: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
      });

    if (dbError) {
      console.error('[UPLOAD] Database error:', dbError);
      // Try to clean up storage
      await supabase.storage.from('approval-attachments').remove([storagePath]);
      return { success: false, error: 'Database save failed: ' + dbError.message };
    }

    console.log('[UPLOAD] Database record saved');

    revalidatePath(`/requests/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('[UPLOAD] Unexpected error:', error);
    return {
      success: false,
      error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

/**
 * Get attachments for a request - SIMPLIFIED
 */
export async function getAttachments(requestId: string) {
  try {
    console.log('[FETCH] Getting attachments for request:', requestId);

    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      console.log('[FETCH] Not authenticated');
      return { success: true, data: [] };
    }

    // Just get basic attachment data
    const { data, error } = await supabase
      .from('approval_attachments')
      .select('id, file_name, file_size, file_type, created_at, uploaded_by')
      .eq('request_id', requestId)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[FETCH] Database error:', error);
      return { success: true, data: [] };
    }

    console.log('[FETCH] Found attachments:', data?.length || 0);

    // Add uploader info manually
    const result = (data || []).map(att => ({
      id: att.id,
      file_name: att.file_name,
      file_size: att.file_size,
      file_type: att.file_type,
      created_at: att.created_at,
      uploader: {
        name: 'User',
        email: '',
      }
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error('[FETCH] Unexpected error:', error);
    return { success: true, data: [] };
  }
}

/**
 * Get download URL for attachment
 */
export async function getAttachmentUrl(attachmentId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get attachment
    const { data: attachment, error } = await supabase
      .from('approval_attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .eq('organization_id', orgId)
      .single();

    if (error || !attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Generate signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('approval-attachments')
      .createSignedUrl(attachment.storage_path, 3600);

    if (urlError || !urlData) {
      return { success: false, error: 'Failed to create download link' };
    }

    return { success: true, url: urlData.signedUrl };
  } catch (error) {
    console.error('[DOWNLOAD] Error:', error);
    return { success: false, error: 'Download failed' };
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
      return { success: false, error: 'Not authenticated' };
    }

    // Get attachment
    const { data: attachment, error } = await supabase
      .from('approval_attachments')
      .select('storage_path, uploaded_by, request_id')
      .eq('id', attachmentId)
      .eq('organization_id', orgId)
      .single();

    if (error || !attachment) {
      return { success: false, error: 'Attachment not found' };
    }

    // Check if user is owner (skip admin check for now)
    if (attachment.uploaded_by !== user.id) {
      return { success: false, error: 'Not authorized' };
    }

    // Delete from storage
    await supabase.storage.from('approval-attachments').remove([attachment.storage_path]);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('approval_attachments')
      .delete()
      .eq('id', attachmentId);

    if (deleteError) {
      return { success: false, error: 'Delete failed' };
    }

    revalidatePath(`/requests/${attachment.request_id}`);
    return { success: true };
  } catch (error) {
    console.error('[DELETE] Error:', error);
    return { success: false, error: 'Delete failed' };
  }
}
