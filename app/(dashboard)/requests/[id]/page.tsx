import { getRequest } from "@/lib/db/requests";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
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

  return <RequestDetailClient request={request} currentUserId={user.id} />;
}
