"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingCardsProps {
  currentPlan: string;
}

export default function PricingCards({ currentPlan }: PricingCardsProps) {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'professional' | 'business') => {
    setLoadingPlan(plan);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout',
        variant: 'destructive',
      });
      setLoadingPlan(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Starter - Current Plan */}
      <Card className="p-6 rounded-[18px] border-2 border-gray-200">
        <Badge className="mb-4 bg-gray-200 text-[#1d1d1f]">Current Plan</Badge>
        <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Starter</h3>
        <p className="text-4xl font-bold text-[#1d1d1f] mb-6">
          $0<span className="text-lg text-[#86868b] font-normal">/month</span>
        </p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f]">3 approval requests/month</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f]">1 workflow template</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f]">1 user</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f]">Email notifications</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#34c759] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f]">7-day data retention</span>
          </li>
        </ul>
        <Button disabled className="w-full rounded-full" variant="outline">
          Current Plan
        </Button>
      </Card>

      {/* Professional - Best Value */}
      <Card className="p-6 rounded-[18px] border-2 border-[#0071e3] relative overflow-hidden shadow-lg scale-105">
        <div className="absolute top-0 right-0 bg-[#0071e3] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
          MOST POPULAR
        </div>
        <Badge className="mb-4 bg-[#0071e3] text-white">Best Value</Badge>
        <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Professional</h3>
        <p className="text-4xl font-bold text-[#1d1d1f] mb-6">
          $49<span className="text-lg text-[#86868b] font-normal">/month</span>
        </p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">
              50 approval requests/month
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Unlimited workflows</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Up to 5 users</span>
          </li>
          <li className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Visual workflow builder</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Slack integration</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">1-year data retention</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Email support</span>
          </li>
        </ul>
        <Button
          onClick={() => handleUpgrade('professional')}
          disabled={loadingPlan !== null}
          className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
        >
          {loadingPlan === 'professional' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Upgrade to Professional'
          )}
        </Button>
      </Card>

      {/* Business - For Growing Teams */}
      <Card className="p-6 rounded-[18px] border-2 border-[#5856d6]">
        <Badge className="mb-4 bg-[#5856d6] text-white">For Growing Teams</Badge>
        <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Business</h3>
        <p className="text-4xl font-bold text-[#1d1d1f] mb-6">
          $99<span className="text-lg text-[#86868b] font-normal">/month</span>
        </p>
        <ul className="space-y-3 mb-6">
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">
              Unlimited approval requests
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Unlimited workflows</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Up to 15 users</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Advanced analytics</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">SLA tracking</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Custom branding</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Priority support</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-5 h-5 text-[#5856d6] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#1d1d1f] font-medium">Unlimited data retention</span>
          </li>
        </ul>
        <Button
          onClick={() => handleUpgrade('business')}
          disabled={loadingPlan !== null}
          className="w-full bg-[#5856d6] hover:bg-[#4c4ac7] text-white rounded-full"
        >
          {loadingPlan === 'business' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Upgrade to Business'
          )}
        </Button>
      </Card>
    </div>
  );
}
