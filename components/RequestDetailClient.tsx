"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveStep, rejectStep } from "@/app/actions/approvals";
import ApprovalTracker from "@/components/ApprovalTracker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApprovalRequest } from "@/types";

interface RequestDetailClientProps {
  request: ApprovalRequest;
  currentUserId: string;
}

export default function RequestDetailClient({ request, currentUserId }: RequestDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [rejectComments, setRejectComments] = useState("");

  const handleApprove = (stepId: string) => {
    startTransition(async () => {
      const result = await approveStep(stepId);

      if (result.success) {
        toast({
          title: "Approval submitted",
          description: "You have approved this step.",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve step",
          variant: "destructive",
        });
      }
    });
  };

  const handleReject = (stepId: string) => {
    setSelectedStepId(stepId);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedStepId || !rejectComments.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await rejectStep(selectedStepId, rejectComments);

      if (result.success) {
        toast({
          title: "Request rejected",
          description: "You have rejected this request.",
          variant: "destructive",
        });
        setRejectDialogOpen(false);
        setRejectComments("");
        setSelectedStepId(null);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject step",
          variant: "destructive",
        });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-[#34c759] text-white";
      case "rejected":
        return "bg-[#ff3b30] text-white";
      case "pending":
        return "bg-[#ff9500] text-white";
      default:
        return "bg-gray-200 text-[#1d1d1f]";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-[#ff3b30] text-white";
      case "high":
        return "bg-[#ff9500] text-white";
      case "normal":
        return "bg-[#0071e3] text-white";
      default:
        return "bg-gray-300 text-[#1d1d1f]";
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">{request.deal_name}</h1>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(request.status)}>
                  {request.status.toUpperCase()}
                </Badge>
                <Badge className={getPriorityColor(request.priority)}>
                  {request.priority.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Information */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">Deal Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-[#86868b] mb-1">Deal Amount</p>
              <p className="text-lg font-semibold text-[#1d1d1f]">
                ${request.deal_amount?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#86868b] mb-1">Requester</p>
              <p className="text-sm font-medium text-[#1d1d1f]">{request.requester?.name}</p>
            </div>
            <div>
              <p className="text-xs text-[#86868b] mb-1">Submitted</p>
              <p className="text-sm font-medium text-[#1d1d1f]">
                {request.submitted_at && new Date(request.submitted_at).toLocaleDateString()}
              </p>
            </div>
            {request.deal_url && (
              <div>
                <p className="text-xs text-[#86868b] mb-1">External Link</p>
                <a
                  href={request.deal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#0071e3] hover:underline inline-flex items-center gap-1"
                >
                  View in CRM
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Approval Tracker (HERO COMPONENT) */}
        <ApprovalTracker
          request={request}
          currentUserId={currentUserId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. This will be visible to the requester.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="comments">Reason for Rejection</Label>
              <Textarea
                id="comments"
                placeholder="Explain why this request cannot be approved..."
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectComments("");
                setSelectedStepId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={!rejectComments.trim() || isPending}
              className="bg-[#ff3b30] hover:bg-[#ff2d20]"
            >
              {isPending ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
