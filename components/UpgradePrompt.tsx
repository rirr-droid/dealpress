"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2 } from "lucide-react";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export default function UpgradePrompt({
  open,
  onOpenChange,
  message,
}: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      setIsLoading(false);
    }
  };

  const defaultMessage =
    message || 'Upgrade to Pro to unlock unlimited requests, templates, and up to 50 team members.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#0071e3]" />
            </div>
            <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            {defaultMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gradient-to-br from-[#0071e3]/5 to-[#0071e3]/10 rounded-xl p-6 border border-[#0071e3]/20">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-[#1d1d1f]">$10</span>
              <span className="text-[#86868b]">/month</span>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">
                  <strong>Unlimited</strong> approval requests
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">
                  <strong>Unlimited</strong> approval templates
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">
                  Up to <strong>50 team members</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#1d1d1f]">Priority email support</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-full"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Upgrade Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
