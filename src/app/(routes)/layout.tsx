import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/session";

import { AppSidebar } from "./_components/app-sidebar";
import { MobileNav } from "./_components/mobile-nav";
import { TopBar } from "./_components/topbar";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  const topBarUser = {
    name: session.user.name,
    cpf: session.user.cpf,
    phoneNumber: session.user.phoneNumber,
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-none">
        <AppSidebar />
      </Sidebar>

      <SidebarInset className="bg-background flex min-h-screen flex-1 flex-col p-2">
        <TopBar user={topBarUser} />
        <div className="bg-background border-secondary flex-1 overflow-auto rounded-lg border shadow-md pb-16 lg:pb-0">
          {children}
        </div>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
