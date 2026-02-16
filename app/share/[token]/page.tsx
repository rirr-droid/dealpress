import { getRequestByShareToken, incrementShareViewCount } from "@/lib/db/requests";
import RequestTimelinePublic from "@/components/RequestTimelinePublic";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

// This route is PUBLIC - no authentication required
export const dynamic = 'force-dynamic';

interface SharePageProps {
  params: {
    token: string;
  };
}

/**
 * Generate OpenGraph metadata for social sharing
 */
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = params;
  const request = await getRequestByShareToken(token);

  if (!request) {
    return {
      title: "Request Not Found | DealPress",
      description: "This shared request link is invalid or has been revoked."
    };
  }

  const statusEmoji = request.status === 'approved' ? '✅' : request.status === 'rejected' ? '❌' : '⏳';
  const amountText = request.deal_amount ? `$${request.deal_amount.toLocaleString()}` : '';

  return {
    title: `${request.deal_name} - ${request.status.toUpperCase()} | DealPress`,
    description: `${statusEmoji} Deal approval request ${amountText ? `for ${amountText}` : ''} is currently ${request.status}. View the complete approval timeline.`,
    openGraph: {
      title: `${request.deal_name} - ${request.status.toUpperCase()}`,
      description: `${statusEmoji} Deal approval ${amountText ? `for ${amountText}` : ''} is ${request.status}`,
      type: 'website',
      siteName: 'DealPress',
      images: [
        {
          url: '/og-image.png', // You can create this later
          width: 1200,
          height: 630,
          alt: 'DealPress - Deal Approval Automation'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${request.deal_name} - ${request.status.toUpperCase()}`,
      description: `${statusEmoji} Deal approval ${amountText ? `for ${amountText}` : ''} is ${request.status}`
    }
  };
}

export default async function PublicRequestPage({ params }: SharePageProps) {
  const { token } = params;

  // Fetch request by share token (no auth required)
  const request = await getRequestByShareToken(token);

  // Handle invalid or revoked links
  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-[18px] shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[#ff3b30]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">Link Not Found</h1>
            <p className="text-[#86868b] mb-6">
              This share link is invalid, has been revoked, or the request has been deleted.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-[#86868b]">
                If you think this is an error, please contact the person who shared this link with you.
              </p>
              <div className="pt-4 mt-6 border-t border-gray-200">
                <p className="text-xs text-[#86868b] mb-3">Want to create approval workflows for your team?</p>
                <a
                  href="https://dealpress.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0071e3] text-white font-semibold rounded-full hover:bg-[#0077ed] transition-all text-sm"
                >
                  Get DealPress
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Increment view count (fire and forget - don't block rendering)
  incrementShareViewCount(token).catch(err => {
    console.error('Failed to increment view count:', err);
  });

  return (
    <>
      {/* Banner for authenticated users viewing their own public link */}
      {/* TODO: Add auth check and show banner if user is logged in and owns this request */}

      <RequestTimelinePublic request={request} />
    </>
  );
}
