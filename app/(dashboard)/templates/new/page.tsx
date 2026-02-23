import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { getUserRole } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewTemplateClient from "@/components/NewTemplateClient";

export const dynamic = 'force-dynamic';

export default async function NewTemplatePage() {
  const user = await getCurrentUser();
  const role = await getUserRole();

  if (!user) {
    redirect('/login');
  }

  // Only admins can create templates
  if (role !== 'admin') {
    redirect('/templates');
  }

  // Get team members
  const orgId = await getUserOrgId();
  const supabase = await createClient();

  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      id,
      user_id,
      role,
      user_profiles!organization_members_user_id_fkey (
        name,
        email,
        avatar_url
      )
    `)
    .eq('organization_id', orgId);

  return <NewTemplateClient members={members || []} />;
}
