"use client";

import { mockRequests, mockUsers } from "@/lib/mock-data";
import ApprovalTracker from "@/components/ApprovalTracker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();

  const request = mockRequests.find(r => r.id === id);
  const currentUser = mockUsers[1]; // Michael Park

  if (!request) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Request not found</h2>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    toast({
      title: "Approval submitted",
      description: "You have approved this request.",
    });
    // In a real app, this would update the database
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  const handleReject = () => {
    toast({
      title: "Request rejected",
      description: "You have rejected this request.",
      variant: "destructive",
    });
    // In a real app, this would update the database
    setTimeout(() => router.push("/dashboard"), 1500);
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
        currentUserId={currentUser.id}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
