import { getUserOrganization } from "@/lib/auth";
import { getActivityLogs, formatActionText, getActionStyle } from "@/lib/db/activity";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import {
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  Users,
  LayoutTemplate,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const dynamic = 'force-dynamic';

const iconMap = {
  FileText,
  CheckCircle,
  XCircle,
  Users,
  LayoutTemplate,
  MessageSquare,
  Activity,
};

export default async function ActivityPage() {
  const organization = await getUserOrganization();

  if (!organization) {
    redirect('/login');
  }

  const activityLogs = await getActivityLogs(organization.id, 100);

  // Group activities by date
  const groupedActivities = activityLogs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, typeof activityLogs>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Activity Feed</h1>
        <p className="text-[#86868b]">
          Recent activity and audit logs for your organization
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#0071e3]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Total Events</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">{activityLogs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#34c759]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Approvals</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {activityLogs.filter(log => log.action === 'step.approved').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#ff9500]/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#ff9500]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Team Actions</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {activityLogs.filter(log => log.action.startsWith('user.')).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#5856d6]/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#5856d6]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Requests</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {activityLogs.filter(log => log.action.startsWith('request.')).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([date, logs]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-gray-100 text-[#1d1d1f] font-semibold">
                {date}
              </Badge>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Activity Items */}
            <Card className="rounded-[18px] border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const style = getActionStyle(log.action);
                  const Icon = iconMap[style.icon as keyof typeof iconMap] || Activity;

                  return (
                    <div
                      key={log.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${style.color}15` }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: style.color }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={log.user?.avatar_url || undefined} />
                                <AvatarFallback className="bg-[#0071e3] text-white text-xs">
                                  {log.user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-semibold text-[#1d1d1f]">
                                {log.user?.name || log.user?.email || 'Unknown User'}
                              </span>
                            </div>
                            <span className="text-xs text-[#86868b] flex-shrink-0">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </span>
                          </div>

                          <p className="text-sm text-[#1d1d1f]">
                            {formatActionText(log.action, log.metadata)}
                          </p>

                          {/* Metadata Details */}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-[8px]">
                              <p className="text-xs font-semibold text-[#86868b] mb-2">Details</p>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(log.metadata)
                                  .filter(([key]) => !['deal_name', 'name', 'email'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key} className="text-xs">
                                      <span className="text-[#86868b]">{key}: </span>
                                      <span className="text-[#1d1d1f] font-medium">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        ))}

        {activityLogs.length === 0 && (
          <Card className="p-12 rounded-[18px] border border-gray-200 text-center">
            <Activity className="w-12 h-12 text-[#86868b] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">No activity yet</h3>
            <p className="text-sm text-[#86868b]">
              Activity will appear here as your team works with approval requests
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
