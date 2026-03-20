import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav user={session.user} />
      <div className="flex-1 min-w-0">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
