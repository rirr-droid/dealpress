import { getTemplates } from "@/lib/db/templates";
import { getAvailableDefaultTemplates } from "@/app/actions/default-templates";
import { getUserRole } from "@/lib/auth/permissions";
import { getUserOrgId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import TemplatesClient from "@/components/TemplatesClient";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const role = await getUserRole();
  const isAdmin = role === 'admin';

  // Members can view templates (read-only)
  const templates = await getTemplates();
  const availableDefaultTemplates = await getAvailableDefaultTemplates();

  // Get team members count for Visual Builder availability
  let teamMembersCount = 0;
  if (isAdmin) {
    const orgId = await getUserOrgId();
    const supabase = await createClient();
    const { count } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);
    teamMembersCount = count || 0;
  }

  return (
    <TemplatesClient
      templates={templates}
      availableDefaultTemplates={availableDefaultTemplates}
      isAdmin={isAdmin}
      teamMembersCount={teamMembersCount}
    />
  );
}
