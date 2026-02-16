import { getRequests } from "@/lib/db/requests";
import { getActiveTemplates } from "@/lib/db/templates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CreateRequestDialog from "@/components/CreateRequestDialog";
import Link from "next/link";
import { Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function RequestsPage() {
  const requests = await getRequests();
  const templates = await getActiveTemplates();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-[#ff9500] text-white">Pending</Badge>;
      case "approved":
        return <Badge className="bg-[#34c759] text-white">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-[#ff3b30] text-white">Rejected</Badge>;
      default:
        return <Badge>Draft</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-[#ff3b30]";
      case "high":
        return "border-l-[#ff9500]";
      case "normal":
        return "border-l-[#0071e3]";
      default:
        return "border-l-gray-300";
    }
  };

  // Get current step name
  const getCurrentStepName = (request: { steps?: Array<{ status: string; step_name: string }> }) => {
    if (!request.steps || request.steps.length === 0) return undefined;
    const pendingStep = request.steps.find((s) => s.status === 'pending');
    return pendingStep?.step_name;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Approval Requests</h1>
          <p className="text-[#86868b]">Manage all approval requests</p>
        </div>
        <CreateRequestDialog templates={templates} />
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card className="p-12 text-center rounded-[18px] border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">No requests found</h3>
            <p className="text-[#86868b] mb-4">
              There are {requests.length} requests loaded. This might be a data issue.
            </p>
            <p className="text-xs text-[#86868b] mb-4">Check Vercel logs for errors</p>
            <CreateRequestDialog templates={templates} />
          </Card>
        ) : (
          requests.map((request) => {
            const currentStepName = getCurrentStepName(request);

            return (
              <Link key={request.id} href={`/requests/${request.id}`}>
                <Card className={`p-6 rounded-[18px] border-l-4 hover:shadow-md transition-all cursor-pointer ${getPriorityColor(request.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[#1d1d1f]">
                          {request.deal_name}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#86868b] mb-3">
                        {request.deal_amount && (
                          <>
                            <span className="font-semibold text-[#1d1d1f]">
                              ${request.deal_amount.toLocaleString()}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>{request.requester?.name}</span>
                        {currentStepName && (
                          <>
                            <span>•</span>
                            <span>{currentStepName}</span>
                          </>
                        )}
                      </div>
                      {request.reason && (
                        <p className="text-sm text-[#86868b] mb-3">{request.reason}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#86868b]" />
                        <p className="text-xs text-[#86868b]">
                          {request.submitted_at && new Date(request.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
                      View Details
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
