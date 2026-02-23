import { Suspense } from "react";
import { SignupForm } from "@/components/SignupForm";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <Card className="p-8 rounded-[24px] border border-gray-200 shadow-lg">
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="w-8 h-8 text-[#0071e3] animate-spin" />
        <p className="text-[#86868b]">Loading...</p>
      </div>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupForm />
    </Suspense>
  );
}
