"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveStep, rejectStep } from "@/app/actions/approvals";
import { generateShareLink, revokeShareLink } from "@/app/actions/share";
import { cancelRequest } from "@/app/actions/requests";
import ApprovalTracker from "@/components/ApprovalTracker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Share2, Copy, Trash2, Eye, XCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { ApprovalRequest } from "@/types";
import type { StepComment } from "@/lib/db/comments";

interface RequestDetailClientProps {
  request: ApprovalRequest;
  currentUserId: string;
  stepComments?: Record<string, StepComment[]>;
}

export default function RequestDetailClient({ request, currentUserId, stepComments }: RequestDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [rejectComments, setRejectComments] = useState("");

  // Share link state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Cancel request state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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

  // Handle share link generation
  const handleShareClick = async () => {
    setIsGeneratingLink(true);

    // Check if link already exists
    if (request.share_token) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      setShareUrl(`${appUrl}/share/${request.share_token}`);
      setShareDialogOpen(true);
      setIsGeneratingLink(false);
      return;
    }

    // Generate new share link
    const result = await generateShareLink(request.id);

    if (result.success && result.url) {
      setShareUrl(result.url);
      setShareDialogOpen(true);
      toast({
        title: "Share link generated",
        description: "Anyone with this link can view the approval status.",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to generate share link",
        variant: "destructive",
      });
    }

    setIsGeneratingLink(false);
  };

  // Copy share link to clipboard
  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  // Revoke share link
  const handleRevokeLink = async () => {
    if (!request.id) return;

    const result = await revokeShareLink(request.id);

    if (result.success) {
      setShareUrl(null);
      setShareDialogOpen(false);
      toast({
        title: "Link revoked",
        description: "The public share link has been disabled",
      });
      router.refresh();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to revoke link",
        variant: "destructive",
      });
    }
  };

  // Handle cancel request
  const handleCancelRequest = async () => {
    if (!request.id) return;

    startTransition(async () => {
      const result = await cancelRequest(request.id, cancelReason.trim() || undefined);

      if (result.success) {
        setCancelDialogOpen(false);
        setCancelReason("");
        toast({
          title: "Request cancelled",
          description: "The approval request has been cancelled successfully",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to cancel request",
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
      case "cancelled":
        return "bg-gray-500 text-white";
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {request.share_token && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  {request.share_view_count || 0} views
                </Badge>
              )}
              <Button
                onClick={handleShareClick}
                disabled={isGeneratingLink}
                variant="outline"
                className="border-[#0071e3] text-[#0071e3] hover:bg-[#0071e3] hover:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {isGeneratingLink ? "Generating..." : request.share_token ? "Share Link" : "Create Share Link"}
              </Button>

              {/* Cancel Button - Only show for pending requests and if user is requester */}
              {request.status === 'pending' && request.requester_id === currentUserId && (
                <Button
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={isPending}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Request
                </Button>
              )}
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
          stepComments={stepComments}
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

      {/* Share Link Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#0071e3]" />
              Share Approval Request
            </DialogTitle>
            <DialogDescription>
              Anyone with this link can view the approval status and timeline. Approver names and internal comments are hidden for privacy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Share URL Input */}
            <div className="space-y-2">
              <Label htmlFor="share-url">Public Share Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl || ""}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            {request.share_view_count !== undefined && request.share_view_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-[#86868b] bg-gray-50 rounded-lg p-3">
                <Eye className="w-4 h-4" />
                <span>
                  This link has been viewed {request.share_view_count} {request.share_view_count === 1 ? 'time' : 'times'}
                </span>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-[#1d1d1f] font-medium mb-2">What's shared publicly:</p>
              <ul className="text-sm text-[#86868b] space-y-1">
                <li>✓ Deal name and amount</li>
                <li>✓ Approval status and timeline</li>
                <li>✓ Requester name</li>
                <li>✗ Approver names (hidden)</li>
                <li>✗ Internal comments (hidden)</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={handleRevokeLink}
              variant="outline"
              className="border-[#ff3b30] text-[#ff3b30] hover:bg-[#ff3b30] hover:text-white w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Revoke Link
            </Button>
            <Button
              onClick={handleCopyLink}
              className="bg-[#0071e3] hover:bg-[#0077ed] w-full sm:w-auto"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Request Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Cancel Approval Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this approval request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation (Optional)</Label>
              <Textarea
                id="cancel-reason"
                placeholder="Explain why you're cancelling this request..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-[#86868b]">
                This will be recorded in the audit log for future reference.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelReason("");
              }}
              disabled={isPending}
            >
              Keep Request
            </Button>
            <Button
              onClick={handleCancelRequest}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Cancelling..." : "Cancel Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
