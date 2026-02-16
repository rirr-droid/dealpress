"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, Clock, XCircle, Circle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PublicStep {
  id: string;
  step_name: string;
  step_order: number;
  status: string;
  assigned_at: string;
  acted_at?: string;
}

interface PublicRequest {
  id: string;
  deal_name: string;
  deal_amount?: number;
  status: string;
  priority: string;
  reason?: string;
  submitted_at?: string;
  completed_at?: string;
  created_at: string;
  share_view_count?: number;
  requester: {
    name: string;
    avatar_url?: string;
  } | null;
  steps: PublicStep[];
}

interface RequestTimelinePublicProps {
  request: PublicRequest;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="w-6 h-6 text-[#34c759]" />;
    case "rejected":
      return <XCircle className="w-6 h-6 text-[#ff3b30]" />;
    case "pending":
      return <Clock className="w-6 h-6 text-[#ff9500]" />;
    case "not-started":
      return <Circle className="w-6 h-6 text-gray-300" />;
    default:
      return <Circle className="w-6 h-6 text-gray-300" />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "border-[#34c759] bg-green-50";
    case "rejected":
      return "border-[#ff3b30] bg-red-50";
    case "pending":
      return "border-[#ff9500] bg-orange-50";
    default:
      return "border-gray-200 bg-white";
  }
}

function getStatusBadgeColor(status: string) {
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
}

function getPriorityColor(priority: string) {
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
}

export default function RequestTimelinePublic({ request }: RequestTimelinePublicProps) {
  const steps = request.steps || [];
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === "approved").length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header with DealPress branding */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-4">
            <div className="w-2 h-2 bg-[#0071e3] rounded-full"></div>
            <span className="text-sm font-semibold text-[#1d1d1f]">Powered by DealPress</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1d1d1f] mb-3">{request.deal_name}</h1>
          <div className="flex items-center justify-center gap-3">
            <Badge className={getStatusBadgeColor(request.status)}>
              {request.status.toUpperCase()}
            </Badge>
            <Badge className={getPriorityColor(request.priority)}>
              {request.priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
        </div>

        {/* Deal Information Card */}
        <Card className="p-8 mb-8 rounded-[18px] border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">Deal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {request.deal_amount && (
              <div>
                <p className="text-xs text-[#86868b] mb-1 uppercase tracking-wide">Deal Amount</p>
                <p className="text-2xl font-bold text-[#1d1d1f]">
                  ${request.deal_amount.toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-[#86868b] mb-1 uppercase tracking-wide">Submitted By</p>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#0071e3] text-white text-xs">
                    {request.requester?.name?.split(" ").map(n => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-base font-semibold text-[#1d1d1f]">
                  {request.requester?.name || "Unknown"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#86868b] mb-1 uppercase tracking-wide">Submitted Date</p>
              <p className="text-base font-semibold text-[#1d1d1f]">
                {request.submitted_at
                  ? new Date(request.submitted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : new Date(request.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
              </p>
            </div>
          </div>

          {request.completed_at && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-[#86868b] mb-1 uppercase tracking-wide">
                {request.status === 'approved' ? 'Approved On' : 'Completed On'}
              </p>
              <p className="text-base font-semibold text-[#1d1d1f]">
                {new Date(request.completed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </Card>

        {/* Approval Timeline Card */}
        <Card className="p-8 shadow-lg border border-gray-200 bg-white rounded-[18px] mb-8">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#1d1d1f]">Approval Progress</h3>
              <span className="text-sm font-medium text-[#86868b]">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const isPending = step.status === "pending";
              const statusColor = getStatusColor(step.status);

              return (
                <div key={step.id} className="relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[15px] top-[48px] w-[2px] h-[calc(100%+24px)] bg-gray-200" />
                  )}

                  {/* Step Card */}
                  <div
                    className={`relative border-2 rounded-xl p-5 transition-all ${statusColor} ${
                      isPending ? "shadow-md" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 relative z-10 bg-white rounded-full p-1">
                        {getStatusIcon(step.status)}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        {/* Step Name */}
                        <h4 className="text-base font-semibold text-[#1d1d1f] mb-1">
                          {step.step_name}
                        </h4>

                        {/* Note: Approver names are hidden for privacy */}
                        <p className="text-xs text-[#86868b] mb-2">
                          Step {step.step_order + 1} of {totalSteps}
                        </p>

                        {/* Timestamp / Status */}
                        {step.status === "approved" && step.acted_at && (
                          <p className="text-xs text-[#34c759] font-medium">
                            ✓ Approved {formatDistanceToNow(new Date(step.acted_at), { addSuffix: true })}
                          </p>
                        )}

                        {step.status === "rejected" && step.acted_at && (
                          <p className="text-xs text-[#ff3b30] font-medium">
                            ✗ Rejected {formatDistanceToNow(new Date(step.acted_at), { addSuffix: true })}
                          </p>
                        )}

                        {step.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#ff9500]" />
                            <p className="text-xs font-medium text-[#ff9500]">
                              Awaiting approval...
                            </p>
                          </div>
                        )}

                        {step.status === "not-started" && (
                          <p className="text-xs text-[#86868b]">Not started yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reason / Context */}
        {request.reason && (
          <Card className="p-6 mb-8 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#0071e3] mb-1 uppercase tracking-wide">
                  Why Approval is Needed
                </p>
                <p className="text-sm text-[#1d1d1f]">{request.reason}</p>
              </div>
            </div>
          </Card>
        )}

        {/* DealPress Branding Footer with CTA */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-[#86868b]">
              <div className="w-1.5 h-1.5 bg-[#0071e3] rounded-full"></div>
              <span>This approval workflow is powered by</span>
            </div>
            <h3 className="text-2xl font-bold text-[#1d1d1f]">DealPress</h3>
            <p className="text-sm text-[#86868b] max-w-md mx-auto">
              Streamline your deal approvals with structured workflows, real-time tracking, and automated notifications.
            </p>
            <div className="pt-4">
              <a
                href="https://dealpress.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-[#0071e3] text-white font-semibold rounded-full hover:bg-[#0077ed] transition-all shadow-lg hover:shadow-xl"
              >
                Get DealPress for Your Team
              </a>
            </div>
            <p className="text-xs text-[#86868b]">
              Free tier available • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
