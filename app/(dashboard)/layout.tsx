import Sidebar from "@/components/Sidebar";
import { getUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-[#f5f5f7]">
      <Sidebar user={profile} />
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
