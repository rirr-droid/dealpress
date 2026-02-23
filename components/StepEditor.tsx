"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  X,
  ChevronUp,
  ChevronDown,
  Users,
  Plus,
  UserCheck,
} from "lucide-react";
import { ApproverSelector } from "./ApproverSelector";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  user_profiles: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface TemplateStep {
  id: string;
  step_name: string;
  step_order: number;
  approver_ids: string[];
  approver_role?: string;
}

interface StepEditorProps {
  step: TemplateStep;
  index: number;
  teamMembers: TeamMember[];
  totalSteps: number;
  onUpdate: (updates: Partial<TemplateStep>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function StepEditor({
  step,
  index,
  teamMembers,
  totalSteps,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: StepEditorProps) {
  const [showApproverSelector, setShowApproverSelector] = useState(false);

  const selectedApprovers = teamMembers.filter((m) =>
    step.approver_ids.includes(m.user_id)
  );

  const handleAddApprover = (userId: string) => {
    if (!step.approver_ids.includes(userId)) {
      onUpdate({ approver_ids: [...step.approver_ids, userId] });
    }
  };

  const handleRemoveApprover = (userId: string) => {
    onUpdate({ approver_ids: step.approver_ids.filter((id) => id !== userId) });
  };

  return (
    <div className="relative p-4 border-2 border-gray-200 rounded-xl hover:border-[#0071e3]/50 transition-colors bg-white">
      {/* Step Number Badge */}
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-[#0071e3] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md z-10">
        {index + 1}
      </div>

      {/* Move Buttons */}
      <div className="absolute -top-3 right-4 flex gap-1">
        <Button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 rounded-full bg-white shadow-sm"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          onClick={onMoveDown}
          disabled={index === totalSteps - 1}
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0 rounded-full bg-white shadow-sm"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3 pl-8">
        {/* Step Name */}
        <div>
          <label className="block text-xs font-medium text-[#86868b] mb-1">
            Step Name <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g., Manager Review, VP Approval"
            value={step.step_name}
            onChange={(e) => onUpdate({ step_name: e.target.value })}
            className="font-medium"
          />
        </div>

        {/* Role Description (Optional) */}
        <div>
          <label className="block text-xs font-medium text-[#86868b] mb-1">
            Role Description (Optional)
          </label>
          <Input
            placeholder="e.g., Sales Manager, Finance Director"
            value={step.approver_role || ""}
            onChange={(e) => onUpdate({ approver_role: e.target.value })}
          />
        </div>

        {/* Approvers */}
        <div>
          <label className="block text-xs font-medium text-[#86868b] mb-2">
            Approvers <span className="text-red-500">*</span>
          </label>

          {/* Selected Approvers */}
          {selectedApprovers.length > 0 ? (
            <div className="space-y-2 mb-2">
              {selectedApprovers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 p-2 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#0071e3]/20 flex items-center justify-center flex-shrink-0">
                    {member.user_profiles?.avatar_url ? (
                      <img
                        src={member.user_profiles.avatar_url}
                        alt={member.user_profiles.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-[#0071e3] font-semibold text-sm">
                        {member.user_profiles?.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] truncate">
                      {member.user_profiles?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-[#86868b] truncate">
                      {member.user_profiles?.email}
                    </p>
                  </div>

                  {/* Role Badge */}
                  {member.role === "admin" && (
                    <Badge variant="outline" className="text-xs">
                      Admin
                    </Badge>
                  )}

                  {/* Remove Button */}
                  <Button
                    type="button"
                    onClick={() => handleRemoveApprover(member.user_id)}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-2 text-center">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-[#86868b]">No approvers selected</p>
              <p className="text-xs text-[#86868b]">Add at least one team member to approve this step</p>
            </div>
          )}

          {/* Add Approver Button */}
          {!showApproverSelector && (
            <Button
              type="button"
              onClick={() => setShowApproverSelector(true)}
              variant="outline"
              size="sm"
              className="w-full border-dashed rounded-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Approver
            </Button>
          )}

          {/* Approver Selector */}
          {showApproverSelector && (
            <ApproverSelector
              teamMembers={teamMembers}
              selectedIds={step.approver_ids}
              onSelect={handleAddApprover}
              onClose={() => setShowApproverSelector(false)}
            />
          )}
        </div>
      </div>

      {/* Remove Step Button */}
      {totalSteps > 1 && (
        <Button
          type="button"
          onClick={onRemove}
          variant="ghost"
          size="sm"
          className="absolute -bottom-2 right-4 h-7 px-3 rounded-full bg-white shadow-sm border border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <X className="w-3 h-3 mr-1" />
          Remove Step
        </Button>
      )}
    </div>
  );
}
