"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  Crown,
  User,
  MoreVertical,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Shield,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface TeamManagementProps {
  organization: any;
  members: any[];
  pendingInvitations: any[];
  currentUserRole: string;
  currentUserId: string;
}

export function TeamManagement({
  organization,
  members,
  pendingInvitations,
  currentUserRole,
  currentUserId,
}: TeamManagementProps) {
  const router = useRouter();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin = currentUserRole === "admin";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          organizationId: organization.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setShowInviteForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;

    try {
      const response = await fetch("/api/team/cancel-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invitationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel invitation");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel invitation");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const response = await fetch("/api/team/remove-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          organizationId: organization.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch("/api/team/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId,
          organizationId: organization.id,
          newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Success</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-600 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Team Members */}
      <Card className="p-6 rounded-[18px] border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Team Members</h2>
            <p className="text-sm text-[#86868b]">
              {members.length} {members.length === 1 ? "member" : "members"}
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <form onSubmit={handleInvite} className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  className="h-10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] mb-2">
                  Role
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setInviteRole("member")}
                    className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                      inviteRole === "member"
                        ? "border-[#0071e3] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Member</span>
                    </div>
                    <p className="text-xs text-[#86868b] mt-1 text-left">
                      Can submit and approve requests
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInviteRole("admin")}
                    className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                      inviteRole === "admin"
                        ? "border-[#0071e3] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-medium">Admin</span>
                    </div>
                    <p className="text-xs text-[#86868b] mt-1 text-left">
                      Full access to settings
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail("");
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member) => {
            const profile = member.user_profiles;
            const isCurrentUser = member.user_id === currentUserId;

            return (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-[#0071e3] font-semibold">
                      {profile?.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#1d1d1f] truncate">
                      {profile?.name || "Unknown User"}
                    </p>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#86868b] truncate">{profile?.email}</p>
                </div>

                {/* Role Badge */}
                <Badge
                  variant="default"
                  className={
                    member.role === "admin"
                      ? "bg-[#0071e3] text-white"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {member.role === "admin" ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      Member
                    </>
                  )}
                </Badge>

                {/* Actions */}
                {isAdmin && !isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === "member" && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, "admin")}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Promote to Admin
                        </DropdownMenuItem>
                      )}
                      {member.role === "admin" && (
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, "member")}
                        >
                          <User className="w-4 h-4 mr-2" />
                          Change to Member
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pending Invitations */}
      {isAdmin && pendingInvitations.length > 0 && (
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#1d1d1f]">Pending Invitations</h2>
            <p className="text-sm text-[#86868b]">
              {pendingInvitations.length}{" "}
              {pendingInvitations.length === 1 ? "invitation" : "invitations"} pending
            </p>
          </div>

          <div className="space-y-3">
            {pendingInvitations.map((invitation) => {
              const inviter = invitation.user_profiles;
              const isExpired = new Date(invitation.expires_at) < new Date();

              return (
                <div
                  key={invitation.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d1d1f] truncate">
                      {invitation.email}
                    </p>
                    <p className="text-xs text-[#86868b]">
                      Invited by {inviter?.name || inviter?.email} •{" "}
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Role Badge */}
                  <Badge variant="outline">
                    {invitation.role === "admin" ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Member
                      </>
                    )}
                  </Badge>

                  {/* Status */}
                  {isExpired ? (
                    <Badge variant="destructive">
                      <Clock className="w-3 h-3 mr-1" />
                      Expired
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}

                  {/* Cancel Button */}
                  <Button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Permissions Info */}
      <Card className="p-6 rounded-[18px] border border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0071e3] mb-2">Role Permissions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#1d1d1f]">
              <div>
                <p className="font-medium mb-1">Admin can:</p>
                <ul className="space-y-1 text-[#86868b]">
                  <li>• Manage team members and invitations</li>
                  <li>• Configure organization settings</li>
                  <li>• Create and edit approval templates</li>
                  <li>• View all approval requests</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Member can:</p>
                <ul className="space-y-1 text-[#86868b]">
                  <li>• Submit approval requests</li>
                  <li>• Approve or reject assigned requests</li>
                  <li>• View requests they're involved in</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
