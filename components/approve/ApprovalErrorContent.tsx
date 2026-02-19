"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";

export function ApprovalErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (reason) {
      case 'invalid_token':
        return {
          title: 'Invalid Approval Link',
          message: 'This approval link is invalid or has expired. Please request a new approval link.',
        };
      case 'self_approval_not_allowed':
        return {
          title: 'Self-Approval Not Allowed',
          message: 'You cannot approve your own request. Please ask another approver to review this request.',
        };
      case 'unauthorized':
        return {
          title: 'Unauthorized',
          message: 'You are not authorized to approve this request. Only the assigned approver can take this action.',
        };
      case 'already_acted':
        return {
          title: 'Already Processed',
          message: 'This approval has already been processed. No further action is needed.',
        };
      case 'token_used':
        return {
          title: 'Link Already Used',
          message: 'This approval link has already been used and cannot be used again.',
        };
      case 'step_not_found':
        return {
          title: 'Approval Not Found',
          message: 'The approval step could not be found. It may have been deleted or completed.',
        };
      case 'update_failed':
        return {
          title: 'Update Failed',
          message: 'Failed to process the approval. Please try again or contact support.',
        };
      case 'server_error':
        return {
          title: 'Server Error',
          message: 'An unexpected error occurred. Please try again later or contact support.',
        };
      default:
        return {
          title: 'Error',
          message: 'An error occurred while processing your request.',
        };
    }
  };

  const { title, message } = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="p-8 max-w-md w-full rounded-[24px] border border-red-200 bg-red-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-red-100 rounded-full">
            {reason === 'self_approval_not_allowed' ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-[#1d1d1f]">{title}</h1>
          <p className="text-[#86868b]">{message}</p>

          {reason === 'self_approval_not_allowed' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left w-full">
              <p className="text-sm text-yellow-900 font-semibold mb-2">Why can't I approve my own request?</p>
              <p className="text-sm text-yellow-800">
                For compliance and governance, requesters cannot approve their own deals. This ensures proper oversight and prevents conflicts of interest.
              </p>
            </div>
          )}

          <Link href="/dashboard" className="w-full mt-4">
            <Button className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
