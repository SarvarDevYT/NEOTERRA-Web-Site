import { isAuthenticated } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    redirect("/admin");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-zinc-950 text-white">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <SidebarTrigger className="mb-4" />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
