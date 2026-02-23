"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, CreditCard } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BillingActionsProps {
  currentPlan: string;
  subscriptionStatus: string;
  stripeCustomerId?: string | null;
}

export default function BillingActions({
  currentPlan,
  subscriptionStatus,
  stripeCustomerId,
}: BillingActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isPaidPlan = ['professional', 'business', 'enterprise'].includes(currentPlan);

  const handleManageBilling = async () => {
    if (!stripeCustomerId) {
      toast({
        title: 'Error',
        description: 'No billing information found',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create billing portal session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open billing portal',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Starter plan shows nothing here - PricingCards component handles upgrades
  if (currentPlan === 'starter') {
    return null;
  }

  if (subscriptionStatus === 'past_due') {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-[#ff3b30]/10 border border-[#ff3b30] rounded-lg">
          <p className="text-sm text-[#ff3b30] font-medium">
            Your payment failed. Please update your payment method to continue using Pro features.
          </p>
        </div>
        <Button
          onClick={handleManageBilling}
          disabled={isLoading}
          className="bg-[#ff3b30] hover:bg-[#ff2d20] text-white rounded-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Update Payment Method
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleManageBilling}
        disabled={isLoading}
        variant="outline"
        className="rounded-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Billing
          </>
        )}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="rounded-full text-[#ff3b30] border-[#ff3b30] hover:bg-[#ff3b30] hover:text-white">
            Cancel Subscription
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Pro Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose access to Pro features at the end of your billing period. You can
              resubscribe at any time.
              <br />
              <br />
              <strong>What you will lose:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {currentPlan === 'professional' && (
                  <>
                    <li>50 approval requests/month (back to 3/month)</li>
                    <li>Unlimited workflows (back to 1)</li>
                    <li>Up to 5 users (back to 1)</li>
                    <li>Visual workflow builder</li>
                    <li>Slack integration</li>
                  </>
                )}
                {currentPlan === 'business' && (
                  <>
                    <li>Unlimited approval requests (back to 3/month)</li>
                    <li>Unlimited workflows (back to 1)</li>
                    <li>Up to 15 users (back to 1)</li>
                    <li>Advanced analytics</li>
                    <li>SLA tracking</li>
                    <li>Custom branding</li>
                  </>
                )}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleManageBilling}
              className="bg-[#ff3b30] hover:bg-[#ff2d20]"
            >
              Continue to Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
