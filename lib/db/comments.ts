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

  // Fetch comments first
  const { data, error } = await supabase
    .from('step_comments')
    .select('id, step_id, organization_id, user_id, comment, created_at, updated_at')
    .eq('step_id', stepId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching step comments:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Fetch user profiles separately
  const userIds = Array.from(new Set(data.map(comment => comment.user_id)));
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id, name, email, avatar_url')
    .in('id', userIds);

  // Create a map of users by ID
  const userMap = new Map(users?.map(user => [user.id, user]) || []);

  // Combine comments with user data
  const comments: StepComment[] = data.map(comment => ({
    ...comment,
    user: userMap.get(comment.user_id)
  }));

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
