"use client";

import { useState } from "react";
import { mockRequests } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import { motion } from "framer-motion";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function RequestsPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filteredRequests = filter === "all"
    ? mockRequests
    : mockRequests.filter(r => r.status === filter);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Approval Requests</h1>
          <p className="text-[#86868b]">Manage all approval requests</p>
        </div>
        <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
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
            {status === "all" && ` (${mockRequests.length})`}
            {status === "pending" && ` (${mockRequests.filter(r => r.status === "pending").length})`}
            {status === "approved" && ` (${mockRequests.filter(r => r.status === "approved").length})`}
            {status === "rejected" && ` (${mockRequests.filter(r => r.status === "rejected").length})`}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="p-12 text-center rounded-[18px] border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">No requests found</h3>
            <p className="text-[#86868b]">Try adjusting your filters</p>
          </Card>
        ) : (
          filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/requests/${request.id}`}>
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
                        <span className="font-semibold text-[#1d1d1f]">
                          ${request.deal_amount?.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>{request.requester?.name}</span>
                        {request.current_step_name && (
                          <>
                            <span>•</span>
                            <span>{request.current_step_name}</span>
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
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
