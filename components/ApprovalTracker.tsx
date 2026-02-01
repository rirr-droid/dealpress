"use client";

import { ApprovalRequest, StepStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, XCircle, Circle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getWaitingTime } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

interface ApprovalTrackerProps {
  request: ApprovalRequest;
  currentUserId?: string;
  onApprove?: (stepId: string, comments?: string) => void;
  onReject?: (stepId: string, comments?: string) => void;
}

function getStatusIcon(status: StepStatus) {
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

function getStatusColor(status: StepStatus): string {
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

export default function ApprovalTracker({
  request,
  currentUserId,
  onApprove,
  onReject
}: ApprovalTrackerProps) {
  const steps = request.steps || [];
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === "approved").length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Card className="p-8 shadow-lg border border-gray-200 bg-white rounded-[18px]">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">Approval Status</h3>
          <span className="text-sm font-medium text-[#86868b]">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCurrentApprover = step.approver_id === currentUserId && step.status === "pending";
          const isPending = step.status === "pending";
          const statusColor = getStatusColor(step.status);

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
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
                    {isPending && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[#ff9500] opacity-20"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    {/* Step Name */}
                    <h4 className="text-base font-semibold text-[#1d1d1f] mb-1">
                      {step.step_name}
                    </h4>

                    {/* Approver Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={step.approver?.avatar_url} />
                        <AvatarFallback>
                          {step.approver?.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[#1d1d1f]">
                        {step.approver?.name}
                      </span>
                    </div>

                    {/* Timestamp / Status */}
                    {step.status === "approved" && step.acted_at && (
                      <p className="text-xs text-[#86868b]">
                        Approved {formatDistanceToNow(new Date(step.acted_at), { addSuffix: true })}
                      </p>
                    )}

                    {step.status === "rejected" && step.acted_at && (
                      <p className="text-xs text-[#ff3b30]">
                        Rejected {formatDistanceToNow(new Date(step.acted_at), { addSuffix: true })}
                      </p>
                    )}

                    {step.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#ff9500]" />
                        <p className="text-xs font-medium text-[#ff9500]">
                          Waiting {getWaitingTime(step.assigned_at)}
                        </p>
                      </div>
                    )}

                    {step.status === "not-started" && (
                      <p className="text-xs text-[#86868b]">Not started</p>
                    )}

                    {/* Comments */}
                    {step.comments && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-[#86868b] mb-1">Comment:</p>
                        <p className="text-sm text-[#1d1d1f]">{step.comments}</p>
                      </div>
                    )}

                    {/* Action Buttons (only for current approver) */}
                    {isCurrentApprover && onApprove && onReject && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 flex gap-3"
                      >
                        <Button
                          onClick={() => onApprove(step.id)}
                          className="flex-1 bg-[#34c759] hover:bg-[#2fb04e] text-white font-semibold rounded-full h-11 transition-all shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => onReject(step.id)}
                          variant="outline"
                          className="flex-1 border-2 border-[#ff3b30] text-[#ff3b30] hover:bg-[#ff3b30] hover:text-white font-semibold rounded-full h-11 transition-all"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reason / Context */}
      {request.reason && (
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#0071e3] mb-1">Why approval is needed</p>
              <p className="text-sm text-[#1d1d1f]">{request.reason}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
