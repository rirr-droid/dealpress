"use client";

import { useState } from "react";
import { mockTemplates } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutTemplate, Plus, Clock, CheckCircle, Users, TrendingUp, Circle } from "lucide-react";
import { motion } from "framer-motion";

type FilterType = "all" | "active" | "inactive";

export default function TemplatesPage() {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTemplates = filter === "all"
    ? mockTemplates
    : mockTemplates.filter(t => filter === "active" ? t.is_active : !t.is_active);

  const getStepIndicators = (stepCount: number) => {
    return Array.from({ length: stepCount }).map((_, i) => (
      <Circle key={i} className="w-2 h-2 fill-[#0071e3] text-[#0071e3]" />
    ));
  };

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

      {/* Filters */}
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
            {status === "all" && ` (${mockTemplates.length})`}
            {status === "active" && ` (${mockTemplates.filter(t => t.is_active).length})`}
            {status === "inactive" && ` (${mockTemplates.filter(t => !t.is_active).length})`}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-6 rounded-[18px] border-2 transition-all hover:shadow-lg cursor-pointer ${
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
                    {template.description}
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
              <div className="grid grid-cols-3 gap-4 mb-4">
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

                {/* Avg Time */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#86868b]" />
                    <p className="text-xs text-[#86868b]">Avg Time</p>
                  </div>
                  <p className="text-lg font-bold text-[#1d1d1f]">
                    {template.avg_approval_time_hours || 0}h
                  </p>
                </div>

                {/* Usage */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#86868b]" />
                    <p className="text-xs text-[#86868b]">Used</p>
                  </div>
                  <p className="text-lg font-bold text-[#1d1d1f]">
                    {template.usage_count || 0}x
                  </p>
                </div>
              </div>

              {/* Approval Steps Preview */}
              {template.steps && template.steps.length > 0 && (
                <div className="mb-4 p-3 bg-white border border-gray-100 rounded-lg">
                  <p className="text-xs font-semibold text-[#86868b] mb-2">Approval Flow:</p>
                  <div className="space-y-1">
                    {template.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#0071e3]">{idx + 1}.</span>
                        <span className="text-xs text-[#1d1d1f]">{step.name}</span>
                        <span className="text-xs text-[#86868b]">({step.approver_role})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
                  disabled={!template.is_active}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 rounded-full"
                >
                  View Details
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
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">No templates found</h3>
          <p className="text-[#86868b]">Try adjusting your filters or create a new template</p>
        </Card>
      )}
    </div>
  );
}
