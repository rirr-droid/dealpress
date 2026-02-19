"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SlackIntegrationCardProps {
  organization: {
    id: string;
    name: string;
    slack_enabled: boolean;
    slack_workspace_id: string | null;
    subscription_tier: string;
  } | null;
  isAdmin: boolean;
}

export function SlackIntegrationCard({ organization, isAdmin }: SlackIntegrationCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check for OAuth callback status
  const slackStatus = searchParams.get('slack');
  const slackMessage = searchParams.get('message');

  const isPro = organization?.subscription_tier === 'pro' || organization?.subscription_tier === 'enterprise';
  const isConnected = organization?.slack_enabled && organization?.slack_workspace_id;

  const handleConnectSlack = () => {
    if (!organization) return;

    setIsConnecting(true);

    // Slack OAuth URL
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/api/slack/oauth`;
    const scopes = [
      'chat:write',
      'im:write',
      'users:read',
      'users:read.email',
      'channels:read',
    ].join(',');

    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${organization.id}`;

    window.location.href = slackAuthUrl;
  };

  const handleDisconnectSlack = async () => {
    if (!organization || !confirm('Are you sure you want to disconnect Slack? You will stop receiving notifications.')) {
      return;
    }

    setIsDisconnecting(true);

    try {
      const response = await fetch('/api/slack/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: organization.id,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to disconnect Slack. Please try again.');
      }
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
      alert('Failed to disconnect Slack. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="p-6 rounded-[18px] border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-50 rounded-lg">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#36C5F0"/>
            <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#2EB67D"/>
            <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#ECB22E"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Slack Integration</h3>
            {isConnected && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
            {!isPro && (
              <Badge variant="default" className="bg-[#0071e3] text-white">
                Pro Feature
              </Badge>
            )}
          </div>

          <p className="text-sm text-[#86868b] mb-4">
            Get approval notifications in Slack with one-click approve/reject buttons
          </p>

          {/* Status Messages */}
          {slackStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <p className="text-sm text-green-800">
                Slack connected successfully! You'll now receive approval notifications.
              </p>
            </div>
          )}

          {slackStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">
                Failed to connect Slack: {slackMessage || 'Unknown error'}
              </p>
            </div>
          )}

          {slackStatus === 'cancelled' && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5" />
              <p className="text-sm text-gray-800">
                Slack connection was cancelled.
              </p>
            </div>
          )}

          {/* Connection Status */}
          {isConnected && organization && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-900">
                <strong>Workspace:</strong> {organization.slack_workspace_id}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Approvers will receive DMs when they're assigned to approve requests
              </p>
            </div>
          )}

          {/* Benefits */}
          {!isConnected && isPro && (
            <div className="mb-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#1d1d1f]">
                  <strong>3x faster approvals</strong> - Approve deals without leaving Slack
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#1d1d1f]">
                  <strong>Instant notifications</strong> - Get DMs the moment approval is needed
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#1d1d1f]">
                  <strong>One-click actions</strong> - Approve or reject with a single button
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isPro && (
              <Button
                asChild
                className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
              >
                <a href="/settings/billing">
                  Upgrade to Pro
                </a>
              </Button>
            )}

            {isPro && !isConnected && isAdmin && (
              <Button
                onClick={handleConnectSlack}
                disabled={isConnecting}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z"/>
                </svg>
                {isConnecting ? 'Connecting...' : 'Connect Slack'}
              </Button>
            )}

            {isPro && isConnected && isAdmin && (
              <Button
                onClick={handleDisconnectSlack}
                disabled={isDisconnecting}
                variant="outline"
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect Slack'}
              </Button>
            )}

            {isPro && !isAdmin && (
              <p className="text-sm text-[#86868b] italic">
                Contact your admin to connect Slack
              </p>
            )}
          </div>

          {/* Learn More */}
          {!isConnected && (
            <a
              href="https://docs.dealpress.com/slack"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#0071e3] hover:underline mt-3"
            >
              Learn more about Slack integration
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
