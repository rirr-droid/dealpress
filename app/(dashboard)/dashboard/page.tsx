import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRequests, getPendingApprovalsForUser, getMySubmittedRequests, getDashboardMetrics, getCurrentStepName } from "@/lib/db/requests";
import { getCurrentUser } from "@/lib/auth";
import { getOnboardingProgress } from "@/app/actions/onboarding";
import OnboardingChecklist from "@/components/OnboardingChecklist";
import Link from "next/link";
import { Clock, CheckCircle, TrendingUp, FileText } from "lucide-react";

// Make this a server component
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null; // Will be caught by middleware
  }

  const requests = await getRequests();
  const myPendingApprovals = await getPendingApprovalsForUser(user.id);
  const mySubmittedRequests = await getMySubmittedRequests(user.id);
  const metrics = await getDashboardMetrics();
  const onboardingProgress = await getOnboardingProgress();

  // Build onboarding steps
  const onboardingSteps = [
    {
      id: 'install_template',
      title: 'Install your first template',
      description: 'Choose from 5 pre-built templates to get started instantly',
      completed: onboardingProgress.hasTemplate,
      action: { label: 'Browse Templates', href: '/templates' },
    },
    {
      id: 'create_request',
      title: 'Create your first approval request',
      description: 'Submit a deal for approval to see the workflow in action',
      completed: onboardingProgress.hasRequest,
      action: { label: 'Create Request', href: '/requests' },
    },
    {
      id: 'approve_request',
      title: 'Approve a request',
      description: 'Experience the one-click approval process',
      completed: onboardingProgress.hasApproval,
    },
    {
      id: 'invite_team',
      title: 'Invite your team',
      description: 'Add team members to collaborate on approvals',
      completed: onboardingProgress.hasInvitedTeam,
      action: { label: 'Invite Team', href: '/settings' },
    },
  ];

  const showOnboarding = onboardingSteps.some(step => !step.completed);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-[#ff9500] text-white">Pending</Badge>;
      case "approved":
        return <Badge className="bg-[#34c759] text-white">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-[#ff3b30] text-white">Rejected</Badge>;
      default:
        return <Badge>Draft</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-[#ff3b30]";
      case "high":
        return "border-l-[#ff9500]";
      case "normal":
        return "border-l-[#0071e3]";
      default:
        return "border-l-gray-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Dashboard</h1>
        <p className="text-[#86868b]">Welcome back, {user.name}</p>
      </div>

      {/* Onboarding Checklist */}
      {showOnboarding && (
        <OnboardingChecklist steps={onboardingSteps} />
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 rounded-[18px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-[#0071e3]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1d1d1f]">{metrics.totalRequests}</p>
          <p className="text-sm text-[#86868b]">Total Requests</p>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-[#ff9500]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1d1d1f]">{metrics.pendingApprovals}</p>
          <p className="text-sm text-[#86868b]">Pending Approvals</p>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#34c759]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1d1d1f]">{metrics.approvalRate}%</p>
          <p className="text-sm text-[#86868b]">Approval Rate</p>
        </Card>

        <Card className="p-6 rounded-[18px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-[#0071e3]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1d1d1f]">{metrics.avgApprovalTime}h</p>
          <p className="text-sm text-[#86868b]">Avg Approval Time</p>
        </Card>
      </div>

      {/* My Pending Approvals */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1d1d1f]">My Pending Approvals</h2>
          <Link href="/requests">
            <Button variant="outline" className="rounded-full">
              View All
            </Button>
          </Link>
        </div>

        {myPendingApprovals.length === 0 ? (
          <Card className="p-12 text-center rounded-[18px] border border-gray-200">
            <CheckCircle className="w-12 h-12 text-[#34c759] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">All caught up!</h3>
            <p className="text-[#86868b]">You have no pending approvals at the moment.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {myPendingApprovals.map((request) => {
              // Find the user's specific pending step
              const myPendingStep = request.steps?.find(
                (step: { approver_id: string; status: string }) =>
                  step.approver_id === user.id && step.status === 'pending'
              );

              return (
                <Link key={request.id} href={`/requests/${request.id}`}>
                  <Card className={`p-6 rounded-[18px] border-l-4 hover:shadow-md transition-all cursor-pointer ${getPriorityColor(request.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#1d1d1f]">
                            {request.deal_name}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#86868b] mb-3">
                          {request.deal_amount && (
                            <>
                              <span className="font-semibold text-[#1d1d1f]">
                                ${request.deal_amount.toLocaleString()}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          {myPendingStep && (
                            <span className="font-medium text-[#0071e3]">
                              {(myPendingStep as { step_name: string }).step_name}
                            </span>
                          )}
                        </div>
                        {request.reason && (
                          <p className="text-sm text-[#86868b] mb-3">{request.reason}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#ff9500]" />
                          <p className="text-xs text-[#86868b]">
                            Submitted {request.submitted_at && new Date(request.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
                        Review
                      </Button>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* My Submitted Requests */}
      <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1d1d1f]">
              My Submitted Requests
              <span className="text-sm text-[#86868b] ml-2">({mySubmittedRequests.length})</span>
            </h2>
            <Link href="/requests">
              <Button variant="outline" className="rounded-full">
                View All
              </Button>
            </Link>
          </div>

          {mySubmittedRequests.length === 0 ? (
            <Card className="p-12 text-center rounded-[18px] border border-gray-200">
              <p className="text-[#86868b]">You haven't submitted any requests yet.</p>
              <p className="text-xs text-[#86868b] mt-2">User ID: {user.id}</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {mySubmittedRequests.map((request) => {
              const currentStepName = getCurrentStepName(request);

              return (
                <Link key={request.id} href={`/requests/${request.id}`}>
                  <Card className={`p-6 rounded-[18px] border-l-4 hover:shadow-md transition-all cursor-pointer ${getPriorityColor(request.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-[#1d1d1f]">
                            {request.deal_name}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#86868b] mb-3">
                          {request.deal_amount && (
                            <>
                              <span className="font-semibold text-[#1d1d1f]">
                                ${request.deal_amount.toLocaleString()}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          {currentStepName && <span>Currently at: {currentStepName}</span>}
                        </div>
                        {request.reason && (
                          <p className="text-sm text-[#86868b] mb-3">{request.reason}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#ff9500]" />
                          <p className="text-xs text-[#86868b]">
                            Submitted {request.submitted_at && new Date(request.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full">
                        Track Progress
                      </Button>
                    </div>
                  </Card>
                </Link>
              );
            })}
            </div>
          )}
        </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {requests.slice(0, 5).map((request) => (
            <Link key={request.id} href={`/requests/${request.id}`}>
              <Card className="p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">
                        {request.deal_name}
                      </h4>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-xs text-[#86868b] mt-1">
                      {request.deal_amount && `$${request.deal_amount.toLocaleString()} • `}
                      {request.requester?.name}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
