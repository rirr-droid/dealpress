import { getUserOrganization } from "@/lib/auth";
import { getTeamMembers } from "@/lib/db/team";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import InviteUserDialog from "@/components/InviteUserDialog";
import TeamMemberActions from "@/components/TeamMemberActions";
import { Users, Crown, User } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const organization = await getUserOrganization();

  if (!organization) {
    redirect('/login');
  }

  const members = await getTeamMembers(organization.id);

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge className="bg-[#0071e3] text-white">
          <Crown className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-200 text-[#1d1d1f]">
        <User className="w-3 h-3 mr-1" />
        Member
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Team Members</h1>
          <p className="text-[#86868b]">
            Manage your team and roles ({members.length} member{members.length !== 1 ? 's' : ''})
          </p>
        </div>
        <InviteUserDialog />
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#0071e3]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Total Members</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">{members.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-[#0071e3]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Admins</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {members.filter(m => m.role === 'admin').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#34c759]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Members</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {members.filter(m => m.role === 'member').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="rounded-[18px] border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1d1d1f]">All Members</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.user_id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-[#0071e3] text-white">
                      {member.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#1d1d1f]">
                        {member.user?.name}
                      </h3>
                      {getRoleBadge(member.role)}
                    </div>
                    <p className="text-sm text-[#86868b]">{member.user?.email}</p>
                    {member.job_title && (
                      <p className="text-sm text-[#86868b] mt-1">{member.job_title}</p>
                    )}
                  </div>
                </div>

                <TeamMemberActions
                  memberId={member.user_id}
                  memberName={member.user?.name || 'User'}
                  role={member.role}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Team Roles Info */}
      <Card className="p-6 rounded-[18px] border border-gray-200 bg-blue-50">
        <h3 className="text-lg font-semibold text-[#1d1d1f] mb-3">Team Roles</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">Admin</p>
              <p className="text-sm text-[#86868b]">
                Full access to all features including team management, billing, and organization settings
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-[#86868b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">Member</p>
              <p className="text-sm text-[#86868b]">
                Can create and approve requests, but cannot manage team members or billing
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
