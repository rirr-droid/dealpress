"use client";

import { TemplateBuilder } from "@/components/TemplateBuilder";
import { createTemplateWithApprovers } from "@/app/actions/templates";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NewTemplateClientProps {
  members: any[];
}

export default function NewTemplateClient({ members }: NewTemplateClientProps) {
  const router = useRouter();

  const handleSave = async (data: any) => {
    const result = await createTemplateWithApprovers(data);
    if (!result.success) {
      throw new Error(result.error);
    }
    router.push('/templates');
  };

  const handleCancel = () => {
    router.push('/templates');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="outline" size="sm" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f]">Create Approval Template</h1>
          <p className="text-[#86868b]">Build a custom approval workflow for your team</p>
        </div>
      </div>

      {/* Builder */}
      <TemplateBuilder
        teamMembers={members}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
