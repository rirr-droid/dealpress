"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Zap, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTrackConversion } from "@/hooks/use-track-conversion";

interface UsageCounterProps {
  subscriptionTier: string;
  requestsThisMonth: number;
  maxRequestsPerMonth: number;
  usageResetDate: string;
}

export default function UsageCounter({
  subscriptionTier,
  requestsThisMonth,
  maxRequestsPerMonth,
  usageResetDate,
}: UsageCounterProps) {
  const { trackUpgradeClick } = useTrackConversion();
  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
  const used = requestsThisMonth || 0;
  const limit = isPro ? Infinity : (maxRequestsPerMonth || 5);
  const remaining = isPro ? Infinity : Math.max(0, limit - used);
  const percentage = isPro ? 100 : Math.min(100, (used / limit) * 100);
  const isNearLimit = !isPro && used >= limit * 0.8; // 80% threshold
  const isAtLimit = !isPro && used >= limit;

  // Calculate days until reset
  const resetDate = new Date(usageResetDate);
  const now = new Date();
  const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`p-6 rounded-[18px] border-2 transition-all ${
      isAtLimit
        ? 'border-[#ff3b30] bg-gradient-to-br from-red-50 to-white'
        : isNearLimit
        ? 'border-[#ff9500] bg-gradient-to-br from-orange-50 to-white'
        : isPro
        ? 'border-[#34c759] bg-gradient-to-br from-green-50 to-white'
        : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
            Usage This Month
          </h3>
          <p className="text-xs text-[#86868b]">
            Approval requests
          </p>
        </div>
        {isPro ? (
          <Badge className="bg-gradient-to-r from-[#34c759] to-[#30d158] text-white border-0">
            Pro
          </Badge>
        ) : isAtLimit ? (
          <Badge className="bg-[#ff3b30] text-white border-0">
            Limit Reached
          </Badge>
        ) : isNearLimit ? (
          <Badge className="bg-[#ff9500] text-white border-0">
            {remaining} Left
          </Badge>
        ) : (
          <Badge variant="outline" className="border-gray-200">
            Free
          </Badge>
        )}
      </div>

      {isPro ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-[#1d1d1f]">Unlimited</p>
          </div>
          <p className="text-sm text-[#86868b]">
            {used} requests created this month
          </p>
          <div className="flex items-center gap-2 text-sm text-[#34c759]">
            <CheckCircle className="w-4 h-4" />
            <span>Full access to all features</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-4xl font-bold text-[#1d1d1f]">{used}</p>
              <p className="text-lg text-[#86868b]">of {limit}</p>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-[#86868b]">
              {remaining > 0 ? `${remaining} request${remaining !== 1 ? 's' : ''} remaining` : 'No requests remaining'}
            </span>
            <span className="text-[#86868b]">
              Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
            </span>
          </div>

          {isAtLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-3 border-t border-gray-200"
            >
              <p className="text-sm text-[#ff3b30] mb-3">
                You've reached your monthly limit. Upgrade to Pro for unlimited requests.
              </p>
              <Button
                onClick={() => trackUpgradeClick('usage_limit_dashboard')}
                className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </motion.div>
          )}

          {!isAtLimit && isNearLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-3 border-t border-gray-200"
            >
              <p className="text-sm text-[#ff9500] mb-3">
                You're running low on requests. Upgrade to Pro for unlimited access.
              </p>
              <Button
                onClick={() => trackUpgradeClick('usage_limit_dashboard')}
                variant="outline"
                className="w-full border-[#0071e3] text-[#0071e3] hover:bg-blue-50 rounded-full"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Pro Plan
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </Card>
  );
}
