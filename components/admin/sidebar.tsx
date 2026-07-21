"use client";

import { Home, Newspaper, Gavel, LogOut, LayoutDashboard, Shield, ShoppingBag, Users, Server } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { title: "Foydalanuvchilar", icon: Users, href: "/admin/dashboard/users" },
    { title: "Serverlar", icon: Server, href: "/admin/dashboard/servers" },
    { title: "Do'kon", icon: ShoppingBag, href: "/admin/dashboard/shop" },
    { title: "Yangiliklar", icon: Newspaper, href: "/admin/dashboard/news" },
    { title: "Qoidalar", icon: Gavel, href: "/admin/dashboard/rules" },
    { title: "Jamoa", icon: Shield, href: "/admin/dashboard/staff" },
    { title: "Saytga qaytish", icon: Home, href: "/" },
  ];

  return (
    <Sidebar className="border-r border-white/10 bg-transparent text-white">
      <SidebarHeader className="p-5 border-b border-white/5 bg-white/[0.02]">
        <h2 className="text-xl font-black text-white italic tracking-tighter uppercase liquid-shadow">
          NEO<span className="text-purple-500">TERRA</span> <span className="text-xs font-normal not-italic text-zinc-500">ADM</span>
        </h2>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`h-11 rounded-xl font-bold tracking-wide transition-all duration-300 ${
                    isActive 
                      ? "bg-white/10 text-purple-400 border border-white/10 shadow-lg shadow-purple-950/20" 
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? "scale-110 text-purple-400" : "text-zinc-400"}`} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5 bg-white/[0.01]">
        <button
          onClick={() => logoutAction()}
          className="flex w-full items-center gap-3 rounded-xl p-3 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 font-bold transition-all duration-300 active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4 text-red-500/70" />
          <span>Chiqish</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
