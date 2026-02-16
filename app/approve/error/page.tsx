'use client';

import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ApprovalErrorPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const stepId = searchParams.get('stepId');
  const status = searchParams.get('status');

  // Determine error message based on reason
  const getErrorDetails = () => {
    switch (reason) {
      case 'invalid_token':
        return {
          title: 'Invalid or Expired Link',
          description: 'This approval link is no longer valid or has expired. Links expire after 7 days for security.',
          action: 'Please log in to approve this request through the dashboard.',
        };
      case 'token_used':
        return {
          title: 'Link Already Used',
          description: 'This approval link has already been used and cannot be used again.',
          action: 'If you need to take action on this request, please log in to the dashboard.',
        };
      case 'already_acted':
        const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'acted upon';
        return {
          title: 'Already Acted Upon',
          description: `This approval step has already been ${statusText}.`,
          action: 'View the request details in the dashboard to see the current status.',
        };
      case 'unauthorized':
        return {
          title: 'Unauthorized',
          description: 'You are not authorized to approve this request. This link may have been forwarded to you.',
          action: 'Only the assigned approver can use this link.',
        };
      case 'step_not_found':
        return {
          title: 'Request Not Found',
          description: 'This approval request could not be found. It may have been deleted.',
          action: 'Contact your team administrator for more information.',
        };
      case 'invalid_action':
        return {
          title: 'Invalid Action',
          description: 'The action for this token does not match the requested operation.',
          action: 'Please use the correct link from your email.',
        };
      case 'update_failed':
        return {
          title: 'Update Failed',
          description: 'We encountered an error while processing your approval.',
          action: 'Please try again or contact support if the problem persists.',
        };
      case 'server_error':
        return {
          title: 'Server Error',
          description: 'An unexpected error occurred while processing your request.',
          action: 'Please try again later or contact support.',
        };
      default:
        return {
          title: 'Something Went Wrong',
          description: 'We encountered an unexpected error.',
          action: 'Please try again or log in to complete this approval.',
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {errorDetails.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-700 mb-6">
            {errorDetails.description}
          </p>

          {/* Action Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-gray-800">
              {errorDetails.action}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors">
                Go to Dashboard
              </Button>
            </Link>
            {stepId && (
              <Link href={`/requests`}>
                <Button variant="outline" className="w-full py-3 rounded-xl font-semibold">
                  View All Requests
                </Button>
              </Link>
            )}
          </div>

          {/* Help Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                Need help? Contact your team administrator
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              DealPress - Deal approvals, made simple
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
