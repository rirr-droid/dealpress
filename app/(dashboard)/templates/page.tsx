import { getTemplates } from "@/lib/db/templates";
import { getAvailableDefaultTemplates } from "@/app/actions/default-templates";
import TemplatesClient from "@/components/TemplatesClient";

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const templates = await getTemplates();
  const availableDefaultTemplates = await getAvailableDefaultTemplates();

  return (
    <TemplatesClient
      templates={templates}
      availableDefaultTemplates={availableDefaultTemplates}
    />
  );
}
