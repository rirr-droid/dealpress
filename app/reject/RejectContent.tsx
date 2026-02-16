'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function RejectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const dealName = searchParams.get('dealName') || 'this request';
  const stepName = searchParams.get('stepName') || 'Approval';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comments.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    if (!token) {
      setError('Invalid token');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/reject/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: comments.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject request');
      }

      // Redirect to success page
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push('/approve/success?rejected=true');
      }
    } catch (err) {
      console.error('Error rejecting:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject request');
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
            <p className="text-gray-600">This rejection link is invalid or has expired.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Reject Request
          </h1>
          <p className="text-gray-600 text-center">
            You are about to reject <strong>{dealName}</strong>
          </p>
          <p className="text-sm text-gray-500 text-center mt-1">
            Step: {stepName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="comments" className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Rejection <span className="text-red-600">*</span>
            </label>
            <textarea
              id="comments"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Please explain why you are rejecting this request..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Your feedback will be shared with the requester to help them understand the decision.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !comments.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
            <Button
              type="button"
              onClick={() => window.close()}
              disabled={isSubmitting}
              variant="outline"
              className="px-6 py-3 rounded-xl font-semibold"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            This action cannot be undone. The requester will be notified immediately.
          </p>
        </form>
      </div>
    </div>
  );
}
