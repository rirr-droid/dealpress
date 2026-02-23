"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ArrowRight,
  GripVertical,
  X,
  Users,
  AlertCircle,
  Eye,
  Save,
  CheckCircle2,
} from "lucide-react";
import { ApproverSelector } from "./ApproverSelector";
import { StepEditor } from "./StepEditor";
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
  id: string; // Temporary ID for UI
  step_name: string;
  step_order: number;
  approver_ids: string[]; // Array of user_ids
  approver_role?: string; // Optional role description
}

interface TemplateBuilderProps {
  teamMembers: TeamMember[];
  initialData?: {
    name: string;
    description?: string;
    deal_amount_threshold?: number;
    is_active: boolean;
    steps: TemplateStep[];
  };
  onSave: (data: {
    name: string;
    description?: string;
    deal_amount_threshold?: number;
    is_active: boolean;
    steps: TemplateStep[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function TemplateBuilder({
  teamMembers,
  initialData,
  onSave,
  onCancel,
}: TemplateBuilderProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dealAmountThreshold, setDealAmountThreshold] = useState(
    initialData?.deal_amount_threshold?.toString() || ""
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [steps, setSteps] = useState<TemplateStep[]>(
    initialData?.steps || [
      {
        id: crypto.randomUUID(),
        step_name: "",
        step_order: 1,
        approver_ids: [],
        approver_role: "",
      },
    ]
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        id: crypto.randomUUID(),
        step_name: "",
        step_order: steps.length + 1,
        approver_ids: [],
        approver_role: "",
      },
    ]);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length === 1) {
      setError("You must have at least one approval step");
      return;
    }
    setSteps(steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, step_order: i + 1 })));
  };

  const handleUpdateStep = (id: string, updates: Partial<TemplateStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleMoveStep = (id: string, direction: "up" | "down") => {
    const index = steps.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === steps.length - 1) return;

    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];

    // Update step_order
    const reorderedSteps = newSteps.map((s, i) => ({ ...s, step_order: i + 1 }));
    setSteps(reorderedSteps);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Template name is required");
      return false;
    }

    if (steps.length === 0) {
      setError("At least one approval step is required");
      return false;
    }

    for (const step of steps) {
      if (!step.step_name.trim()) {
        setError("All steps must have a name");
        return false;
      }
      if (step.approver_ids.length === 0) {
        setError(`Step "${step.step_name}" must have at least one approver`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        deal_amount_threshold: dealAmountThreshold ? parseFloat(dealAmountThreshold) : undefined,
        is_active: isActive,
        steps: steps.map((s, i) => ({
          ...s,
          step_order: i + 1,
          step_name: s.step_name.trim(),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const getApproverNames = (approverIds: string[]): string => {
    return approverIds
      .map((id) => {
        const member = teamMembers.find((m) => m.user_id === id);
        return member?.user_profiles?.name || "Unknown";
      })
      .join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Basic Info */}
      <Card className="p-6 rounded-[18px]">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-4">Template Details</h3>

        <div className="space-y-4">
          {/* Template Name */}
          <div>
            <Label htmlFor="name">
              Template Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Enterprise Sales Approval"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe when this template should be used..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Deal Amount Threshold */}
          <div>
            <Label htmlFor="threshold">Deal Amount Threshold ($)</Label>
            <Input
              id="threshold"
              type="number"
              placeholder="e.g., 10000"
              value={dealAmountThreshold}
              onChange={(e) => setDealAmountThreshold(e.target.value)}
              min="0"
              step="0.01"
              className="mt-1"
            />
            <p className="text-xs text-[#86868b] mt-1">
              This template will be suggested for deals above this amount
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="active">Active Template</Label>
              <p className="text-xs text-[#86868b]">
                Inactive templates cannot be used for new requests
              </p>
            </div>
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
      </Card>

      {/* Approval Steps */}
      <Card className="p-6 rounded-[18px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Approval Workflow</h3>
            <p className="text-sm text-[#86868b]">
              Define who needs to approve in sequential order
            </p>
          </div>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm font-medium text-[#0071e3] mb-3">Workflow Preview</p>
            <div className="flex items-center gap-2 flex-wrap">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-white rounded-lg border border-blue-200 shadow-sm">
                    <p className="text-xs font-medium text-[#1d1d1f]">
                      {step.step_name || `Step ${index + 1}`}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      {step.approver_ids.length > 0
                        ? getApproverNames(step.approver_ids)
                        : "No approvers"}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-[#86868b]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <StepEditor
              key={step.id}
              step={step}
              index={index}
              teamMembers={teamMembers}
              totalSteps={steps.length}
              onUpdate={(updates) => handleUpdateStep(step.id, updates)}
              onRemove={() => handleRemoveStep(step.id)}
              onMoveUp={() => handleMoveStep(step.id, "up")}
              onMoveDown={() => handleMoveStep(step.id, "down")}
            />
          ))}
        </div>

        <Button
          onClick={handleAddStep}
          variant="outline"
          className="w-full mt-4 border-dashed rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Approval Step
        </Button>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button onClick={onCancel} variant="outline" disabled={saving} className="rounded-full">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#0071e3] hover:bg-[#0077ed] rounded-full"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
