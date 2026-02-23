import { getUserOrganization } from "@/lib/auth";
import { getUsage } from "@/lib/billing/usage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Zap, Users, FileText, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";
import BillingActions from "@/components/BillingActions";

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const organization = await getUserOrganization();

  if (!organization) {
    redirect('/login');
  }

  const usage = await getUsage(organization.id);
  const isPro = usage.plan === 'pro';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">Billing & Usage</h1>
        <p className="text-[#86868b]">Manage your subscription and track usage</p>
      </div>

      {/* Current Plan */}
      <Card className="p-6 rounded-[18px] border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">Current Plan</h2>
              <Badge className={isPro ? "bg-[#0071e3] text-white" : "bg-gray-200 text-[#1d1d1f]"}>
                {isPro ? 'Pro' : 'Free'}
              </Badge>
              {usage.status !== 'active' && (
                <Badge className="bg-[#ff9500] text-white">
                  {usage.status}
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#86868b]">
              {isPro
                ? 'Unlimited requests, templates, and users'
                : '5 requests/month, unlimited templates, 1 user'}
            </p>
          </div>
        </div>

        <BillingActions
          isPro={isPro}
          subscriptionStatus={usage.status}
          stripeCustomerId={organization.stripe_customer_id}
        />
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Requests */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0071e3]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Requests This Month</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {usage.requestsUsed}
                {usage.requestsLimit !== -1 && (
                  <span className="text-sm text-[#86868b] font-normal">
                    {' '}/ {usage.requestsLimit}
                  </span>
                )}
              </p>
            </div>
          </div>
          {usage.requestsLimit !== -1 && (
            <>
              <Progress
                value={(usage.requestsUsed / usage.requestsLimit) * 100}
                className="h-2 mb-2"
              />
              <p className="text-xs text-[#86868b]">
                {usage.requestsLimit - usage.requestsUsed} remaining
              </p>
            </>
          )}
          {usage.requestsLimit === -1 && (
            <p className="text-xs text-[#86868b]">Unlimited</p>
          )}
        </Card>

        {/* Templates */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#34c759]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#34c759]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Active Templates</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {usage.templatesUsed}
                {usage.templatesLimit !== -1 && (
                  <span className="text-sm text-[#86868b] font-normal">
                    {' '}/ {usage.templatesLimit}
                  </span>
                )}
              </p>
            </div>
          </div>
          {usage.templatesLimit !== -1 && (
            <>
              <Progress
                value={(usage.templatesUsed / usage.templatesLimit) * 100}
                className="h-2 mb-2"
              />
              <p className="text-xs text-[#86868b]">
                {usage.templatesLimit - usage.templatesUsed} remaining
              </p>
            </>
          )}
          {usage.templatesLimit === -1 && (
            <p className="text-xs text-[#86868b]">Unlimited</p>
          )}
        </Card>

        {/* Users */}
        <Card className="p-6 rounded-[18px] border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#ff9500]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#ff9500]" />
            </div>
            <div>
              <p className="text-sm text-[#86868b]">Team Members</p>
              <p className="text-2xl font-bold text-[#1d1d1f]">
                {usage.usersCount}
                {usage.usersLimit !== -1 && (
                  <span className="text-sm text-[#86868b] font-normal">
                    {' '}/ {usage.usersLimit}
                  </span>
                )}
              </p>
            </div>
          </div>
          {usage.usersLimit !== -1 ? (
            <>
              <Progress
                value={(usage.usersCount / usage.usersLimit) * 100}
                className="h-2 mb-2"
              />
              <p className="text-xs text-[#86868b]">
                {usage.usersLimit - usage.usersCount} remaining
              </p>
            </>
          ) : (
            <p className="text-xs text-[#86868b]">Unlimited</p>
          )}
        </Card>
      </div>

      {/* Pricing Comparison */}
      {!isPro && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="p-6 rounded-[18px] border-2 border-gray-200">
            <Badge className="mb-4 bg-gray-200 text-[#1d1d1f]">Current Plan</Badge>
            <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Free</h3>
            <p className="text-3xl font-bold text-[#1d1d1f] mb-6">
              $0<span className="text-lg text-[#86868b] font-normal">/month</span>
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">5 approval requests per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">Unlimited templates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">1 user</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">Email notifications</span>
              </li>
            </ul>
          </Card>

          {/* Pro Plan */}
          <Card className="p-6 rounded-[18px] border-2 border-[#0071e3] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#0071e3] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>
            <Badge className="mb-4 bg-[#0071e3] text-white">Upgrade</Badge>
            <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Pro</h3>
            <p className="text-3xl font-bold text-[#1d1d1f] mb-6">
              $10<span className="text-lg text-[#86868b] font-normal">/month</span>
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f] font-medium">
                  Unlimited approval requests
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f] font-medium">Unlimited templates</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f] font-medium">Unlimited users</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f] font-medium">Slack integration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f] font-medium">SLA tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f] font-medium">
                  Analytics dashboard
                </span>
              </li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
