import { createClient } from "@/lib/supabase/server";

export interface StepComment {
  id: string;
  step_id: string;
  organization_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

/**
 * Get all comments for an approval step
 */
export async function getStepComments(stepId: string): Promise<StepComment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('step_comments')
    .select(`
      id,
      step_id,
      organization_id,
      user_id,
      comment,
      created_at,
      updated_at,
      user:user_id(id, name, email, avatar_url)
    `)
    .eq('step_id', stepId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching step comments:', error);
    return [];
  }

  // Type assertion to handle Supabase join array/object ambiguity
  const comments = (data || []).map(comment => ({
    ...comment,
    user: Array.isArray(comment.user) ? comment.user[0] : comment.user
  })) as StepComment[];

  return comments;
}

/**
 * Get comment count for an approval step
 */
export async function getStepCommentCount(stepId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('step_comments')
    .select('id', { count: 'exact', head: true })
    .eq('step_id', stepId);

  if (error) {
    console.error('Error counting step comments:', error);
    return 0;
  }

  return count || 0;
}
