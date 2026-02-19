"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

// Prevent static generation since we use searchParams
export const dynamic = 'force-dynamic';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkInvitation();
  }, [token]);

  const checkInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // Fetch invitation details
      const { data: inv, error: invError } = await supabase
        .from('team_invitations')
        .select(`
          *,
          organizations (
            id,
            name
          )
        `)
        .eq('invitation_token', token)
        .is('accepted_at', null)
        .single();

      if (invError || !inv) {
        setError('Invitation not found or has expired');
        setLoading(false);
        return;
      }

      // Check if expired
      if (new Date(inv.expires_at) < new Date()) {
        setError('This invitation has expired');
        setLoading(false);
        return;
      }

      setInvitation(inv);
      setOrganization(inv.organizations);
      setLoading(false);
    } catch (err) {
      console.error('Error checking invitation:', err);
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Redirect to signup with invitation token
        router.push(`/signup?invitation=${token}`);
        return;
      }

      // Accept invitation using database function
      const { data, error } = await supabase.rpc('accept_team_invitation', {
        p_token: token,
        p_user_id: user.id,
      });

      if (error || !data?.success) {
        setError(data?.error || 'Failed to accept invitation');
        setAccepting(false);
        return;
      }

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full rounded-[24px] border border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#0071e3] animate-spin" />
            <p className="text-[#86868b]">Loading invitation...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 max-w-md w-full rounded-[24px] border border-red-200 bg-red-50">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Invalid Invitation</h1>
            <p className="text-[#86868b]">{error}</p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full mt-4"
            >
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 max-w-md w-full rounded-[24px] border border-green-200 bg-green-50">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1d1d1f]">Welcome to the team!</h1>
            <p className="text-[#86868b]">
              You've successfully joined <strong>{organization?.name}</strong>
            </p>
            <div className="flex items-center gap-2 text-sm text-green-700 mt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const roleLabel = invitation.role === 'admin' ? 'Administrator' : 'Member';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="p-8 max-w-lg w-full rounded-[24px] border border-gray-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0071e3]/10 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-[#0071e3]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">
            You're Invited! 🎉
          </h1>
          <p className="text-[#86868b]">
            Join <strong className="text-[#1d1d1f]">{organization?.name}</strong> on DealPress
          </p>
        </div>

        {/* Invitation Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#86868b]">Your Role</span>
            <span className="px-3 py-1 bg-[#0071e3] text-white text-sm font-medium rounded-full">
              {roleLabel}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#1d1d1f]">
              {invitation.role === 'admin' ? 'Admin Permissions:' : 'Member Permissions:'}
            </p>
            {invitation.role === 'admin' ? (
              <ul className="space-y-2 text-sm text-[#86868b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Manage team members and settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Create and edit approval templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>View all approval requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Approve or reject requests</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-[#86868b]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Submit approval requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Approve or reject requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>View requests you're involved in</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full h-12 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-base font-semibold mb-4"
        >
          {accepting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {isAuthenticated ? 'Accepting...' : 'Redirecting...'}
            </>
          ) : (
            <>
              {isAuthenticated ? 'Accept Invitation' : 'Sign Up & Accept'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Alternative Actions */}
        {!isAuthenticated && (
          <p className="text-center text-sm text-[#86868b]">
            Already have an account?{' '}
            <a
              href={`/login?invitation=${token}`}
              className="text-[#0071e3] hover:underline font-semibold"
            >
              Sign in
            </a>
          </p>
        )}

        {/* Expiration Notice */}
        <p className="text-xs text-center text-[#86868b] mt-6">
          This invitation expires on{' '}
          {new Date(invitation.expires_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </Card>
    </div>
  );
}
