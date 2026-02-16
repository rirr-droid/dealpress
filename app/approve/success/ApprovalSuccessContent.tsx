'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ApprovalSuccessContent() {
  const searchParams = useSearchParams();
  const dealName = searchParams.get('dealName') || 'Request';
  const requestId = searchParams.get('requestId');
  const allApproved = searchParams.get('allApproved') === 'true';
  const rejected = searchParams.get('rejected') === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className={`w-20 h-20 ${rejected ? 'bg-orange-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {rejected ? (
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {rejected ? 'Request Rejected' : 'Successfully Approved!'}
          </h1>

          {/* Deal Name */}
          <p className="text-xl text-gray-700 mb-6">
            {dealName}
          </p>

          {/* Status Message */}
          <div className={`${rejected ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'} border rounded-xl p-6 mb-8`}>
            {rejected ? (
              <>
                <p className="text-gray-800 font-medium mb-2">
                  You have rejected this request
                </p>
                <p className="text-sm text-gray-600">
                  The requester has been notified of your decision and feedback.
                </p>
              </>
            ) : allApproved ? (
              <>
                <p className="text-gray-800 font-medium mb-2">
                  This was the final approval step
                </p>
                <p className="text-sm text-gray-600">
                  The request is now fully approved and the requester has been notified.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-800 font-medium mb-2">
                  Your approval has been recorded
                </p>
                <p className="text-sm text-gray-600">
                  The request is now moving to the next approval step. The requester and next approver have been notified.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {requestId && (
              <Link href={`/requests/${requestId}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors">
                  View Full Request Details
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline" className="w-full py-3 rounded-xl font-semibold">
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {/* Info Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                This action has been logged in the audit trail
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
