import { getRequest } from "@/lib/db/requests";
import { getCurrentUser, getUserOrgId } from "@/lib/auth";
import { getUserRole } from "@/lib/auth/permissions";
import { getStepComments } from "@/lib/db/comments";
import { getAttachments } from "@/app/actions/attachments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RequestDetailClient from "@/components/RequestDetailClient";

export const dynamic = 'force-dynamic';

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const request = await getRequest(id);

  if (!request) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Request not found</h2>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Fetch comments for all steps
  const stepIds = request.steps?.map((step: { id: string }) => step.id) || [];
  const stepCommentsArray = await Promise.all(
    stepIds.map(async (stepId: string) => ({
      stepId,
      comments: await getStepComments(stepId),
    }))
  );

  // Convert to a Record<stepId, comments[]> for easy lookup
  const stepComments = stepCommentsArray.reduce((acc, item) => {
    acc[item.stepId] = item.comments;
    return acc;
  }, {} as Record<string, typeof stepCommentsArray[0]['comments']>);

  // Fetch attachments
  const attachmentsResult = await getAttachments(id);
  const attachments = attachmentsResult.data || [];

  // Check subscription tier for upload permission
  const orgId = await getUserOrgId();
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('subscription_tier')
    .eq('id', orgId)
    .single();

  const canUpload = org?.subscription_tier === 'pro' || org?.subscription_tier === 'enterprise';

  // Check if user is admin for delete permission
  const userRole = await getUserRole();
  const canDelete = userRole === 'admin';

  return (
    <RequestDetailClient
      request={request}
      currentUserId={user.id}
      stepComments={stepComments}
      attachments={attachments}
      canUpload={canUpload}
      canDelete={canDelete}
    />
  );
}
