"use client";

import { useState } from "react";
import { ApprovalTemplate } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutTemplate, Plus, Clock, Users, TrendingUp, Circle, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import CreateTemplateDialog from "@/components/CreateTemplateDialog";
import DefaultTemplateLibrary from "@/components/DefaultTemplateLibrary";
import { deleteTemplate, toggleTemplateStatus } from "@/app/actions/templates";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { DefaultTemplate } from "@/lib/default-templates";

type FilterType = "all" | "active" | "inactive";

interface TemplatesClientProps {
  templates: ApprovalTemplate[];
  availableDefaultTemplates?: DefaultTemplate[];
}

export default function TemplatesClient({ templates, availableDefaultTemplates }: TemplatesClientProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ApprovalTemplate | null>(null);
  const [showDefaultTemplates, setShowDefaultTemplates] = useState(templates.length === 0);
  const { toast } = useToast();
  const router = useRouter();

  const filteredTemplates = filter === "all"
    ? templates
    : templates.filter(t => filter === "active" ? t.is_active : !t.is_active);

  const getStepIndicators = (stepCount: number) => {
    return Array.from({ length: stepCount }).map((_, i) => (
      <Circle key={i} className="w-2 h-2 fill-[#0071e3] text-[#0071e3]" />
    ));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    const result = await deleteTemplate(id);
    if (result.success) {
      toast({
        title: "Template deleted",
        description: "The template has been deleted successfully",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleTemplateStatus(id, !currentStatus);
    if (result.success) {
      toast({
        title: "Status updated",
        description: `Template is now ${!currentStatus ? 'active' : 'inactive'}`,
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: ApprovalTemplate) => {
    setEditingTemplate(template);
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Approval Templates</h1>
          <p className="text-[#86868b]">Create and manage approval workflows</p>
        </div>
        <Button
          className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Default Templates Library */}
      {availableDefaultTemplates && availableDefaultTemplates.length > 0 && (
        <DefaultTemplateLibrary
          availableTemplates={availableDefaultTemplates}
          onInstalled={() => {
            router.refresh();
            setShowDefaultTemplates(false);
          }}
        />
      )}

      {/* Divider if we have both default templates and custom templates */}
      {availableDefaultTemplates && availableDefaultTemplates.length > 0 && templates.length > 0 && (
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#f5f5f7] text-[#86868b] font-medium">Your Custom Templates</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {templates.length > 0 && (
        <div className="flex gap-3">
          {(["all", "active", "inactive"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className={`rounded-full capitalize ${
                filter === status
                  ? "bg-[#0071e3] hover:bg-[#0077ed]"
                  : "border-gray-200"
              }`}
            >
              {status}
              {status === "all" && ` (${templates.length})`}
              {status === "active" && ` (${templates.filter(t => t.is_active).length})`}
              {status === "inactive" && ` (${templates.filter(t => !t.is_active).length})`}
            </Button>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 rounded-[18px] border-2 transition-all hover:shadow-lg ${
              template.is_active ? "border-gray-200 hover:border-[#0071e3]" : "border-gray-200 opacity-60"
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <LayoutTemplate className="w-5 h-5 text-[#0071e3]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">
                      {template.name}
                    </h3>
                  </div>
                  <p className="text-sm text-[#86868b] mb-3">
                    {template.description || 'No description'}
                  </p>
                </div>
                <Badge className={template.is_active ? "bg-[#34c759] text-white" : "bg-gray-400 text-white"}>
                  {template.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Threshold */}
              {template.deal_amount_threshold && (
                <div className="mb-4 p-3 bg-[#f5f5f7] rounded-lg">
                  <p className="text-xs text-[#86868b] mb-1">Applies to deals</p>
                  <p className="text-sm font-semibold text-[#1d1d1f]">
                    ${(template.deal_amount_threshold / 1000).toFixed(0)}k+
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Steps */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#86868b]" />
                    <p className="text-xs text-[#86868b]">Steps</p>
                  </div>
                  <p className="text-lg font-bold text-[#1d1d1f]">
                    {template.steps?.length || 0}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {getStepIndicators(template.steps?.length || 0)}
                  </div>
                </div>

                {/* Created */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#86868b]" />
                    <p className="text-xs text-[#86868b]">Created</p>
                  </div>
                  <p className="text-sm font-medium text-[#1d1d1f]">
                    {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Approval Steps Preview */}
              {template.steps && template.steps.length > 0 && (
                <div className="mb-4 p-3 bg-white border border-gray-100 rounded-lg">
                  <p className="text-xs font-semibold text-[#86868b] mb-2">Approval Flow:</p>
                  <div className="space-y-1">
                    {template.steps
                      .sort((a, b) => a.step_order - b.step_order)
                      .map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#0071e3]">{idx + 1}.</span>
                          <span className="text-xs text-[#1d1d1f]">{step.step_name}</span>
                          {step.approver_role && (
                            <span className="text-xs text-[#86868b]">({step.approver_role})</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleEdit(template)}
                  className="flex-1 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleToggleStatus(template.id, template.is_active)}
                  variant="outline"
                  className="border-gray-200 rounded-full"
                >
                  {template.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  onClick={() => handleDelete(template.id, template.name)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="p-12 text-center rounded-[18px] border border-gray-200">
          <LayoutTemplate className="w-12 h-12 text-[#86868b] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
            {filter === "all" ? "No templates yet" : `No ${filter} templates`}
          </h3>
          <p className="text-[#86868b] mb-4">
            {filter === "all"
              ? "Create your first approval template to get started"
              : `Try adjusting your filters or create a new template`
            }
          </p>
          {filter === "all" && (
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          )}
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <CreateTemplateDialog
        open={createDialogOpen}
        onOpenChange={handleCloseDialog}
        template={editingTemplate}
      />
    </div>
  );
}
