import { Suspense } from "react";
import { AcceptInvitationContent } from "@/components/accept-invitation/AcceptInvitationContent";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full rounded-[24px] border border-gray-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#0071e3] animate-spin" />
          <p className="text-[#86868b]">Loading invitation...</p>
        </div>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
