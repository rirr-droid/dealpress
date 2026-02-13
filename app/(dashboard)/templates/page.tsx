import { getTemplates } from "@/lib/db/templates";
import TemplatesClient from "@/components/TemplatesClient";

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return <TemplatesClient templates={templates} />;
}
