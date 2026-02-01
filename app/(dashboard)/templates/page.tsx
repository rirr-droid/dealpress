"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Plus } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Approval Templates</h1>
          <p className="text-[#86868b]">Create and manage approval workflows</p>
        </div>
        <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Coming Soon Message */}
      <Card className="p-12 text-center rounded-[18px] border border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutTemplate className="w-8 h-8 text-[#0071e3]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-3">
            Templates Coming Soon
          </h2>
          <p className="text-[#86868b] mb-6">
            Create reusable approval workflows with custom steps, conditions, and routing rules.
            This feature is currently in development.
          </p>
          <div className="bg-[#f5f5f7] rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-[#1d1d1f] mb-2">What you will be able to do:</p>
            <ul className="text-sm text-[#86868b] space-y-1">
              <li>• Define multi-step approval workflows</li>
              <li>• Set conditional routing based on deal amount</li>
              <li>• Assign approvers by role or individual</li>
              <li>• Configure parallel or sequential approvals</li>
              <li>• Set SLA targets and escalation rules</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
