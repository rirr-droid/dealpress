'use server'

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface Contact {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  job_title?: string;
  notes?: string;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all contacts for the current organization
 */
export async function getContacts() {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId) {
    return [];
  }

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('organization_id', orgId)
    .order('usage_count', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data as Contact[];
}

/**
 * Search contacts by name or email
 */
export async function searchContacts(query: string) {
  const supabase = await createClient();
  const orgId = await getUserOrgId();

  if (!orgId || !query) {
    return [];
  }

  const searchTerm = query.toLowerCase();

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('organization_id', orgId)
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order('usage_count', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error searching contacts:', error);
    return [];
  }

  return data as Contact[];
}

/**
 * Create a new contact
 */
export async function createContact(input: {
  name: string;
  email: string;
  job_title?: string;
  notes?: string;
}) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!input.name || !input.email) {
      return { success: false, error: 'Name and email are required' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return { success: false, error: 'Invalid email address' };
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        organization_id: orgId,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        job_title: input.job_title?.trim() || null,
        notes: input.notes?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'A contact with this email already exists' };
      }
      console.error('Error creating contact:', error);
      return { success: false, error: 'Failed to create contact' };
    }

    revalidatePath('/contacts');
    return { success: true, data };
  } catch (error) {
    console.error('Error in createContact:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update a contact
 */
export async function updateContact(
  id: string,
  input: {
    name?: string;
    email?: string;
    job_title?: string;
    notes?: string;
  }
) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name.trim();
    if (input.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        return { success: false, error: 'Invalid email address' };
      }
      updates.email = input.email.trim().toLowerCase();
    }
    if (input.job_title !== undefined) updates.job_title = input.job_title?.trim() || null;
    if (input.notes !== undefined) updates.notes = input.notes?.trim() || null;

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'A contact with this email already exists' };
      }
      console.error('Error updating contact:', error);
      return { success: false, error: 'Failed to update contact' };
    }

    revalidatePath('/contacts');
    return { success: true, data };
  } catch (error) {
    console.error('Error in updateContact:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a contact
 */
export async function deleteContact(id: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const orgId = await getUserOrgId();

    if (!user || !orgId) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error: 'Failed to delete contact' };
    }

    revalidatePath('/contacts');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteContact:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Increment usage count for a contact
 */
export async function incrementContactUsage(email: string) {
  try {
    const supabase = await createClient();
    const orgId = await getUserOrgId();

    if (!orgId) {
      return;
    }

    await supabase.rpc('increment_contact_usage', {
      p_org_id: orgId,
      p_email: email.toLowerCase(),
    });

    // Fallback if RPC doesn't exist
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, usage_count')
      .eq('organization_id', orgId)
      .eq('email', email.toLowerCase())
      .single();

    if (contact) {
      await supabase
        .from('contacts')
        .update({
          usage_count: (contact.usage_count || 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', contact.id);
    }
  } catch (error) {
    console.error('Error incrementing contact usage:', error);
    // Don't fail the request if usage tracking fails
  }
}
