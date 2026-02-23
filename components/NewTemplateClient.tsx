"use client";

import { TemplateBuilder } from "@/components/TemplateBuilder";
import { createTemplateWithApprovers } from "@/app/actions/templates";
import { ArrowLeft, Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

      {/* Warning if only one team member */}
      {members.length <= 1 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Need more team members
              </p>
              <p className="text-sm text-yellow-800 mb-3">
                You need to invite team members before you can assign them as approvers.
                Currently, you only have {members.length} team member{members.length !== 1 ? 's' : ''} (yourself).
              </p>
              <Link href="/settings/team">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-full">
                  <Users className="w-4 h-4 mr-2" />
                  Invite Team Members
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Builder */}
      <TemplateBuilder
        teamMembers={members}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
