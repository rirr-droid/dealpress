"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Sparkles, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    href: string;
  };
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  onDismiss?: () => void;
}

export default function OnboardingChecklist({ steps, onDismiss }: OnboardingChecklistProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const completedCount = steps.filter(s => s.completed).length;
  const totalCount = steps.length;
  const progress = (completedCount / totalCount) * 100;
  const isComplete = completedCount === totalCount;

  useEffect(() => {
    // Check if user previously dismissed
    const isDismissed = localStorage.getItem('onboarding_dismissed');
    if (isDismissed) {
      setDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('onboarding_dismissed', 'true');
    setIsVisible(false);
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6 border-2 border-[#0071e3] bg-gradient-to-br from-blue-50 to-white relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0071e3] opacity-5 rounded-full -mr-16 -mt-16"></div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-1">
                {isComplete ? "You're all set! 🎉" : "Get Started with DealPress"}
              </h3>
              <p className="text-sm text-[#86868b]">
                {isComplete
                  ? "You've completed the onboarding. Start approving deals!"
                  : `Complete these steps to unlock the full power of DealPress`}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#1d1d1f]">
                {completedCount} of {totalCount} completed
              </span>
              <Badge
                variant="secondary"
                className={`${
                  isComplete
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-blue-100 text-blue-700 border-blue-200"
                }`}
              >
                {Math.round(progress)}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-[#0071e3] to-[#0077ed] h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                  step.completed
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-gray-200 hover:border-[#0071e3]"
                }`}
              >
                {/* Checkbox Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#86868b]" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-semibold mb-1 ${
                      step.completed ? "text-green-900 line-through" : "text-[#1d1d1f]"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#86868b]">{step.description}</p>
                </div>

                {/* Action Button */}
                {!step.completed && step.action && (
                  <Link href={step.action.href}>
                    <Button
                      size="sm"
                      className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs"
                    >
                      {step.action.label}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Completion Message */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg text-center"
            >
              <p className="text-sm font-medium text-green-900 mb-2">
                Great work! You've completed the onboarding.
              </p>
              <Button
                onClick={handleDismiss}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full text-sm"
              >
                Continue to Dashboard
              </Button>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
