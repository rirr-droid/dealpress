import { getTemplates } from "@/lib/db/templates";
import { getAvailableDefaultTemplates } from "@/app/actions/default-templates";
import { getUserRole } from "@/lib/auth/permissions";
import TemplatesClient from "@/components/TemplatesClient";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const role = await getUserRole();

  // Members can view templates (read-only)
  const templates = await getTemplates();
  const availableDefaultTemplates = await getAvailableDefaultTemplates();

  const isAdmin = role === 'admin';

  return (
    <TemplatesClient
      templates={templates}
      availableDefaultTemplates={availableDefaultTemplates}
      isAdmin={isAdmin}
    />
  );
}
