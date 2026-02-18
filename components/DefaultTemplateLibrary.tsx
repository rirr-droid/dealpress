"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutTemplate, Check, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DEFAULT_TEMPLATES, type DefaultTemplate } from "@/lib/default-templates";
import { installDefaultTemplate } from "@/app/actions/default-templates";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface DefaultTemplateLibraryProps {
  availableTemplates?: DefaultTemplate[];
  onInstalled?: () => void;
}

const CATEGORY_COLORS = {
  enterprise: "bg-purple-100 text-purple-700 border-purple-200",
  standard: "bg-blue-100 text-blue-700 border-blue-200",
  discount: "bg-green-100 text-green-700 border-green-200",
  custom: "bg-orange-100 text-orange-700 border-orange-200",
  payment: "bg-pink-100 text-pink-700 border-pink-200",
};

const CATEGORY_LABELS = {
  enterprise: "Enterprise",
  standard: "Standard",
  discount: "Discount",
  custom: "Custom Terms",
  payment: "Payment",
};

export default function DefaultTemplateLibrary({
  availableTemplates,
  onInstalled,
}: DefaultTemplateLibraryProps) {
  const [installing, setInstalling] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const router = useRouter();

  const templates = availableTemplates || DEFAULT_TEMPLATES;

  const handleInstall = async (templateName: string) => {
    setInstalling(templateName);

    try {
      const result = await installDefaultTemplate(templateName);

      if (result.success) {
        setInstalled(prev => new Set(prev).add(templateName));
        toast({
          title: "Template installed!",
          description: `${templateName} is now ready to use`,
        });
        router.refresh();
        onInstalled?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to install template",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to install template",
        variant: "destructive",
      });
    } finally {
      setInstalling(null);
    }
  };

  if (templates.length === 0) {
    return (
      <Card className="p-8 text-center border border-[#d2d2d7]">
        <LayoutTemplate className="w-12 h-12 text-[#86868b] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
          All templates installed!
        </h3>
        <p className="text-[#86868b]">
          You've already installed all available default templates
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Template Library</h2>
          <p className="text-sm text-[#86868b]">
            One-click templates to get started instantly
          </p>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, index) => {
          const isInstalled = installed.has(template.name);
          const isInstalling = installing === template.name;

          return (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all border border-[#d2d2d7] h-full flex flex-col">
                {/* Category Badge */}
                <Badge
                  variant="secondary"
                  className={`mb-3 w-fit ${CATEGORY_COLORS[template.category]}`}
                >
                  {CATEGORY_LABELS[template.category]}
                </Badge>

                {/* Template Name */}
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                  {template.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#86868b] mb-4 flex-1">
                  {template.description}
                </p>

                {/* Steps Count */}
                <div className="flex items-center gap-2 mb-4 text-sm text-[#86868b]">
                  <LayoutTemplate className="w-4 h-4" />
                  <span>{template.steps.length} approval steps</span>
                </div>

                {/* Install Button */}
                <Button
                  onClick={() => handleInstall(template.name)}
                  disabled={isInstalling || isInstalled}
                  className={`w-full ${
                    isInstalled
                      ? "bg-green-600 hover:bg-green-600"
                      : "bg-[#0071e3] hover:bg-[#0077ed]"
                  } text-white`}
                >
                  {isInstalling ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Installing...
                    </>
                  ) : isInstalled ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Install Template
                    </>
                  )}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
