"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRequest } from "@/app/actions/requests";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Mail } from "lucide-react";
import { ApprovalTemplate } from "@/types";
import UpgradePrompt from "@/components/UpgradePrompt";
import ContactAutocomplete from "@/components/ContactAutocomplete";
import type { Contact } from "@/app/actions/contacts";

interface CreateRequestDialogProps {
  templates: ApprovalTemplate[];
  trigger?: React.ReactNode;
}

interface CustomApprover {
  step_order: number;
  email: string;
  name?: string;
  save_to_contacts: boolean;
}

export default function CreateRequestDialog({ templates, trigger }: CreateRequestDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  // Form state
  const [dealName, setDealName] = useState("");
  const [dealAmount, setDealAmount] = useState("");
  const [dealUrl, setDealUrl] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [reason, setReason] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [customApprovers, setCustomApprovers] = useState<CustomApprover[]>([]);

  // Get selected template
  const selectedTemplate = templates.find(t => t.id === templateId);

  // Initialize custom approvers when template changes
  useEffect(() => {
    if (selectedTemplate?.steps) {
      setCustomApprovers(
        selectedTemplate.steps.map(step => ({
          step_order: step.step_order,
          email: "",
          name: "",
          save_to_contacts: false,
        }))
      );
    } else {
      setCustomApprovers([]);
    }
  }, [selectedTemplate]);

  const resetForm = () => {
    setDealName("");
    setDealAmount("");
    setDealUrl("");
    setPriority("normal");
    setReason("");
    setTemplateId("");
    setCustomApprovers([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!dealName.trim()) {
      toast({
        title: "Error",
        description: "Deal name is required",
        variant: "destructive",
      });
      return;
    }

    if (!templateId) {
      toast({
        title: "Error",
        description: "Please select an approval template",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      // Filter out custom approvers with emails
      const approversWithEmails = customApprovers.filter(a => a.email.trim());

      const result = await createRequest({
        deal_name: dealName.trim(),
        deal_amount: dealAmount ? parseFloat(dealAmount) : undefined,
        deal_url: dealUrl.trim() || undefined,
        priority,
        reason: reason.trim() || undefined,
        template_id: templateId,
        custom_approvers: approversWithEmails.length > 0 ? approversWithEmails : undefined,
      });

      if (result.success) {
        toast({
          title: "Request created",
          description: "Your approval request has been submitted successfully",
        });
        resetForm();
        setOpen(false);
        // Navigate to the new request detail page after a brief delay
        // to ensure cache revalidation completes
        if (result.data?.id) {
          setTimeout(() => {
            router.push(`/requests/${result.data.id}`);
          }, 100);
        }
      } else {
        // Check if it's a usage limit error
        if ('errorCode' in result && result.errorCode === 'USAGE_LIMIT_REACHED') {
          setUpgradeMessage(result.error || "Upgrade to Pro for unlimited requests");
          setOpen(false);
          setShowUpgradePrompt(true);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create request",
            variant: "destructive",
          });
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Approval Request</DialogTitle>
            <DialogDescription>
              Submit a new request for approval. Select a template to define the approval workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Deal Name */}
            <div className="grid gap-2">
              <Label htmlFor="deal-name">
                Deal Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deal-name"
                placeholder="Q1 Enterprise Agreement with Acme Corp"
                value={dealName}
                onChange={(e) => setDealName(e.target.value)}
                required
              />
            </div>

            {/* Template Selection */}
            <div className="grid gap-2">
              <Label htmlFor="template">
                Approval Template <span className="text-red-500">*</span>
              </Label>
              <Select value={templateId} onValueChange={setTemplateId} required>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No templates available
                    </SelectItem>
                  ) : (
                    templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        {template.description && ` - ${template.description}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Approval Steps - Show if template selected */}
            {selectedTemplate && selectedTemplate.steps && selectedTemplate.steps.length > 0 && (
              <div className="grid gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-blue-900">
                    This template has {selectedTemplate.steps.length} approval step{selectedTemplate.steps.length > 1 ? 's' : ''}:
                  </Label>
                </div>

                {selectedTemplate.steps.map((step, index) => {
                  const approverIndex = customApprovers.findIndex(a => a.step_order === step.step_order);
                  const approver = approverIndex >= 0 ? customApprovers[approverIndex] : null;

                  return (
                    <div key={step.id} className="grid gap-2 p-3 bg-white rounded border border-blue-100">
                      <Label htmlFor={`approver-${step.step_order}`} className="text-sm font-medium">
                        Step {step.step_order}: {step.step_name}
                      </Label>

                      <ContactAutocomplete
                        value={approver?.email || ""}
                        onChange={(email) => {
                          setCustomApprovers(prev => {
                            const newApprovers = [...prev];
                            const index = newApprovers.findIndex(a => a.step_order === step.step_order);
                            if (index >= 0) {
                              newApprovers[index].email = email;
                            }
                            return newApprovers;
                          });
                        }}
                        onSelectContact={(contact: Contact) => {
                          setCustomApprovers(prev => {
                            const newApprovers = [...prev];
                            const index = newApprovers.findIndex(a => a.step_order === step.step_order);
                            if (index >= 0) {
                              newApprovers[index].email = contact.email;
                              newApprovers[index].name = contact.name;
                              newApprovers[index].save_to_contacts = false; // Already in contacts
                            }
                            return newApprovers;
                          });
                        }}
                        placeholder="Enter approver email..."
                        className="text-sm"
                      />

                      {approver?.email && !approver.name && (
                        <div className="flex items-center gap-2 ml-1">
                          <Checkbox
                            id={`save-contact-${step.step_order}`}
                            checked={approver.save_to_contacts}
                            onCheckedChange={(checked) => {
                              setCustomApprovers(prev => {
                                const newApprovers = [...prev];
                                const index = newApprovers.findIndex(a => a.step_order === step.step_order);
                                if (index >= 0) {
                                  newApprovers[index].save_to_contacts = checked === true;
                                }
                                return newApprovers;
                              });
                            }}
                          />
                          <label
                            htmlFor={`save-contact-${step.step_order}`}
                            className="text-xs text-gray-600 cursor-pointer"
                          >
                            Save to contacts
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Deal Amount */}
            <div className="grid gap-2">
              <Label htmlFor="deal-amount">Deal Amount</Label>
              <Input
                id="deal-amount"
                type="number"
                placeholder="50000"
                value={dealAmount}
                onChange={(e) => setDealAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Priority */}
            <div className="grid gap-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as typeof priority)}
                required
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deal URL */}
            <div className="grid gap-2">
              <Label htmlFor="deal-url">CRM Link (Optional)</Label>
              <Input
                id="deal-url"
                type="url"
                placeholder="https://crm.example.com/deals/12345"
                value={dealUrl}
                onChange={(e) => setDealUrl(e.target.value)}
              />
            </div>

            {/* Reason */}
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Approval</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this deal needs approval..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !dealName.trim() || !templateId}
              className="bg-[#0071e3] hover:bg-[#0077ed]"
            >
              {isPending ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        message={upgradeMessage}
      />
    </Dialog>
  );
}
