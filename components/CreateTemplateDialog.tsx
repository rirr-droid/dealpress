"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTemplate, updateTemplate } from "@/app/actions/templates";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { ApprovalTemplate } from "@/types";
import { Switch } from "@/components/ui/switch";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: ApprovalTemplate | null;
}

interface Step {
  step_name: string;
  approver_role: string;
}

export default function CreateTemplateDialog({ open, onOpenChange, template }: CreateTemplateDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dealAmountThreshold, setDealAmountThreshold] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [steps, setSteps] = useState<Step[]>([{ step_name: "", approver_role: "" }]);

  // Load template data when editing
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setDealAmountThreshold(template.deal_amount_threshold?.toString() || "");
      setIsActive(template.is_active);
      if (template.steps && template.steps.length > 0) {
        const sortedSteps = [...template.steps].sort((a, b) => a.step_order - b.step_order);
        setSteps(sortedSteps.map(s => ({ step_name: s.step_name, approver_role: s.approver_role || "" })));
      } else {
        setSteps([{ step_name: "", approver_role: "" }]);
      }
    } else {
      resetForm();
    }
  }, [template]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDealAmountThreshold("");
    setIsActive(true);
    setSteps([{ step_name: "", approver_role: "" }]);
  };

  const handleAddStep = () => {
    setSteps([...steps, { step_name: "", approver_role: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleStepChange = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      return;
    }

    if (steps.length === 0 || steps.some(s => !s.step_name.trim())) {
      toast({
        title: "Error",
        description: "At least one step with a name is required",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const input = {
        name: name.trim(),
        description: description.trim() || undefined,
        deal_amount_threshold: dealAmountThreshold ? parseFloat(dealAmountThreshold) : undefined,
        is_active: isActive,
        steps: steps
          .filter(s => s.step_name.trim())
          .map((s, i) => ({
            step_name: s.step_name.trim(),
            step_order: i + 1,
            approver_role: s.approver_role.trim() || undefined,
          })),
      };

      const result = template
        ? await updateTemplate(template.id, input)
        : await createTemplate(input);

      if (result.success) {
        toast({
          title: template ? "Template updated" : "Template created",
          description: template
            ? "The template has been updated successfully"
            : "Your approval template has been created successfully",
        });
        resetForm();
        onOpenChange(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save template",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{template ? "Edit Template" : "Create Approval Template"}</DialogTitle>
            <DialogDescription>
              {template
                ? "Update your approval workflow template"
                : "Create a new approval workflow template with multiple steps"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Template Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Standard Sales Approval"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe when this template should be used..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Deal Amount Threshold */}
            <div className="grid gap-2">
              <Label htmlFor="threshold">Deal Amount Threshold ($)</Label>
              <Input
                id="threshold"
                type="number"
                placeholder="e.g., 10000"
                value={dealAmountThreshold}
                onChange={(e) => setDealAmountThreshold(e.target.value)}
                min="0"
                step="0.01"
              />
              <p className="text-xs text-[#86868b]">
                This template will be suggested for deals above this amount
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active Template</Label>
                <p className="text-xs text-[#86868b]">
                  Inactive templates cannot be used for new requests
                </p>
              </div>
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Approval Steps */}
            <div className="grid gap-2">
              <Label>
                Approval Steps <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-[#86868b] mb-2">
                Define the approval workflow in sequential order
              </p>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-3 items-start p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#0071e3] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 grid gap-3">
                      <Input
                        placeholder="Step name (e.g., Manager Review)"
                        value={step.step_name}
                        onChange={(e) => handleStepChange(index, "step_name", e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Approver role (e.g., Sales Manager)"
                        value={step.approver_role}
                        onChange={(e) => handleStepChange(index, "approver_role", e.target.value)}
                      />
                    </div>
                    {steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStep(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddStep}
                className="w-full border-dashed rounded-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || steps.length === 0}
              className="bg-[#0071e3] hover:bg-[#0077ed]"
            >
              {isPending ? "Saving..." : template ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
